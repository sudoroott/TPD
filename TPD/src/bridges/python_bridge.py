import sys
import json
import importlib
import traceback

def log(msg):
    sys.stderr.write(str(msg) + "\n")
    sys.stderr.flush()

modules = {}

def process_command(cmd):
    try:
        command = cmd.get('command')
        cmd_id = cmd.get('id')
        
        if command == 'import':
            module_name = cmd.get('module')
            log(f"Importing {module_name}...")
            modules[module_name] = importlib.import_module(module_name)
            return {'id': cmd_id, 'status': 'success'}
            
        elif command == 'call':
            module_name = cmd.get('module')
            func_name = cmd.get('function')
            args = cmd.get('args', [])
            
            if module_name not in modules:
                return {'id': cmd_id, 'status': 'error', 'error': f"Module {module_name} not imported"}
                
            module = modules[module_name]
            
            # Nesne erişimi (örn: math.pi veya numpy.array)
            parts = func_name.split('.')
            obj = module
            for part in parts:
                obj = getattr(obj, part)
                
            if callable(obj):
                result = obj(*args)
            else:
                result = obj
                
            # Basit tipleri döndürelim, karmaşık olanları string yapalım
            if not isinstance(result, (int, float, str, bool, type(None), list, dict)):
                result = str(result)
                
            return {'id': cmd_id, 'status': 'success', 'result': result}
            
        else:
            return {'id': cmd_id, 'status': 'error', 'error': 'Unknown command'}
            
    except Exception as e:
        log(f"Error: {e}")
        return {'id': cmd_id, 'status': 'error', 'error': str(e)}

def main():
    log("Python bridge started")
    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break
                
            cmd = json.loads(line)
            response = process_command(cmd)
            
            sys.stdout.write(json.dumps(response) + "\n")
            sys.stdout.flush()
            
        except json.JSONDecodeError:
            continue
        except Exception as e:
            log(f"Fatal error: {e}")
            break

if __name__ == '__main__':
    main()
