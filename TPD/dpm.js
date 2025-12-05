#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const command = args[0];
const pkg = args[1];

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function printHelp() {
  log(`
dpm - Dil Paket Yöneticisi
--------------------------
Kullanım:
  node dpm.js yükle <paket>   Paket yükle (npm'den)
  node dpm.js kaldır <paket>  Paket kaldır
  node dpm.js listele         Yüklü paketleri listele
`, 'cyan');
}

if (!command) {
  printHelp();
  process.exit(0);
}

try {
  switch (command) {
    case 'yükle':
    case 'yukle':
    case 'install':
      if (!pkg) {
        log('Hata: Paket adı belirtilmedi.', 'red');
        process.exit(1);
      }
      log(`Paket yükleniyor: ${pkg}...`, 'yellow');
      execSync(`npm install ${pkg}`, { stdio: 'inherit' });
      log(`✔️ ${pkg} başarıyla yüklendi.`, 'green');
      break;

    case 'kaldır':
    case 'kaldir':
    case 'uninstall':
    case 'remove':
      if (!pkg) {
        log('Hata: Paket adı belirtilmedi.', 'red');
        process.exit(1);
      }
      log(`Paket kaldırılıyor: ${pkg}...`, 'yellow');
      execSync(`npm uninstall ${pkg}`, { stdio: 'inherit' });
      log(`✔️ ${pkg} başarıyla kaldırıldı.`, 'green');
      break;

    case 'listele':
    case 'list':
      log('Yüklü Paketler:', 'cyan');
      execSync('npm list --depth=0', { stdio: 'inherit' });
      break;

    default:
      log(`Bilinmeyen komut: ${command}`, 'red');
      printHelp();
      break;
  }
} catch (error) {
  log(`İşlem başarısız: ${error.message}`, 'red');
  process.exit(1);
}
