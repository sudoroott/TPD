/**
 * Dil - Test Runner
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Lexer } from '../src/lexer.js';
import { Parser } from '../src/parser.js';
import { Interpreter } from '../src/interpreter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }
  
  test(name, fn) {
    this.tests.push({ name, fn });
  }
  
  async run() {
    console.log('🧪 Dil Test Suite\n');
    
    for (const test of this.tests) {
      try {
        await test.fn();
        this.passed++;
        console.log(`✓ ${test.name}`);
      } catch (error) {
        this.failed++;
        console.log(`✗ ${test.name}`);
        console.log(`  Hata: ${error.message}`);
      }
    }
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Toplam: ${this.tests.length} test`);
    console.log(`✓ Başarılı: ${this.passed}`);
    console.log(`✗ Başarısız: ${this.failed}`);
    
    if (this.failed > 0) {
      process.exit(1);
    }
  }
}

async function executeCode(code) {
  const lexer = new Lexer(code);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const interpreter = new Interpreter();
  return await interpreter.evaluate(ast);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Test Suite
const runner = new TestRunner();

// Lexer Tests
runner.test('Lexer: Sayı tokenize', () => {
  const lexer = new Lexer('42');
  const tokens = lexer.tokenize();
  assert(tokens[0].type === 'SAYI', 'Token tipi SAYI olmalı');
  assert(tokens[0].value === 42, 'Token değeri 42 olmalı');
});

runner.test('Lexer: Yazı tokenize', () => {
  const lexer = new Lexer('"Merhaba"');
  const tokens = lexer.tokenize();
  assert(tokens[0].type === 'YAZI', 'Token tipi YAZI olmalı');
  assert(tokens[0].value === 'Merhaba', 'Token değeri Merhaba olmalı');
});

runner.test('Lexer: Anahtar kelime tokenize', () => {
  const lexer = new Lexer('eğer');
  const tokens = lexer.tokenize();
  assert(tokens[0].type === 'EGER', 'Token tipi EGER olmalı');
});

// Parser Tests
runner.test('Parser: Sayı literal parse', () => {
  const lexer = new Lexer('42');
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  assert(ast.body[0].type === 'SayiLiteral', 'Node tipi SayiLiteral olmalı');
  assert(ast.body[0].value === 42, 'Node değeri 42 olmalı');
});

runner.test('Parser: İkili ifade parse', () => {
  const lexer = new Lexer('5 + 3');
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  assert(ast.body[0].type === 'IkiliIfade', 'Node tipi IkiliIfade olmalı');
});

// Interpreter Tests
runner.test('Interpreter: Basit toplama', async () => {
  const result = await executeCode('5 + 3');
  assert(result === 8, 'Sonuç 8 olmalı');
});

runner.test('Interpreter: Basit çarpma', async () => {
  const result = await executeCode('4 * 3');
  assert(result === 12, 'Sonuç 12 olmalı');
});

runner.test('Interpreter: Değişken tanımlama', async () => {
  const code = `
    x := 10
    x
  `;
  const result = await executeCode(code);
  assert(result === 10, 'x değeri 10 olmalı');
});

runner.test('Interpreter: Fonksiyon tanımlama ve çağırma', async () => {
  const code = `
    fonksiyon topla(a, b) {
      döndür a + b
    }
    topla(5, 3)
  `;
  const result = await executeCode(code);
  assert(result === 8, 'Fonksiyon sonucu 8 olmalı');
});

runner.test('Interpreter: Eğer ifadesi', async () => {
  const code = `
    x := 10
    sonuç := 0
    eğer x > 5 {
      sonuç = 1
    } yoksa {
      sonuç = 2
    }
    sonuç
  `;
  const result = await executeCode(code);
  assert(result === 1, 'Sonuç 1 olmalı');
});

runner.test('Interpreter: Döngü', async () => {
  const code = `
    toplam := 0
    döngü i := 1; i <= 5; i++ {
      toplam = toplam + i
    }
    toplam
  `;
  const result = await executeCode(code);
  assert(result === 15, 'Toplam 15 olmalı (1+2+3+4+5)');
});

runner.test('Interpreter: Dizi oluşturma', async () => {
  const code = `
    sayılar := [1, 2, 3, 4, 5]
    dizi.uzunluk(sayılar)
  `;
  const result = await executeCode(code);
  assert(result === 5, 'Dizi uzunluğu 5 olmalı');
});

runner.test('Interpreter: Her döngüsü', async () => {
  const code = `
    sayılar := [1, 2, 3]
    toplam := 0
    her sayı için sayılar {
      toplam = toplam + sayı
    }
    toplam
  `;
  const result = await executeCode(code);
  assert(result === 6, 'Toplam 6 olmalı (1+2+3)');
});

runner.test('Interpreter: Nesne oluşturma', async () => {
  const code = `
    kişi := { isim: "Ahmet", yaş: 25 }
    kişi.isim
  `;
  const result = await executeCode(code);
  assert(result === 'Ahmet', 'İsim Ahmet olmalı');
});

runner.test('Interpreter: Mantıksal operatörler', async () => {
  const code = `
    doğru ve doğru
  `;
  const result = await executeCode(code);
  assert(result === true, 'Sonuç true olmalı');
});

runner.test('Interpreter: Karşılaştırma operatörleri', async () => {
  const code = `
    10 > 5
  `;
  const result = await executeCode(code);
  assert(result === true, 'Sonuç true olmalı');
});

runner.test('Interpreter: String birleştirme', async () => {
  const code = `
    "Merhaba" + " " + "Dünya"
  `;
  const result = await executeCode(code);
  assert(result === 'Merhaba Dünya', 'Sonuç "Merhaba Dünya" olmalı');
});

// Run all tests
runner.run();
