#!/usr/bin/env node

/**
 * TPD - Türkçe Programlama Dili
 * Ana CLI ve REPL
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { Lexer } from './src/lexer.js';
import { Parser } from './src/parser.js';
import { Interpreter } from './src/interpreter.js';
import { Compiler } from './src/compiler.js';

const VERSION = '2.0.0';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printBanner() {
  console.log(colorize(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ${colorize('TPD', 'cyan')} - Türkçe Programlama Dili                      ║
║   Sürüm: ${VERSION}                                         ║
║                                                           ║
║   Komutlar:                                               ║
║   ${colorize('.yardım', 'yellow')}  - Yardım göster                            ║
║   ${colorize('.çıkış', 'yellow')}   - REPL'den çık                             ║
║   ${colorize('.temizle', 'yellow')} - Ekranı temizle                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `, 'bright'));
}

function printHelp() {
  console.log(`
${colorize('TPD Kullanım Kılavuzu', 'cyan')}
${colorize('='.repeat(50), 'dim')}

${colorize('Kullanım:', 'yellow')}
  tpd                    REPL modunda başlat
  tpd <dosya.dil>        Dosyayı çalıştır
  tpd derle <dosya.dil>  Dosyayı JavaScript'e derle
  tpd --yardım           Bu yardımı göster
  tpd --sürüm            Sürüm bilgisini göster
  tpd --guvenli          Güvenli modda çalıştır (Dosya/Ağ kısıtlamalı)

${colorize('Örnekler:', 'yellow')}
  tpd                           # REPL başlat
  tpd merhaba.dil               # merhaba.dil dosyasını çalıştır
  tpd hesapla.dil --guvenli     # Güvenli modda çalıştır

${colorize('REPL Komutları:', 'yellow')}
  .yardım                       # Yardım göster
  .çıkış                        # REPL'den çık
  .temizle                      # Ekranı temizle

${colorize('Daha fazla bilgi için:', 'yellow')}
  https://github.com/tpd-lang/tpd
  `);
}

async function runFile(filePath, isSafe) {
  try {
    const source = fs.readFileSync(filePath, 'utf-8');
    await executeCode(source, filePath, isSafe);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(colorize(`Hata: Dosya bulunamadı: ${filePath}`, 'red'));
    } else {
      console.error(colorize(`Hata: ${error.message}`, 'red'));
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
    }
    process.exit(1);
  }
}

async function compileFile(filePath) {
  try {
    const source = fs.readFileSync(filePath, 'utf-8');
    
    console.log(colorize(`Derleniyor: ${filePath}`, 'cyan'));
    
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();
    
    const parser = new Parser(tokens);
    const ast = parser.parse();
    
    const compiler = new Compiler();
    const jsCode = compiler.compile(ast);
    
    const outputPath = filePath.replace(/\.dil$/, '.js');
    fs.writeFileSync(outputPath, jsCode);
    
    console.log(colorize(`✓ Derleme başarılı: ${outputPath}`, 'green'));
  } catch (error) {
    console.error(colorize(`Derleme hatası: ${error.message}`, 'red'));
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

async function executeCode(source, filename = '<stdin>', isSafe = false) {
  try {
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();
    
    const parser = new Parser(tokens);
    const ast = parser.parse();
    
    const cwd = filename === '<stdin>' ? process.cwd() : path.dirname(path.resolve(filename));
    const interpreter = new Interpreter(cwd, isSafe);
    await interpreter.evaluate(ast);
  } catch (error) {
    console.error(colorize(`Hata: ${error.message}`, 'red'));
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
  }
}

async function startREPL(isSafe = false) {
  printBanner();
  if (isSafe) console.log(colorize('🛡️  Güvenli Mod Aktif', 'magenta'));
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: colorize('tpd> ', 'green')
  });
  
  const interpreter = new Interpreter(process.cwd(), isSafe);
  let multilineBuffer = '';
  let bracketCount = 0;
  
  rl.prompt();
  
  rl.on('line', async (line) => {
    const trimmed = line.trim();
    
    // REPL commands
    if (trimmed === '.çıkış' || trimmed === '.cikis' || trimmed === '.exit') {
      console.log(colorize('Hoşça kal! 👋', 'cyan'));
      process.exit(0);
    }
    
    if (trimmed === '.yardım' || trimmed === '.yardim' || trimmed === '.help') {
      printHelp();
      rl.prompt();
      return;
    }
    
    if (trimmed === '.temizle' || trimmed === '.clear') {
      console.clear();
      printBanner();
      rl.prompt();
      return;
    }
    
    // Handle multiline input
    bracketCount += (line.match(/\{/g) || []).length;
    bracketCount -= (line.match(/\}/g) || []).length;
    
    multilineBuffer += line + '\n';
    
    if (bracketCount > 0) {
      rl.setPrompt(colorize('...  ', 'yellow'));
      rl.prompt();
      return;
    }
    
    const code = multilineBuffer;
    multilineBuffer = '';
    bracketCount = 0;
    
    if (code.trim() === '') {
      rl.setPrompt(colorize('tpd> ', 'green'));
      rl.prompt();
      return;
    }
    
    try {
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      
      const parser = new Parser(tokens);
      const ast = parser.parse();
      
      const result = await interpreter.evaluate(ast);
      
      if (result !== null && result !== undefined) {
        console.log(colorize('=> ', 'dim') + interpreter.stringify(result));
      }
    } catch (error) {
      console.error(colorize(`Hata: ${error.message}`, 'red'));
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
    }
    
    rl.setPrompt(colorize('tpd> ', 'green'));
    rl.prompt();
  });
  
  rl.on('close', () => {
    console.log(colorize('\nHoşça kal! 👋', 'cyan'));
    process.exit(0);
  });
}

// Main
async function main() {
  const allArgs = process.argv.slice(2);
  const isSafe = allArgs.includes('--guvenli') || allArgs.includes('--safe');
  const args = allArgs.filter(arg => arg !== '--guvenli' && arg !== '--safe');
  
  if (args.length === 0) {
    await startREPL(isSafe);
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case '--yardım':
    case '--yardim':
    case '--help':
    case '-h':
      printHelp();
      break;
      
    case '--sürüm':
    case '--surum':
    case '--version':
    case '-v':
      console.log(`TPD v${VERSION}`);
      break;
      
    case 'derle':
    case 'compile':
      if (args.length < 2) {
        console.error(colorize('Hata: Derlenecek dosya belirtilmedi', 'red'));
        console.log('Kullanım: tpd derle <dosya.dil>');
        process.exit(1);
      }
      await compileFile(args[1]);
      break;
      
    default:
      // Run file
      if (!fs.existsSync(command)) {
        console.error(colorize(`Hata: Dosya bulunamadı: ${command}`, 'red'));
        process.exit(1);
      }
      await runFile(command, isSafe);
      break;
  }
}

main().catch(error => {
  console.error(colorize(`Beklenmeyen hata: ${error.message}`, 'red'));
  if (process.env.DEBUG) {
    console.error(error.stack);
  }
  process.exit(1);
});
