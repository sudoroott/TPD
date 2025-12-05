/**
 * Dil - Türkçe Programlama Dili
 * Lexer (Tokenizer) - Kaynak kodu token'lara ayırır
 */

// Token tipleri
export const TokenType = {
  // Literals
  SAYI: 'SAYI',
  YAZI: 'YAZI',
  DOGRU: 'DOGRU',
  YANLIS: 'YANLIS',
  BOS: 'BOS',
  
  // Identifiers
  TANIMLAYICI: 'TANIMLAYICI',
  
  // Keywords
  YAZ: 'YAZ',
  OKU: 'OKU',
  EGER: 'EGER',
  YOKSA: 'YOKSA',
  YOKSA_EGER: 'YOKSA_EGER',
  DONGU: 'DONGU',
  HER: 'HER',
  ICIN: 'ICIN',
  IKEN: 'IKEN',
  FONKSIYON: 'FONKSIYON',
  DONDUR: 'DONDUR',
  SINIF: 'SINIF',
  KURUCU: 'KURUCU',
  BU: 'BU',
  YENI: 'YENI',
  KUTUPHANE: 'KUTUPHANE',
  FROM: 'FROM',
  KIR: 'KIR',
  DEVAM: 'DEVAM',
  ASENKRON: 'ASENKRON',
  BEKLE: 'BEKLE',
  DENE: 'DENE',
  YAKALA: 'YAKALA',
  ASENKRON: 'ASENKRON',
  BEKLE: 'BEKLE',
  DENE: 'DENE',
  YAKALA: 'YAKALA',
  ESLES: 'ESLES',
  DURUM: 'DURUM',
  VARSAYILAN: 'VARSAYILAN',
  MAKRO: 'MAKRO',
  DEBUGGER: 'DEBUGGER',
  ICE_AKTAR: 'ICE_AKTAR',
  DISA_AKTAR: 'DISA_AKTAR',
  OLARAK: 'OLARAK',
  ESLES: 'ESLES',
  DURUM: 'DURUM',
  VARSAYILAN: 'VARSAYILAN',
  MAKRO: 'MAKRO',
  DEBUGGER: 'DEBUGGER',
  
  // Operators
  ARTI: 'ARTI',
  EKSI: 'EKSI',
  CARPI: 'CARPI',
  BOLU: 'BOLU',
  MOD: 'MOD',
  ESITTIR: 'ESITTIR',
  ESIT_DEGIL: 'ESIT_DEGIL',
  BUYUK: 'BUYUK',
  KUCUK: 'KUCUK',
  BUYUK_ESIT: 'BUYUK_ESIT',
  KUCUK_ESIT: 'KUCUK_ESIT',
  VE: 'VE',
  VEYA: 'VEYA',
  DEGIL: 'DEGIL',
  ATAMA: 'ATAMA',
  ATAMA_TIP: 'ATAMA_TIP',
  OK: 'OK',
  ARTIR: 'ARTIR',
  AZALT: 'AZALT',
  
  // Delimiters
  PARANTEZ_AC: 'PARANTEZ_AC',
  PARANTEZ_KAPA: 'PARANTEZ_KAPA',
  SUSLU_AC: 'SUSLU_AC',
  SUSLU_KAPA: 'SUSLU_KAPA',
  KOSELI_AC: 'KOSELI_AC',
  KOSELI_KAPA: 'KOSELI_KAPA',
  VIRGUL: 'VIRGUL',
  NOKTA: 'NOKTA',
  IKI_NOKTA: 'IKI_NOKTA',
  NOKTA_VIRGUL: 'NOKTA_VIRGUL',
  SORU: 'SORU',
  ARALIK: 'ARALIK',
  YAYILMA: 'YAYILMA',
  
  // Special
  YENI_SATIR: 'YENI_SATIR',
  EOF: 'EOF',
  YORUM: 'YORUM',
};

