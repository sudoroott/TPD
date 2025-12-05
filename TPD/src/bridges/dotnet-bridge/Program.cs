using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text.Json;
using System.IO;
using System.Linq;

namespace DilDotNetBridge
{
    class Program
    {
        static Dictionary<string, object> _loadedModules = new Dictionary<string, object>();

        static void Main(string[] args)
        {
            while (true)
            {
                try
                {
                    string line = Console.ReadLine();
                    if (string.IsNullOrEmpty(line)) break;

                    var command = JsonSerializer.Deserialize<JsonElement>(line);
                    var response = ProcessCommand(command);

                    Console.WriteLine(JsonSerializer.Serialize(response));
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"Bridge Hatası: {ex.Message}");
                }
            }
        }

        static Dictionary<string, object> ProcessCommand(JsonElement cmd)
        {
            string type = cmd.GetProperty("command").GetString();
            int id = cmd.GetProperty("id").GetInt32();
            var response = new Dictionary<string, object> { { "id", id } };

            try
            {
                if (type == "import")
                {
                    string moduleName = cmd.GetProperty("module").GetString();

                    Type t = Type.GetType(moduleName);
                    if (t == null)
                    {
                        foreach (var assembly in AppDomain.CurrentDomain.GetAssemblies())
                        {
                            t = assembly.GetType(moduleName);
                            if (t != null) break;
                        }
                    }

                    if (t == null) t = Type.GetType($"System.{moduleName}");

                    if (t != null)
                    {
                        _loadedModules[moduleName] = t; // Statik metodlar için Type sakla
                        response["status"] = "success";
                    }
                    else
                    {
                        response["status"] = "error";
                        response["error"] = $"Tip bulunamadı: {moduleName}";
                    }
                }
                else if (type == "call")
                {
                    string moduleName = cmd.GetProperty("module").GetString();
                    string funcName = cmd.GetProperty("function").GetString();
                    var argsElement = cmd.GetProperty("args");

                    if (!_loadedModules.ContainsKey(moduleName))
                    {
                        response["status"] = "error";
                        response["error"] = "Modül yüklenmedi";
                        return response;
                    }

                    Type typeObj = _loadedModules[moduleName] as Type;

                    object[] args = new object[argsElement.GetArrayLength()];
                    int i = 0;
                    foreach (var arg in argsElement.EnumerateArray())
                    {
                        if (arg.ValueKind == JsonValueKind.Number)
                        {
                            if (arg.TryGetInt32(out int iVal) && Math.Abs(iVal - arg.GetDouble()) < 0.0001)
                                args[i] = iVal;
                            else
                                args[i] = arg.GetDouble();
                        }
                        else if (arg.ValueKind == JsonValueKind.String)
                            args[i] = arg.GetString();
                        else if (arg.ValueKind == JsonValueKind.True)
                            args[i] = true;
                        else if (arg.ValueKind == JsonValueKind.False)
                            args[i] = false;

                        i++;
                    }

                    var flags = BindingFlags.Public | BindingFlags.Static | BindingFlags.IgnoreCase;

                    MethodInfo method = null;
                    try
                    {
                        method = typeObj.GetMethod(funcName, flags);
                    }
                    catch (AmbiguousMatchException)
                    {
                        // Parametre tiplerine en uygun olanı bul
                        var methods = typeObj.GetMethods(flags)
                            .Where(m => m.Name.Equals(funcName, StringComparison.OrdinalIgnoreCase) &&
                                        m.GetParameters().Length == args.Length);

                        foreach (var m in methods)
                        {
                            bool match = true;
                            var p = m.GetParameters();
                            for (int k = 0; k < p.Length; k++)
                            {
                                try
                                {
                                    Convert.ChangeType(args[k], p[k].ParameterType);
                                }
                                catch
                                {
                                    match = false; break;
                                }
                            }
                            if (match)
                            {
                                method = m;
                                break;
                            }
                        }

                        // Hala bulamadıysa ilki al
                        if (method == null) method = methods.FirstOrDefault();
                    }

                    if (method == null)
                    {
                        PropertyInfo prop = typeObj.GetProperty(funcName, flags);
                        if (prop != null)
                        {
                            object result = prop.GetValue(null);
                            response["status"] = "success";
                            response["result"] = result;
                            return response;
                        }

                        FieldInfo field = typeObj.GetField(funcName, flags);
                        if (field != null)
                        {
                            object result = field.GetValue(null);
                            response["status"] = "success";
                            response["result"] = result;
                            return response;
                        }

                        response["status"] = "error";
                        response["error"] = $"Metod veya özellik bulunamadı: {funcName}";
                    }
                    else
                    {
                        ParameterInfo[] parameters = method.GetParameters();
                        object[] finalArgs = new object[parameters.Length];

                        for (int j = 0; j < parameters.Length; j++)
                        {
                            if (j < args.Length)
                                finalArgs[j] = Convert.ChangeType(args[j], parameters[j].ParameterType);
                            else if (parameters[j].HasDefaultValue)
                                finalArgs[j] = parameters[j].DefaultValue;
                        }

                        object result = method.Invoke(null, finalArgs);
                        response["status"] = "success";
                        response["result"] = result;
                    }
                }
            }
            catch (Exception ex)
            {
                response["status"] = "error";
                response["error"] = ex.Message;
            }

            return response;
        }
    }
}
