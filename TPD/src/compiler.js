/**
 * Dil - Türkçe Programlama Dili
 * Compiler - AST'yi JavaScript'e derler
 */

import { NodeType } from './parser.js';
import { TokenType } from './lexer.js';

export class Compiler {
  constructor() {
    this.output = '';
    this.indentLevel = 0;
  }
  
  indent() {
    return '  '.repeat(this.indentLevel);
  }
  
  compile(ast) {
    this.output = '';
    this.indentLevel = 0;
    
    // Add runtime helpers
    this.output += this.generateRuntimeHelpers();
    
    // Compile the program
    this.compileNode(ast);
    
    return this.output;
  }
  
  generateRuntimeHelpers() {
    return `// Dil Runtime Helpers
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const __dil_runtime = {
  yaz: (...args) => console.log(...args),
  oku: () => new Promise((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('', (answer) => {
      rl.close();
      resolve(answer);
    });
  }),
  matematik: {
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
  },
  metin: {
    uzunluk: (str) => str.length,
    büyükHarf: (str) => str.toUpperCase(),
    küçükHarf: (str) => str.toLowerCase(),
    böl: (str, sep) => str.split(sep),
    birleştir: (arr, sep) => arr.join(sep),
    içerir: (str, substr) => str.includes(substr),
    başlar: (str, prefix) => str.startsWith(prefix),
    biter: (str, suffix) => str.endsWith(suffix),
  },
  dizi: {
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
  },
  tip: (value) => {
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
  },
  konsol: {
    yaz: console.log,
    hata: console.error,
    uyarı: console.warn,
    bilgi: console.info,
    temizle: console.clear,
  }
};

// Make runtime available globally
Object.assign(global, __dil_runtime);

`;
  }
  
