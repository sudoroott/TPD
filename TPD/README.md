# 🇹🇷 Dil - Türkçe Programlama Dili

**Dil**, tamamen Türkçe sözdizimi kullanan, modern, yüksek performanslı ve öğrenmesi kolay bir programlama dilidir.

## 🎯 Özellikler

### ✨ Temel Özellikler

- 🇹🇷 **Tamamen Türkçe**: Tüm anahtar kelimeler ve standart kütüphane Türkçe
- 🚀 **Yüksek Performans**: Hem yorumlayıcı hem derleyici desteği
- 🔒 **Güvenli**: Tip güvenliği ve bellek güvenliği
- 📚 **Kütüphane Uyumluluğu**: Python, JavaScript, .NET kütüphanelerini kullanabilme
- 🎓 **Öğrenmesi Kolay**: Sade ve anlaşılır sözdizimi

### 🛠️ Teknik Özellikler

- **Hibrit Çalışma Modu**: Hem yorumlayıcı hem derleyici
- **Tip Çıkarımı**: Otomatik tip belirleme
- **Asenkron Programlama**: `async`/`await` desteği
- **Pattern Matching**: Gelişmiş desen eşleştirme
- **Modül Sistemi**: Organize kod yapısı
- **REPL**: Etkileşimli komut satırı

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Dil REPL'i başlat
node dil.js

# Dosya çalıştır
node dil.js dosya.dil

# Derleme
node dil.js derle dosya.dil
```

## 🚀 Hızlı Başlangıç

### Merhaba Dünya

```dil
yaz("Merhaba Dünya!")
```

### Değişkenler ve Tipler

```dil
# Otomatik tip çıkarımı
isim := "Ahmet"
yaş := 25
aktif := doğru

# Açık tip belirtme
sayı: sayı = 42
metin: yazı = "Merhaba"
```

### Fonksiyonlar

```dil
fonksiyon topla(a: sayı, b: sayı) -> sayı {
    döndür a + b
}

sonuç := topla(5, 3)
yaz(sonuç)  # 8
```

### Kontrol Yapıları

```dil
# Koşullu ifadeler
eğer yaş >= 18 {
    yaz("Yetişkin")
} yoksa {
    yaz("Çocuk")
}

# Döngüler
döngü i := 0; i < 10; i++ {
    yaz(i)
}

# Her döngüsü
sayılar := [1, 2, 3, 4, 5]
her sayı için sayılar {
    yaz(sayı)
}
```

### Sınıflar

```dil
sınıf Kişi {
    isim: yazı
    yaş: sayı

    kurucu(isim: yazı, yaş: sayı) {
        bu.isim = isim
        bu.yaş = yaş
    }

    fonksiyon selamla() {
        yaz("Merhaba, ben " + bu.isim)
    }
}

kişi := yeni Kişi("Ahmet", 25)
kişi.selamla()
```

### Asenkron Programlama

```dil
asenkron fonksiyon veriGetir(url: yazı) -> yazı {
    sonuç := bekle http.get(url)
    döndür sonuç
}

asenkron fonksiyon ana() {
    veri := bekle veriGetir("https://api.example.com")
    yaz(veri)
}

ana()
```

### Kütüphane Kullanımı

#### JavaScript Kütüphaneleri

```dil
kütüphane fs from "node:fs"
kütüphane axios from "npm:axios"

içerik := fs.okuDosya("dosya.txt")
yaz(içerik)
```

#### Python Kütüphaneleri

```dil
kütüphane numpy from "python:numpy"
kütüphane pandas from "python:pandas"

dizi := numpy.array([1, 2, 3, 4, 5])
yaz(dizi.ortalama())
```

#### .NET Kütüphaneleri

```dil
kütüphane System from "dotnet:System"

şimdi := System.DateTime.Now
yaz(şimdi)
```

### Pattern Matching

```dil
fonksiyon değerlendir(değer: herhangi) {
    eşleştir değer {
        0 => yaz("Sıfır")
        1..10 => yaz("Bir ile on arası")
        yazı s => yaz("Metin: " + s)
        liste l => yaz("Liste uzunluğu: " + l.uzunluk)
        _ => yaz("Bilinmeyen")
    }
}
```

### Hata Yönetimi

```dil
fonksiyon böl(a: sayı, b: sayı) -> sonuç<sayı, hata> {
    eğer b == 0 {
        döndür hata("Sıfıra bölme hatası")
    }
    döndür tamam(a / b)
}

