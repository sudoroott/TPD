# TPD Programlama Dili - Yol Haritası

## 🎯 Vizyon

**TPD** (Türkçe Programlama Dili), Türkçe konuşan geliştiriciler için modern, güçlü ve öğrenmesi kolay bir programlama dili olmayı hedefler. Tüm dil kütüphaneleriyle uyumlu, yüksek performanslı ve güvenli bir ekosistem oluşturmak ana vizyonumuzdur.

---

## 🏆 PROJE TAMAMLANDI (v2.0.0 RELEASED)

Bu yol haritasındaki **TÜM** hedefler başarıyla gerçekleştirilmiştir.

### 1. Çekirdek Dil Özellikleri

- [x] Türkçe sözdizimi ve anahtar kelimeler
- [x] Lexer, Parser, Interpreter, Compiler
- [x] REPL ve CLI araçları
- [x] Temel Veri Tipleri (Sayı, Yazı, Mantıksal, Dizi, Nesne)
- [x] Kontrol Yapıları (Eğer, Döngü, Her, İken, Kır, Devam)
- [x] Fonksiyonlar (Normal, Asenkron)
- [x] OOP (Sınıflar, Kurucular, Kalıtım)

### 2. Gelişmiş Özellikler

- [x] **Modül Sistemi**: `içe_aktar`, `dışa_aktar`, yerel dosya import desteği.
- [x] **Tip Kontrolü**: Runtime tip doğrulama (değişken bildirimlerinde).
- [x] **Hata Yönetimi**: Gelişmiş Try-Catch ve hata mesajları.

### 3. Kütüphane ve Entegrasyon

- [x] **Standart Kütüphane**: Dosya, Http, Zaman, Json modülleri.
- [x] **Python Köprüsü**: `python:` prefix'i ile tüm Python kütüphanelerini kullanabilme.
- [x] **.NET Köprüsü**: `dotnet:` prefix'i ile C# DLL'lerini kullanabilme.
- [x] **Paket Yöneticisi**: `tpm` (TPD Paket Yöneticisi) ile npm paketlerini yönetme.

### 4. Geliştirici Deneyimi

- [x] **VS Code Eklentisi**: Syntax Highlighting.
- [x] **Debugger**: `debugger` anahtar kelimesi ile scope inceleme.
- [x] **Dokümantasyon**: Detaylı kullanım kılavuzu.

### 5. İleri Seviye Özellikler

- [x] **Pattern Matching**: `esles` ve `durum` ile gelişmiş kontrol yapısı.
- [x] **Makro Sistemi**: `makro` anahtar kelimesi ile dinamik kod üretimi.
- [x] **JIT Derleyici**: Hot-Path detection ve runtime performans sayaçları.
- [x] **Performans**: Node.js V8 motoru üzerinden optimize edilmiş yürütme.

### 6. 🛡️ Güvenlik (Yeni Eklendi)

- [x] **Sandbox (Dosya Sistemi)**: Kodlar sadece çalışma dizinine erişebilir (Path Traversal Koruması).
- [x] **Güvenli Mod (--guvenli)**: Dış proses çalıştırma ve dosya yazma işlemlerini engelleyen mod.
- [x] **Runtime Koruması**: `Prototype Pollution` ve `DoS` saldırılarına karşı önlemler.

---

## 📊 Özet

| Sürüm      | Durum         | Kapsam              | Not                   |
| ---------- | ------------- | ------------------- | --------------------- |
| **v0.1.0** | ✅ Tamamlandı | MVP (Temel Dil)     | -                     |
| **v0.2.0** | ✅ Tamamlandı | Modüller, Tip       | -                     |
| **v0.3.0** | ✅ Tamamlandı | Bridge, StdLib      | -                     |
| **v1.0.0** | ✅ Tamamlandı | Production          | -                     |
| **v2.0.0** | ✅ Tamamlandı | Advanced & Security | **MAKSİMUM GÜVENLİK** |

---

## 📞 İletişim

- **GitHub**: https://github.com/tpd-lang/tpd
- **Discord**: https://discord.gg/tpd-lang

**TPD** artık güvenli, hızlı ve güçlü! 🚀🛡️🇹🇷
