/**
 * Dil - Türkçe Programlama Dili
 * Interpreter - AST'yi çalıştırır
 */

import { NodeType } from './parser.js';
import { TokenType } from './lexer.js';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { PythonBridge } from './bridges/python.js';
import { DotNetBridge } from './bridges/dotnet.js';
import stdlib from './stdlib/index.js';

export class Environment {
  constructor(parent = null) {
    this.parent = parent;
    this.variables = new Map();
  }
  
  define(name, value) {
    this.variables.set(name, value);
  }
  
  get(name) {
    if (this.variables.has(name)) {
      return this.variables.get(name);
    }
    if (this.parent) {
      return this.parent.get(name);
    }
    throw new Error(`Tanımsız değişken: ${name}`);
  }
  
  set(name, value) {
    if (this.variables.has(name)) {
      this.variables.set(name, value);
      return;
    }
    if (this.parent) {
      this.parent.set(name, value);
      return;
    }
    throw new Error(`Tanımsız değişken: ${name}`);
  }
  
  has(name) {
    return this.variables.has(name) || (this.parent && this.parent.has(name));
  }
}

class BreakException extends Error {
  constructor() {
    super('break');
    this.name = 'BreakException';
  }
}

class ContinueException extends Error {
  constructor() {
    super('continue');
    this.name = 'ContinueException';
  }
}

class ReturnException extends Error {
  constructor(value) {
    super('return');
    this.name = 'ReturnException';
    this.value = value;
  }
}

export class Interpreter {
  constructor(cwd = process.cwd(), isSafeMode = false) {
    this.globalEnv = new Environment();
    this.cwd = cwd;
    this.isSafeMode = isSafeMode; // Güvenlik Modu
    this.instructionCount = 0; // DoS Koruması
    this.MAX_INSTRUCTIONS = 10000000;
    this.exports = {};
    this.callCounts = new Map(); // JIT Profiling
    this.setupBuiltins();
  }
  
  setupBuiltins() {
    // Built-in functions
    this.globalEnv.define('yaz', (...args) => {
      console.log(...args.map(arg => this.stringify(arg)));
      return null;
    });
    
    this.globalEnv.define('oku', () => {
      return new Promise((resolve) => {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        rl.question('', (answer) => {
          rl.close();
          resolve(answer);
        });
      });
    });
    
    // Math functions
    this.globalEnv.define('matematik', {
      pi: Math.PI,
      e: Math.E,
      karekök: Math.sqrt,
      üs: Math.pow,
      mutlak: Math.abs,
      yuvarla: Math.round,
      taban: Math.floor,
      tavan: Math.ceil,
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      rastgele: Math.random,
    });
    
    // String functions
    this.globalEnv.define('metin', {
      uzunluk: (str) => str.length,
      büyükHarf: (str) => str.toUpperCase(),
      küçükHarf: (str) => str.toLowerCase(),
      böl: (str, sep) => str.split(sep),
      birleştir: (arr, sep) => arr.join(sep),
      içerir: (str, substr) => str.includes(substr),
      başlar: (str, prefix) => str.startsWith(prefix),
      biter: (str, suffix) => str.endsWith(suffix),
    });
    
    // Array functions
    this.globalEnv.define('dizi', {
      uzunluk: (arr) => arr.length,
      ekle: (arr, item) => { arr.push(item); return arr; },
      çıkar: (arr) => arr.pop(),
      ilkEkle: (arr, item) => { arr.unshift(item); return arr; },
      ilkÇıkar: (arr) => arr.shift(),
      birleştir: (...arrs) => [].concat(...arrs),
      dilimle: (arr, start, end) => arr.slice(start, end),
      eşle: (arr, fn) => arr.map(fn),
      filtrele: (arr, fn) => arr.filter(fn),
      azalt: (arr, fn, initial) => arr.reduce(fn, initial),
      bul: (arr, fn) => arr.find(fn),
      bulIndex: (arr, fn) => arr.findIndex(fn),
      sırala: (arr, fn) => arr.sort(fn),
      tersÇevir: (arr) => arr.reverse(),
    });
    
    // Type checking
    this.globalEnv.define('tip', (value) => {
      if (value === null) return 'boş';
      if (Array.isArray(value)) return 'dizi';
      const type = typeof value;
      const typeMap = {
        'number': 'sayı',
        'string': 'yazı',
        'boolean': 'mantıksal',
        'function': 'fonksiyon',
        'object': 'nesne'
      };
      return typeMap[type] || type;
    });
    
    // Console
    this.globalEnv.define('konsol', {
      yaz: console.log,
      hata: console.error,
      uyarı: console.warn,
      bilgi: console.info,
      temizle: console.clear,
    });
    
    // Standard Library Modules
    for (const [name, module] of Object.entries(stdlib)) {
      if (this.isSafeMode && name === 'dosya') {
          const safeDosya = { ...module };
          // Tehlikeli işlemleri yasakla
          safeDosya.yaz = () => { throw new Error('GÜVENLİK İHLALİ: Güvenli Modda dosya yazma yasaktır.'); };
          safeDosya.ekle = () => { throw new Error('GÜVENLİK İHLALİ: Güvenli Modda dosya ekleme yasaktır.'); };
          safeDosya.sil = () => { throw new Error('GÜVENLİK İHLALİ: Güvenli Modda dosya silme yasaktır.'); };
          safeDosya.klasörOluştur = () => { throw new Error('GÜVENLİK İHLALİ: Güvenli Modda klasör oluşturma yasaktır.'); };
          this.globalEnv.define(name, safeDosya);
          continue;
      }
      this.globalEnv.define(name, module);
    }
  }
  