sonuç := böl(10, 2)
eşleştir sonuç {
    tamam(değer) => yaz("Sonuç: " + değer)
    hata(mesaj) => yaz("Hata: " + mesaj)
}
```

## 📚 Anahtar Kelimeler

| Türkçe       | Açıklama              | Örnek                           |
| ------------ | --------------------- | ------------------------------- |
| `yaz`        | Ekrana yazdır         | `yaz("Merhaba")`                |
| `oku`        | Kullanıcıdan girdi al | `isim := oku()`                 |
| `eğer`       | Koşul kontrolü        | `eğer x > 0 { }`                |
| `yoksa`      | Alternatif koşul      | `yoksa { }`                     |
| `yoksa eğer` | Başka koşul           | `yoksa eğer x < 0 { }`          |
| `döngü`      | For döngüsü           | `döngü i := 0; i < 10; i++ { }` |
| `her`        | Foreach döngüsü       | `her öğe için liste { }`        |
| `iken`       | While döngüsü         | `iken koşul { }`                |
| `fonksiyon`  | Fonksiyon tanımla     | `fonksiyon topla(a, b) { }`     |
| `döndür`     | Değer döndür          | `döndür sonuç`                  |
| `sınıf`      | Sınıf tanımla         | `sınıf Araba { }`               |
| `kurucu`     | Constructor           | `kurucu(isim) { }`              |
| `bu`         | This/self             | `bu.isim`                       |
| `yeni`       | Yeni nesne            | `yeni Araba()`                  |
| `kütüphane`  | Import                | `kütüphane fs from "node:fs"`   |
| `kır`        | Break                 | `kır`                           |
| `devam`      | Continue              | `devam`                         |
| `asenkron`   | Async                 | `asenkron fonksiyon { }`        |
| `bekle`      | Await                 | `bekle işlem()`                 |
| `dene`       | Try                   | `dene { }`                      |
| `yakala`     | Catch                 | `yakala hata { }`               |
| `eşleştir`   | Pattern match         | `eşleştir değer { }`            |
| `doğru`      | True                  | `aktif := doğru`                |
| `yanlış`     | False                 | `aktif := yanlış`               |
| `boş`        | Null/None             | `değer := boş`                  |

## 🏗️ Proje Yapısı

```
dil/
├── README.md                 # Bu dosya
├── package.json             # Node.js bağımlılıkları
├── dil.js                   # Ana CLI
├── src/
│   ├── lexer.js            # Tokenizer
│   ├── parser.js           # Parser (AST)
│   ├── interpreter.js      # Yorumlayıcı
│   ├── compiler.js         # Derleyici
│   ├── runtime.js          # Runtime ortamı
│   ├── types.js            # Tip sistemi
│   └── bridges/            # Kütüphane köprüleri
│       ├── javascript.js   # JS kütüphane köprüsü
│       ├── python.js       # Python kütüphane köprüsü
│       └── dotnet.js       # .NET kütüphane köprüsü
├── stdlib/                  # Standart kütüphane
│   ├── temel.dil
│   ├── matematik.dil
│   ├── metin.dil
│   └── dosya.dil
├── examples/               # Örnek programlar
│   ├── merhaba.dil
│   ├── hesap_makinesi.dil
│   └── web_sunucu.dil
└── tests/                  # Test dosyaları
    └── test_runner.js
```

## 🔧 Geliştirme

```bash
# Testleri çalıştır
npm test

# Geliştirme modu
npm run dev

# Derleyici oluştur
npm run build
```

## 📖 Dokümantasyon

Detaylı dokümantasyon için `docs/` klasörüne bakın.

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen CONTRIBUTING.md dosyasını okuyun.

## 📄 Lisans

MIT License

## 🎯 Yol Haritası

### v0.1.0 (MVP) ✅

- [x] Temel sözdizimi
- [x] Yorumlayıcı
- [x] REPL
- [x] Temel veri tipleri

### v0.2.0

- [ ] Derleyici optimizasyonları
- [ ] Gelişmiş tip sistemi
- [ ] Modül sistemi

### v0.3.0

- [ ] Python kütüphane entegrasyonu
- [ ] .NET kütüphane entegrasyonu
- [ ] Paket yöneticisi

### v1.0.0

- [ ] JIT derleyici
- [ ] Tam kütüphane desteği
- [ ] IDE eklentileri
- [ ] Kapsamlı dokümantasyon

---

**Dil** ile Türkçe kodlama deneyiminin tadını çıkarın! 🚀
