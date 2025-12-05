// Dil Runtime Helpers
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

class Kişi {
  constructor(isim, yaş, meslek) {
    this.isim = isim;
    this.yaş = yaş;
    this.meslek = meslek;
  }
  selamla() {
    yaz("Merhaba! Ben", this.isim);
    yaz("Yaşım:", this.yaş);
    yaz("Mesleğim:", this.meslek);
  }
  doğumGünü() {
    this.yaş = (this.yaş + 1);
    yaz(this.isim, "artık", this.yaş, "yaşında! 🎂");
  }
};
class Öğrenci {
  constructor(isim, yaş, okul) {
    this.isim = isim;
    this.yaş = yaş;
    this.okul = okul;
    this.notlar = [];
  }
  notEkle(not) {
    dizi.ekle(this.notlar, not);
    yaz("Not eklendi:", not);
  }
  ortalamaHesapla() {
    if ((dizi.uzunluk(this.notlar) === 0)) {
      return 0;
    };
    let toplam = 0;
    for (const not of this.notlar) {
      toplam = (toplam + not);
    };
    return (toplam / dizi.uzunluk(this.notlar));
  }
  bilgiGöster() {
    yaz("=== Öğrenci Bilgileri ===");
    yaz("İsim:", this.isim);
    yaz("Yaş:", this.yaş);
    yaz("Okul:", this.okul);
    yaz("Notlar:", this.notlar);
    yaz("Ortalama:", this.ortalamaHesapla());
  }
};
yaz("=== Kişi Örneği ===");
let ahmet = new Kişi("Ahmet Yılmaz", 25, "Yazılım Geliştirici");
ahmet.selamla();
yaz("");
ahmet.doğumGünü();
yaz("");
yaz("=== Öğrenci Örneği ===");
let ayşe = new Öğrenci("Ayşe Demir", 20, "İstanbul Üniversitesi");
ayşe.notEkle(85);
ayşe.notEkle(92);
ayşe.notEkle(78);
ayşe.notEkle(95);
yaz("");
ayşe.bilgiGöster();