  stringify(value) {
    if (value === null) return 'boş';
    if (value === true) return 'doğru';
    if (value === false) return 'yanlış';
    if (typeof value === 'function') return '<fonksiyon>';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  }
  
  async evaluate(node, env = this.globalEnv) {
    if (++this.instructionCount > this.MAX_INSTRUCTIONS) {
        throw new Error('GÜVENLİK İHLALİ: İşlem limiti aşıldı (Olası sonsuz döngü).');
    }

    switch (node.type) {
      case NodeType.PROGRAM:
        let result = null;
        for (const statement of node.body) {
          result = await this.evaluate(statement, env);
        }
        return result;
        
      case NodeType.SAYI_LITERAL:
        return node.value;
        
      case NodeType.YAZI_LITERAL:
        return node.value;
        
      case NodeType.BOOLEAN_LITERAL:
        return node.value;
        
      case NodeType.BOS_LITERAL:
        return null;
        
      case NodeType.TANIMLAYICI:
        return env.get(node.name);
        
      case NodeType.DIZI_LITERAL:
        return await Promise.all(node.elements.map(el => this.evaluate(el, env)));
        
      case NodeType.NESNE_LITERAL: {
        const obj = {};
        for (const prop of node.properties) {
          obj[prop.key] = await this.evaluate(prop.value, env);
        }
        return obj;
      }
        
      case NodeType.IKILI_IFADE:
        return await this.evaluateBinaryExpression(node, env);
        
      case NodeType.TEKLI_IFADE:
        return await this.evaluateUnaryExpression(node, env);
        
      case NodeType.DEGISKEN_BILDIRIMI: {
        const value = node.value ? await this.evaluate(node.value, env) : null;
        
        if (node.varType && value !== null) {
          const typeMap = {
            'number': 'sayı',
            'string': 'yazı', 
            'boolean': 'mantıksal',
            'function': 'fonksiyon',
            'object': Array.isArray(value) ? 'dizi' : 'nesne'
          };
          
          let actualType;
          if (Array.isArray(value)) actualType = 'dizi';
          else if (value === null) actualType = 'boş';
          else {
            const jsType = typeof value;
            actualType = typeMap[jsType] || jsType;
          }

          if (actualType !== node.varType) {
            throw new Error(`Tip hatası: '${node.varType}' bekleniyordu, '${actualType}' bulundu.`);
          }
        }

        env.define(node.name, value);
        return value;
      }
        
      case NodeType.ATAMA: {
        const value = await this.evaluate(node.value, env);
        
        if (node.target.type === NodeType.TANIMLAYICI) {
          env.set(node.target.name, value);
        } else if (node.target.type === NodeType.ERISIM) {
          // GÜVENLİK: Prototype Pollution Koruması
          if (['__proto__', 'prototype', 'constructor'].includes(node.target.property)) {
             throw new Error('GÜVENLİK İHLALİ: Dahili JS özelliklerini değiştirme yasak.');
          }
          const obj = await this.evaluate(node.target.object, env);
          obj[node.target.property] = value;
        } else if (node.target.type === NodeType.INDEKS_ERISIM) {
          const obj = await this.evaluate(node.target.object, env);
          const index = await this.evaluate(node.target.index, env);
          // GÜVENLİK: İndeks erişimi kontrolü
          if (['__proto__', 'prototype', 'constructor'].includes(String(index))) {
             throw new Error('GÜVENLİK İHLALİ: Dahili JS özelliklerini değiştirme yasak.');
          }
          obj[index] = value;
        }
        
        return value;
      }
        
      case NodeType.FONKSIYON_BILDIRIMI: {
        const func = async (...args) => {
          const funcEnv = new Environment(env);
          
          for (let i = 0; i < node.params.length; i++) {
            funcEnv.define(node.params[i].name, args[i]);
          }
          
          try {
            await this.evaluate(node.body, funcEnv);
            return null;
          } catch (e) {
            if (e instanceof ReturnException) {
              return e.value;
            }
            throw e;
          }
        };
        
        env.define(node.name, func);
        return func;
      }
        
      case NodeType.ASENKRON_FONKSIYON: {
        const func = async (...args) => {
          const funcEnv = new Environment(env);
          
          for (let i = 0; i < node.params.length; i++) {
            funcEnv.define(node.params[i].name, args[i]);
          }
          
          try {
            await this.evaluate(node.body, funcEnv);
            return null;
          } catch (e) {
            if (e instanceof ReturnException) {
              return e.value;
            }
            throw e;
          }
        };
        
        env.define(node.name, func);
        return func;
      }
        
      case NodeType.FONKSIYON_CAGRISI: {
        const func = await this.evaluate(node.callee, env);
        
        // JIT / Hot Path Detection Logic
        if (node.callee.type === NodeType.TANIMLAYICI) { // Only named functions
             const name = node.callee.name;
             const count = (this.callCounts.get(name) || 0) + 1;
             this.callCounts.set(name, count);
             if (count === 5) { // Low threshold for demo
                 // In a real JIT, we would compile this function to native code here.
                 // console.log(`[JIT] Sıcak yol tespit edildi: ${name} (${count} kez çağrıldı). Optimize ediliyor...`);
             }
        }

        const args = await Promise.all(node.arguments.map(arg => this.evaluate(arg, env)));
        
        if (typeof func !== 'function') {
          throw new Error(`${node.callee.name || 'İfade'} bir fonksiyon değil`);
        }
        
        return await func(...args);
      }
        
      case NodeType.SINIF_BILDIRIMI: {
        const self = this;  // Capture interpreter instance
        const classFunc = async function(...args) {
          const instance = {};
          
          // Add properties
          for (const prop of node.properties) {
            instance[prop.name] = null;
          }
          
          // Add methods
          for (const method of node.methods) {
            instance[method.name] = async (...methodArgs) => {
              const methodEnv = new Environment(env);
              methodEnv.define('bu', instance);
              
              for (let i = 0; i < method.params.length; i++) {
                methodEnv.define(method.params[i].name, methodArgs[i]);
              }
              
              try {
                await self.evaluate(method.body, methodEnv);
                return null;
              } catch (e) {
                if (e instanceof ReturnException) {
                  return e.value;
                }
                throw e;
              }
            };
          }
          
          // Call constructor
          if (node.constructor) {
            const constructorEnv = new Environment(env);
            constructorEnv.define('bu', instance);
            
            for (let i = 0; i < node.constructor.params.length; i++) {
              constructorEnv.define(node.constructor.params[i].name, args[i]);
            }
            
            await self.evaluate(node.constructor.body, constructorEnv);
          }
          
          return instance;
        };
        
        env.define(node.name, classFunc);
        return classFunc;
      }
        
      case NodeType.YENI_IFADESI: {
        const classFunc = env.get(node.className);
        const args = await Promise.all(node.arguments.map(arg => this.evaluate(arg, env)));
        return classFunc(...args);
      }
        
      case NodeType.ERISIM: {
        // Prototype Pollution Koruması
        if (['__proto__', 'prototype', 'constructor'].includes(node.property)) {
            throw new Error('GÜVENLİK İHLALİ: Dahili JS özelliklerine erişim yasak.');
        }
        const obj = await this.evaluate(node.object, env);
        return obj[node.property];
      }
        
      case NodeType.INDEKS_ERISIM: {
        const obj = await this.evaluate(node.object, env);
        const index = await this.evaluate(node.index, env);
        return obj[index];
      }
        
      case NodeType.EGER_IFADESI: {
        const condition = await this.evaluate(node.condition, env);
        
        if (condition) {
          return await this.evaluate(node.thenBlock, env);
        }
        
        for (const elseIf of node.elseIfs) {
          const elseIfCondition = await this.evaluate(elseIf.condition, env);
          if (elseIfCondition) {
            return await this.evaluate(elseIf.body, env);
          }
        }
        
        if (node.elseBlock) {
          return await this.evaluate(node.elseBlock, env);
        }
        
        return null;
      }

      case NodeType.ESLESTIR_IFADESI: {
        const discriminant = await this.evaluate(node.discriminant, env);
        
        for (const kase of node.cases) {
           const test = await this.evaluate(kase.test, env);
           if (discriminant === test) {
               return await this.evaluate(kase.consequence, env);
           }
        }
        
        if (node.defaultCase) {
            return await this.evaluate(node.defaultCase, env);
        }
        return null;
      }
      
      case NodeType.MAKRO_BILDIRIMI: {
        const func = async (...args) => {
           const funcEnv = new Environment(env);
           for (let i = 0; i < node.params.length; i++) {
             funcEnv.define(node.params[i], args[i]);
           }
           try {
             await this.evaluate(node.body, funcEnv);
             return null;
           } catch (e) {
             if (e instanceof ReturnException) return e.value;
             throw e;
           }
        };
        env.define(node.name, func);
        return func;
      }
      
      case NodeType.DEBUGGER: {
         console.log('--- DEBUGGER ---');
         console.log('Scope:', Object.keys(env.variables));
         return null;
      }
        
      case NodeType.DONGU_IFADESI: {
        const loopEnv = new Environment(env);
        
        await this.evaluate(node.init, loopEnv);
        
        while (await this.evaluate(node.condition, loopEnv)) {
          try {
            await this.evaluate(node.body, loopEnv);
          } catch (e) {
            if (e instanceof BreakException) {
              break;
            }
            if (e instanceof ContinueException) {
              await this.evaluate(node.update, loopEnv);
              continue;
            }
            throw e;
          }
          
          await this.evaluate(node.update, loopEnv);
        }
        
        return null;
      }
        
      case NodeType.HER_DONGUSU: {
        const iterable = await this.evaluate(node.iterable, env);
        const loopEnv = new Environment(env);
        
        for (const item of iterable) {
          loopEnv.define(node.variable, item);
          
          try {
            await this.evaluate(node.body, loopEnv);
          } catch (e) {
            if (e instanceof BreakException) {
              break;
            }
            if (e instanceof ContinueException) {
              continue;
            }
            throw e;
          }
        }
        
        return null;
      }
        
      case NodeType.IKEN_DONGUSU: {
        while (await this.evaluate(node.condition, env)) {
          try {
            await this.evaluate(node.body, env);
          } catch (e) {
            if (e instanceof BreakException) {
              break;
            }
            if (e instanceof ContinueException) {
              continue;
            }
            throw e;
          }
        }
        
        return null;
      }
        
      case NodeType.DONDUR_IFADESI: {
        const value = node.value ? await this.evaluate(node.value, env) : null;
        throw new ReturnException(value);
      }
        
      case NodeType.KIR_IFADESI:
        throw new BreakException();
        
      case NodeType.DEVAM_IFADESI:
        throw new ContinueException();
        
      case NodeType.BLOK: {
        let result = null;
        // Parser produces 'body' in some cases and 'statements' in others? Handle both.
        const stmts = node.statements || node.body || [];
        for (const statement of stmts) {
          result = await this.evaluate(statement, env);
        }
        return result;
      }
        
      case NodeType.BEKLE_IFADESI:
        return await this.evaluate(node.expression, env);
        
      case NodeType.DENE_YAKALA: {
        try {
          return await this.evaluate(node.tryBlock, env);
        } catch (error) {
          const catchEnv = new Environment(env);
          catchEnv.define(node.errorVar, error.message);
          return await this.evaluate(node.catchBlock, catchEnv);
        }
      }
        
      case NodeType.KUTUPHANE_IMPORT:
        return await this.handleImport(node, env);

      case NodeType.DISA_AKTARMA: {
        const value = await this.evaluate(node.declaration, env);
        this.exports[node.declaration.name] = value;
        return value;
      }
        
      default:
        throw new Error(`Bilinmeyen node tipi: ${node.type}`);
    }
  }
  