// Anahtar kelimeler
const keywords = {
  // 'yaz' ve 'oku' artık keyword değil, built-in fonksiyon (Identifier)
  'eğer': TokenType.EGER,
  'eger': TokenType.EGER,
  'yoksa': TokenType.YOKSA,
  'döngü': TokenType.DONGU,
  'dongu': TokenType.DONGU,
  'her': TokenType.HER,
  'için': TokenType.ICIN,
  'icin': TokenType.ICIN,
  'iken': TokenType.IKEN,
  'fonksiyon': TokenType.FONKSIYON,
  'döndür': TokenType.DONDUR,
  'dondur': TokenType.DONDUR,
  'sınıf': TokenType.SINIF,
  'sinif': TokenType.SINIF,
  'kurucu': TokenType.KURUCU,
  'bu': TokenType.BU,
  'yeni': TokenType.YENI,
  'kütüphane': TokenType.KUTUPHANE,
  'kutuphane': TokenType.KUTUPHANE,
  'from': TokenType.FROM,
  'kır': TokenType.KIR,
  'kir': TokenType.KIR,
  'devam': TokenType.DEVAM,
  'asenkron': TokenType.ASENKRON,
  'bekle': TokenType.BEKLE,
  'dene': TokenType.DENE,
  'yakala': TokenType.YAKALA,
  'eşleştir': TokenType.ESLESTIR,
  'eslestir': TokenType.ESLESTIR,
  'doğru': TokenType.DOGRU,
  'dogru': TokenType.DOGRU,
  'yanlış': TokenType.YANLIS,
  'yanlis': TokenType.YANLIS,
  'boş': TokenType.BOS,
  'bos': TokenType.BOS,
  've': TokenType.VE,
  'veya': TokenType.VEYA,
  'değil': TokenType.DEGIL,
  'degil': TokenType.DEGIL,
  'içe_aktar': TokenType.ICE_AKTAR,
  'ice_aktar': TokenType.ICE_AKTAR,
  'dışa_aktar': TokenType.DISA_AKTAR,
  'disa_aktar': TokenType.DISA_AKTAR,
  'olarak': TokenType.OLARAK,
  'esles': TokenType.ESLES,
  'durum': TokenType.DURUM,
  'varsayilan': TokenType.VARSAYILAN,
  'makro': TokenType.MAKRO,
  'debugger': TokenType.DEBUGGER
};

export class Token {
  constructor(type, value, line, column) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
  }
  
  toString() {
    return `Token(${this.type}, ${JSON.stringify(this.value)}, ${this.line}:${this.column})`;
  }
}

export class Lexer {
  constructor(source) {
    this.source = source;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
  }
  
  get currentChar() {
    if (this.position >= this.source.length) {
      return null;
    }
    return this.source[this.position];
  }
  
  peek(offset = 1) {
    const pos = this.position + offset;
    if (pos >= this.source.length) {
      return null;
    }
    return this.source[pos];
  }
  
