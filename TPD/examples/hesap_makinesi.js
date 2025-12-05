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

function topla(a, b) {
  return (a + b);
};
function çıkar(a, b) {
  return (a - b);
};
function çarp(a, b) {
  return (a * b);
};
function böl(a, b) {
  if ((b === 0)) {
    yaz("Hata: Sıfıra bölme!");
    return 0;
  };
  return (a / b);
};
yaz("=== Türkçe Hesap Makinesi ===");
yaz("");
let sayı1 = 10;
let sayı2 = 5;
yaz("Sayı 1:", sayı1);
yaz("Sayı 2:", sayı2);
yaz("");
yaz("Toplama:", topla(sayı1, sayı2));
yaz("Çıkarma:", çıkar(sayı1, sayı2));
yaz("Çarpma:", çarp(sayı1, sayı2));
yaz("Bölme:", böl(sayı1, sayı2));
yaz("");
yaz("=== Gelişmiş İşlemler ===");
yaz("Karekök(16):", matematik.karekök(16));
yaz("Üs(2, 8):", matematik.üs(2, 8));
yaz("Mutlak(-42):", matematik.mutlak(-42));
yaz("Yuvarla(3.7):", matematik.yuvarla(3.7));
yaz("Pi:", matematik.pi);
yaz("E:", matematik.e);