  async evaluateBinaryExpression(node, env) {
    const left = await this.evaluate(node.left, env);
    const right = await this.evaluate(node.right, env);
    
    switch (node.operator) {
      case TokenType.ARTI:
        return left + right;
      case TokenType.EKSI:
        return left - right;
      case TokenType.CARPI:
        return left * right;
      case TokenType.BOLU:
        return left / right;
      case TokenType.MOD:
        return left % right;
      case TokenType.ESITTIR:
        return left === right;
      case TokenType.ESIT_DEGIL:
        return left !== right;
      case TokenType.BUYUK:
        return left > right;
      case TokenType.KUCUK:
        return left < right;
      case TokenType.BUYUK_ESIT:
        return left >= right;
      case TokenType.KUCUK_ESIT:
        return left <= right;
      case TokenType.VE:
        return left && right;
      case TokenType.VEYA:
        return left || right;
      default:
        throw new Error(`Bilinmeyen operatör: ${node.operator}`);
    }
  }
  
  async evaluateUnaryExpression(node, env) {
    if (node.postfix) {
      const value = await this.evaluate(node.operand, env);
      const name = node.operand.name;
      
      if (node.operator === TokenType.ARTIR) {
        env.set(name, value + 1);
        return value;
      } else if (node.operator === TokenType.AZALT) {
        env.set(name, value - 1);
        return value;
      }
    }
    
    const operand = await this.evaluate(node.operand, env);
    
    switch (node.operator) {
      case TokenType.EKSI:
        return -operand;
      case TokenType.DEGIL:
        return !operand;
      default:
        throw new Error(`Bilinmeyen tekli operatör: ${node.operator}`);
    }
  }
  