  advance() {
    if (this.currentChar === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    this.position++;
  }
  
  skipWhitespace() {
    while (this.currentChar && /\s/.test(this.currentChar) && this.currentChar !== '\n') {
      this.advance();
    }
  }
  
  skipComment() {
    if (this.currentChar === '#') {
      while (this.currentChar && this.currentChar !== '\n') {
        this.advance();
      }
    }
  }
  
  readNumber() {
    let num = '';
    let hasDot = false;
    const startColumn = this.column;
    
    while (this.currentChar && (/\d/.test(this.currentChar) || this.currentChar === '.')) {
      if (this.currentChar === '.') {
        if (hasDot) break;
        if (this.peek() === '.') break; // Range operator
        hasDot = true;
      }
      num += this.currentChar;
      this.advance();
    }
    
    return new Token(
      TokenType.SAYI,
      hasDot ? parseFloat(num) : parseInt(num),
      this.line,
      startColumn
    );
  }
  
  readString(quote) {
    let str = '';
    const startColumn = this.column;
    this.advance(); // Skip opening quote
    
    while (this.currentChar && this.currentChar !== quote) {
      if (this.currentChar === '\\') {
        this.advance();
        const escapeMap = {
          'n': '\n',
          't': '\t',
          'r': '\r',
          '\\': '\\',
          '"': '"',
          "'": "'"
        };
        str += escapeMap[this.currentChar] || this.currentChar;
      } else {
        str += this.currentChar;
      }
      this.advance();
    }
    
    this.advance(); // Skip closing quote
    return new Token(TokenType.YAZI, str, this.line, startColumn);
  }
  
  readIdentifier() {
    let id = '';
    const startColumn = this.column;
    
    while (this.currentChar && /[a-zA-ZğüşıöçĞÜŞİÖÇ0-9_]/.test(this.currentChar)) {
      id += this.currentChar;
      this.advance();
    }
    
    const type = keywords[id] || TokenType.TANIMLAYICI;
    // Keyword olsa bile değerini sakla (property erişimi için)
    const value = id;
    
    return new Token(type, value, this.line, startColumn);
  }
  
  tokenize() {
    while (this.currentChar !== null) {
      const startColumn = this.column;
      
      // Whitespace
      if (/\s/.test(this.currentChar) && this.currentChar !== '\n') {
        this.skipWhitespace();
        continue;
      }
      
      // Comments
      if (this.currentChar === '#') {
        this.skipComment();
        continue;
      }
      
      // Newline
      if (this.currentChar === '\n') {
        this.tokens.push(new Token(TokenType.YENI_SATIR, null, this.line, startColumn));
        this.advance();
        continue;
      }
      
      // Numbers
      if (/\d/.test(this.currentChar)) {
        this.tokens.push(this.readNumber());
        continue;
      }
      
      // Strings
      if (this.currentChar === '"' || this.currentChar === "'") {
        this.tokens.push(this.readString(this.currentChar));
        continue;
      }
      
      // Identifiers and keywords
      if (/[a-zA-ZğüşıöçĞÜŞİÖÇ_]/.test(this.currentChar)) {
        this.tokens.push(this.readIdentifier());
        continue;
      }
      
      // Two-character operators
      const twoChar = this.currentChar + (this.peek() || '');
      const twoCharTokens = {
        ':=': TokenType.ATAMA,
        '==': TokenType.ESITTIR,
        '!=': TokenType.ESIT_DEGIL,
        '>=': TokenType.BUYUK_ESIT,
        '<=': TokenType.KUCUK_ESIT,
        '->': TokenType.OK,
        '++': TokenType.ARTIR,
        '--': TokenType.AZALT,
        '..': TokenType.ARALIK,
        '...': TokenType.YAYILMA,
      };
      
      if (twoChar === '...' && this.peek(2) === '.') {
        this.tokens.push(new Token(TokenType.YAYILMA, null, this.line, startColumn));
        this.advance();
        this.advance();
        this.advance();
        continue;
      }
      
      if (twoCharTokens[twoChar]) {
        this.tokens.push(new Token(twoCharTokens[twoChar], null, this.line, startColumn));
        this.advance();
        this.advance();
        continue;
      }
      
      // Single-character operators and delimiters
      const singleCharTokens = {
        '+': TokenType.ARTI,
        '-': TokenType.EKSI,
        '*': TokenType.CARPI,
        '/': TokenType.BOLU,
        '%': TokenType.MOD,
        '=': TokenType.ATAMA_TIP,
        '>': TokenType.BUYUK,
        '<': TokenType.KUCUK,
        '!': TokenType.DEGIL,
        '(': TokenType.PARANTEZ_AC,
        ')': TokenType.PARANTEZ_KAPA,
        '{': TokenType.SUSLU_AC,
        '}': TokenType.SUSLU_KAPA,
        '[': TokenType.KOSELI_AC,
        ']': TokenType.KOSELI_KAPA,
        ',': TokenType.VIRGUL,
        '.': TokenType.NOKTA,
        ':': TokenType.IKI_NOKTA,
        ';': TokenType.NOKTA_VIRGUL,
        '?': TokenType.SORU,
      };
      
      if (singleCharTokens[this.currentChar]) {
        this.tokens.push(new Token(
          singleCharTokens[this.currentChar],
          null,
          this.line,
          startColumn
        ));
        this.advance();
        continue;
      }
      
      throw new Error(
        `Bilinmeyen karakter: '${this.currentChar}' (${this.line}:${this.column})`
      );
    }
    
    this.tokens.push(new Token(TokenType.EOF, null, this.line, this.column));
    return this.tokens;
  }
}