  compileNode(node) {
    switch (node.type) {
      case NodeType.PROGRAM:
        for (const statement of node.body) {
          this.output += this.indent();
          this.compileNode(statement);
          this.output += ';\n';
        }
        break;
        
      case NodeType.SAYI_LITERAL:
        this.output += node.value;
        break;
        
      case NodeType.YAZI_LITERAL:
        this.output += JSON.stringify(node.value);
        break;
        
      case NodeType.BOOLEAN_LITERAL:
        this.output += node.value ? 'true' : 'false';
        break;
        
      case NodeType.BOS_LITERAL:
        this.output += 'null';
        break;
        
      case NodeType.TANIMLAYICI:
        if (node.name === 'bu') {
          this.output += 'this';
        } else {
          this.output += node.name;
        }
        break;
        
      case NodeType.DIZI_LITERAL:
        this.output += '[';
        for (let i = 0; i < node.elements.length; i++) {
          this.compileNode(node.elements[i]);
          if (i < node.elements.length - 1) {
            this.output += ', ';
          }
        }
        this.output += ']';
        break;
        
      case NodeType.NESNE_LITERAL:
        this.output += '{';
        for (let i = 0; i < node.properties.length; i++) {
          const prop = node.properties[i];
          this.output += `${JSON.stringify(prop.key)}: `;
          this.compileNode(prop.value);
          if (i < node.properties.length - 1) {
            this.output += ', ';
          }
        }
        this.output += '}';
        break;
        
      case NodeType.IKILI_IFADE:
        this.output += '(';
        this.compileNode(node.left);
        this.output += ' ';
        this.output += this.mapOperator(node.operator);
        this.output += ' ';
        this.compileNode(node.right);
        this.output += ')';
        break;
        
      case NodeType.TEKLI_IFADE:
        if (node.postfix) {
          this.compileNode(node.operand);
          this.output += this.mapOperator(node.operator);
        } else {
          this.output += this.mapOperator(node.operator);
          this.compileNode(node.operand);
        }
        break;
        
      case NodeType.DEGISKEN_BILDIRIMI:
        this.output += `let ${node.name}`;
        if (node.value) {
          this.output += ' = ';
          this.compileNode(node.value);
        }
        break;
        
      case NodeType.ATAMA:
        this.compileNode(node.target);
        this.output += ' = ';
        this.compileNode(node.value);
        break;
        
      case NodeType.FONKSIYON_BILDIRIMI:
        this.output += `function ${node.name}(`;
        for (let i = 0; i < node.params.length; i++) {
          this.output += node.params[i].name;
          if (i < node.params.length - 1) {
            this.output += ', ';
          }
        }
        this.output += ') ';
        this.compileNode(node.body);
        break;
        
      case NodeType.ASENKRON_FONKSIYON:
        this.output += `async function ${node.name}(`;
        for (let i = 0; i < node.params.length; i++) {
          this.output += node.params[i].name;
          if (i < node.params.length - 1) {
            this.output += ', ';
          }
        }
        this.output += ') ';
        this.compileNode(node.body);
        break;
        
      case NodeType.FONKSIYON_CAGRISI:
        this.compileNode(node.callee);
        this.output += '(';
        for (let i = 0; i < node.arguments.length; i++) {
          this.compileNode(node.arguments[i]);
          if (i < node.arguments.length - 1) {
            this.output += ', ';
          }
        }
        this.output += ')';
        break;
        
      case NodeType.SINIF_BILDIRIMI:
        this.output += `class ${node.name} {\n`;
        this.indentLevel++;
        
        // Constructor
        if (node.constructor) {
          this.output += this.indent() + 'constructor(';
          for (let i = 0; i < node.constructor.params.length; i++) {
            this.output += node.constructor.params[i].name;
            if (i < node.constructor.params.length - 1) {
              this.output += ', ';
            }
          }
          this.output += ') ';
          this.compileNode(node.constructor.body);
          this.output += '\n';
        }
        
        // Methods
        for (const method of node.methods) {
          this.output += this.indent() + `${method.name}(`;
          for (let i = 0; i < method.params.length; i++) {
            this.output += method.params[i].name;
            if (i < method.params.length - 1) {
              this.output += ', ';
            }
          }
          this.output += ') ';
          this.compileNode(method.body);
          this.output += '\n';
        }
        
        this.indentLevel--;
        this.output += this.indent() + '}';
        break;
        
      case NodeType.YENI_IFADESI:
        this.output += `new ${node.className}(`;
        for (let i = 0; i < node.arguments.length; i++) {
          this.compileNode(node.arguments[i]);
          if (i < node.arguments.length - 1) {
            this.output += ', ';
          }
        }
        this.output += ')';
        break;
        
      case NodeType.ERISIM:
        this.compileNode(node.object);
        this.output += `.${node.property}`;
        break;
        
      case NodeType.INDEKS_ERISIM:
        this.compileNode(node.object);
        this.output += '[';
        this.compileNode(node.index);
        this.output += ']';
        break;
        
      case NodeType.EGER_IFADESI:
        this.output += 'if (';
        this.compileNode(node.condition);
        this.output += ') ';
        this.compileNode(node.thenBlock);
        
        for (const elseIf of node.elseIfs) {
          this.output += ' else if (';
          this.compileNode(elseIf.condition);
          this.output += ') ';
          this.compileNode(elseIf.body);
        }
        
        if (node.elseBlock) {
          this.output += ' else ';
          this.compileNode(node.elseBlock);
        }
        break;
        
      case NodeType.DONGU_IFADESI:
        this.output += 'for (';
        this.compileNode(node.init);
        this.output += '; ';
        this.compileNode(node.condition);
        this.output += '; ';
        this.compileNode(node.update);
        this.output += ') ';
        this.compileNode(node.body);
        break;
        
      case NodeType.HER_DONGUSU:
        this.output += `for (const ${node.variable} of `;
        this.compileNode(node.iterable);
        this.output += ') ';
        this.compileNode(node.body);
        break;
        
      case NodeType.IKEN_DONGUSU:
        this.output += 'while (';
        this.compileNode(node.condition);
        this.output += ') ';
        this.compileNode(node.body);
        break;
        
      case NodeType.DONDUR_IFADESI:
        this.output += 'return';
        if (node.value) {
          this.output += ' ';
          this.compileNode(node.value);
        }
        break;
        
      case NodeType.KIR_IFADESI:
        this.output += 'break';
        break;
        
      case NodeType.DEVAM_IFADESI:
        this.output += 'continue';
        break;
        
      case NodeType.BLOK:
        this.output += '{\n';
        this.indentLevel++;
        for (const statement of node.statements) {
          this.output += this.indent();
          this.compileNode(statement);
          this.output += ';\n';
        }
        this.indentLevel--;
        this.output += this.indent() + '}';
        break;
        
      case NodeType.BEKLE_IFADESI:
        this.output += 'await ';
        this.compileNode(node.expression);
        break;
        
      case NodeType.DENE_YAKALA:
        this.output += 'try ';
        this.compileNode(node.tryBlock);
        this.output += ` catch (${node.errorVar}) `;
        this.compileNode(node.catchBlock);
        break;
        
      case NodeType.KUTUPHANE_IMPORT:
        const [prefix, moduleName] = node.source.split(':');
        if (prefix === 'node' || prefix === 'npm') {
          this.output += `const ${node.name} = require('${moduleName}')`;
        } else {
          this.output += `// Import not supported in compiled mode: ${node.source}`;
        }
        break;
        
      default:
        throw new Error(`Derleyici: Bilinmeyen node tipi: ${node.type}`);
    }
  }
  
  mapOperator(tokenType) {
    const operatorMap = {
      [TokenType.ARTI]: '+',
      [TokenType.EKSI]: '-',
      [TokenType.CARPI]: '*',
      [TokenType.BOLU]: '/',
      [TokenType.MOD]: '%',
      [TokenType.ESITTIR]: '===',
      [TokenType.ESIT_DEGIL]: '!==',
      [TokenType.BUYUK]: '>',
      [TokenType.KUCUK]: '<',
      [TokenType.BUYUK_ESIT]: '>=',
      [TokenType.KUCUK_ESIT]: '<=',
      [TokenType.VE]: '&&',
      [TokenType.VEYA]: '||',
      [TokenType.DEGIL]: '!',
      [TokenType.ARTIR]: '++',
      [TokenType.AZALT]: '--',
    };
    
    return operatorMap[tokenType] || tokenType;
  }
  
  compileToFile(ast, outputPath) {
    const code = this.compile(ast);
    return code;
  }
}
