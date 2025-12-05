// Dil Runtime Helpers
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

yaz("Merhaba Dünya!");
yaz("Türkçe programlama dilimize hoş geldiniz! 🇹🇷");