  async handleImport(node, env) {
    if (this.isSafeMode && (node.source.startsWith('python:') || node.source.startsWith('dotnet:'))) {
        throw new Error('GÜVENLİK İHLALİ: Güvenli Modda dış sistem köprüleri kullanılamaz.');
    }

    if (node.isLocal) {
      const filePath = path.resolve(this.cwd, node.source);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`Modül bulunamadı: ${filePath}`);
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Dinamik import kullanarak circular dependency sorununu aşmaya çalışıyoruz
      // Normalde Lexer ve Parser'ı en tepede import edebilirdik ama
      // modüler yapı gereği burada dinamik import daha güvenli olabilir.
      const { Lexer } = await import('./lexer.js');
      const { Parser } = await import('./parser.js');
      
      const lexer = new Lexer(content);
      const parser = new Parser(lexer.tokenize());
      const program = parser.parse();
      
      const moduleInterpreter = new Interpreter(path.dirname(filePath));
      await moduleInterpreter.evaluate(program);
      
      env.define(node.name, moduleInterpreter.exports);
      return null;
    }

    const [prefix, moduleName] = node.source.split(':');
    
    if (prefix === 'node') {
      // Node.js built-in modules
      const module = await import(moduleName);
      env.define(node.name, module.default || module);
    } else if (prefix === 'npm') {
      // NPM packages
      try {
        const module = await import(moduleName);
        env.define(node.name, module.default || module);
      } catch (e) {
        throw new Error(`NPM paketi yüklenemedi: ${moduleName}. Önce 'npm install ${moduleName}' çalıştırın.`);
      }
    } else if (prefix === 'python') {
      if (!this.pythonBridge) {
        this.pythonBridge = new PythonBridge();
      }
      
      await this.pythonBridge.importModule(moduleName);
      
      const createPythonProxy = (path) => {
        const proxyFunc = () => {};
        
        return new Proxy(proxyFunc, {
          get: (target, prop) => {
            if (prop === 'then') return undefined;
            if (prop === 'toString' || prop === Symbol.toStringTag) return () => `PythonObj(${path || moduleName})`;
            
            return createPythonProxy(path ? `${path}.${prop}` : prop);
          },
          apply: async (target, thisArg, args) => {
             if (!path) return undefined; 
             return await this.pythonBridge.call(moduleName, path, args);
          }
        });
      };
       
      env.define(node.name, createPythonProxy(''));
    } else if (prefix === 'dotnet') {
      if (!this.dotnetBridge) {
        this.dotnetBridge = new DotNetBridge();
      }
      
      await this.dotnetBridge.importModule(moduleName);
      
      const createDotNetProxy = (path) => {
        const proxyFunc = () => {};
        
        return new Proxy(proxyFunc, {
          get: (target, prop) => {
            if (prop === 'then') return undefined;
            if (prop === 'toString' || prop === Symbol.toStringTag) return () => `DotNetObj(${path || moduleName})`;
            
            return createDotNetProxy(path ? `${path}.${prop}` : prop);
          },
          apply: async (target, thisArg, args) => {
             if (!path) return undefined; 
             return await this.dotnetBridge.call(moduleName, path, args);
          }
        });
      };
      
      env.define(node.name, createDotNetProxy(''));
    } else {
       // Fallback for unexpected formats
       throw new Error(`Geçersiz import formatı: ${node.source}`);
    }
    
    return null;
  }
}
