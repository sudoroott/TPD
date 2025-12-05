# Dil Programlama Dili - Detaylı Dokümantasyon

## İçindekiler

1. [Giriş](#giriş)
2. [Kurulum](#kurulum)
3. [Temel Sözdizimi](#temel-sözdizimi)
4. [Veri Tipleri](#veri-tipleri)
5. [Değişkenler](#değişkenler)
6. [Operatörler](#operatörler)
7. [Kontrol Yapıları](#kontrol-yapıları)
8. [Fonksiyonlar](#fonksiyonlar)
9. [Sınıflar](#sınıflar)
10. [Modüller ve Kütüphaneler](#modüller-ve-kütüphaneler)
11. [Standart Kütüphane](#standart-kütüphane)
12. [İleri Seviye Özellikler](#ileri-seviye-özellikler)

---

## Giriş

**Dil**, tamamen Türkçe sözdizimi kullanan modern bir programlama dilidir. Hem yorumlayıcı hem de derleyici modunda çalışabilir ve JavaScript, Python, .NET kütüphaneleriyle uyumludur.

### Özellikler

- 🇹🇷 **Tamamen Türkçe**: Tüm anahtar kelimeler Türkçe
- 🚀 **Yüksek Performans**: JIT derleyici desteği
- 🔒 **Güvenli**: Tip güvenliği ve bellek güvenliği
- 📚 **Kütüphane Uyumluluğu**: Çoklu platform desteği
- 🎓 **Öğrenmesi Kolay**: Sade ve anlaşılır sözdizimi

---

## Kurulum

### Gereksinimler

- Node.js 18.0 veya üzeri

### Kurulum Adımları

```bash
# Projeyi klonla
git clone https://github.com/dil-lang/dil.git
cd dil

# Bağımlılıkları yükle
npm install

# Global olarak kur (opsiyonel)
npm link
```

### Kullanım

```bash
# REPL başlat
dil

# Dosya çalıştır
dil program.dil

# Derleme
dil derle program.dil
```

---

## Temel Sözdizimi

### Yorumlar

```dil
# Tek satır yorum

# Çok satırlı yorumlar için
# her satırda # kullanın
```

### Noktalı Virgül

Noktalı virgül opsiyoneldir. Satır sonları otomatik olarak algılanır.

```dil
yaz("Merhaba")  # Noktalı virgül yok
yaz("Dünya");   # Noktalı virgül var (opsiyonel)
```

---

## Veri Tipleri

### İlkel Tipler

#### Sayı (Number)

```dil
tam_sayı := 42
ondalık := 3.14
negatif := -10
```

#### Yazı (String)

```dil
isim := "Ahmet"
mesaj := 'Merhaba Dünya'
çok_satır := "Birinci satır
İkinci satır"
```

#### Mantıksal (Boolean)

```dil
aktif := doğru
pasif := yanlış
```

#### Boş (Null)

```dil
değer := boş
```

### Koleksiyon Tipleri

#### Dizi (Array)

```dil
sayılar := [1, 2, 3, 4, 5]
karışık := [1, "iki", doğru, boş]
iç_içe := [[1, 2], [3, 4]]
```

#### Nesne (Object)

```dil
kişi := {
    isim: "Ahmet",
    yaş: 25,
    aktif: doğru
}
```

---

## Değişkenler

### Değişken Tanımlama

```dil
# Otomatik tip çıkarımı
x := 10
isim := "Ahmet"

# Açık tip belirtme
yaş: sayı = 25
mesaj: yazı = "Merhaba"
```

### Değişken Atama

```dil
x := 10
x = 20  # Yeniden atama
```

### Sabitler

```dil
# Sabit tanımlama (gelecek sürümde)
sabit PI := 3.14159
```

---

## Operatörler

### Aritmetik Operatörler

```dil
toplam := 5 + 3      # 8
fark := 10 - 4       # 6
çarpım := 6 * 7      # 42
bölüm := 20 / 4      # 5
kalan := 17 % 5      # 2
```

### Karşılaştırma Operatörleri

```dil
5 == 5    # doğru (eşit)
5 != 3    # doğru (eşit değil)
10 > 5    # doğru (büyük)
3 < 7     # doğru (küçük)
5 >= 5    # doğru (büyük veya eşit)
4 <= 9    # doğru (küçük veya eşit)
```

### Mantıksal Operatörler

```dil
doğru ve doğru    # doğru
doğru veya yanlış # doğru
değil yanlış      # doğru
```

### Atama Operatörleri

```dil
x := 10     # İlk atama
x = 20      # Yeniden atama
x++         # Artırma (x = x + 1)
x--         # Azaltma (x = x - 1)
```

---

## Kontrol Yapıları

### Eğer-Yoksa (If-Else)

```dil
yaş := 18

eğer yaş >= 18 {
    yaz("Yetişkin")
} yoksa {
    yaz("Çocuk")
}

# Yoksa eğer
not := 85

eğer not >= 90 {
    yaz("Pekiyi")
} yoksa eğer not >= 70 {
    yaz("İyi")
} yoksa eğer not >= 50 {
    yaz("Orta")
} yoksa {
    yaz("Kötü")
}
```

### Döngüler

#### For Döngüsü

```dil
döngü i := 0; i < 10; i++ {
    yaz(i)
}
```

#### Her Döngüsü (Foreach)

```dil
meyveler := ["Elma", "Armut", "Muz"]

her meyve için meyveler {
    yaz(meyve)
}
```

#### While Döngüsü

```dil
sayaç := 0

iken sayaç < 5 {
    yaz(sayaç)
    sayaç++
}
```

### Döngü Kontrolü

```dil
# Kır (Break)
döngü i := 0; i < 10; i++ {
    eğer i == 5 {
        kır
    }
    yaz(i)
}

# Devam (Continue)
döngü i := 0; i < 10; i++ {
    eğer i % 2 == 0 {
        devam
    }
    yaz(i)  # Sadece tek sayılar
}
```

---

## Fonksiyonlar

### Fonksiyon Tanımlama

```dil
# Basit fonksiyon
fonksiyon selamla() {
    yaz("Merhaba!")
}

# Parametreli fonksiyon
fonksiyon topla(a, b) {
    döndür a + b
}

# Tip belirtmeli fonksiyon
fonksiyon çarp(a: sayı, b: sayı) -> sayı {
    döndür a * b
}
```

### Fonksiyon Çağırma

```dil
selamla()
sonuç := topla(5, 3)
yaz(sonuç)  # 8
```

### Asenkron Fonksiyonlar

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

### Lambda Fonksiyonlar (Gelecek Sürüm)

```dil
# Gelecek sürümde eklenecek
topla := (a, b) => a + b
```

---

## Sınıflar

### Sınıf Tanımlama

```dil
sınıf Araba {
    marka: yazı
    model: yazı
    yıl: sayı

    kurucu(marka: yazı, model: yazı, yıl: sayı) {
        bu.marka = marka
        bu.model = model
        bu.yıl = yıl
    }

    fonksiyon bilgiGöster() {
        yaz(bu.yıl, bu.marka, bu.model)
    }

    fonksiyon yaşHesapla() -> sayı {
        şimdi := 2024
        döndür şimdi - bu.yıl
    }
}
```

### Sınıf Kullanımı

```dil
araba := yeni Araba("Toyota", "Corolla", 2020)
araba.bilgiGöster()
yaş := araba.yaşHesapla()
yaz("Arabanın yaşı:", yaş)
```

### Kalıtım (Gelecek Sürüm)

```dil
# Gelecek sürümde eklenecek
sınıf ElektrikliAraba miras Araba {
    batarya: sayı

    kurucu(marka, model, yıl, batarya) {
        üst.kurucu(marka, model, yıl)
        bu.batarya = batarya
    }
}
```

---

## Modüller ve Kütüphaneler

### Kütüphane İçe Aktarma

#### Node.js Modülleri

```dil
kütüphane fs from "node:fs"
kütüphane path from "node:path"

içerik := fs.readFileSync("dosya.txt", "utf-8")
yaz(içerik)
```

#### NPM Paketleri

```dil
kütüphane axios from "npm:axios"

asenkron fonksiyon veriGetir() {
    yanıt := bekle axios.get("https://api.example.com")
    yaz(yanıt.data)
}
```

#### Python Kütüphaneleri (Gelecek Sürüm)

```dil
kütüphane numpy from "python:numpy"
kütüphane pandas from "python:pandas"

dizi := numpy.array([1, 2, 3, 4, 5])
```

#### .NET Kütüphaneleri (Gelecek Sürüm)

```dil
kütüphane System from "dotnet:System"

şimdi := System.DateTime.Now
yaz(şimdi)
```

---

## Standart Kütüphane

### Matematik

```dil
matematik.pi          # 3.14159...
matematik.e           # 2.71828...
matematik.karekök(16) # 4
matematik.üs(2, 8)    # 256
matematik.mutlak(-5)  # 5
matematik.yuvarla(3.7) # 4
matematik.taban(3.9)  # 3
matematik.tavan(3.1)  # 4
matematik.sin(0)      # 0
matematik.cos(0)      # 1
matematik.rastgele()  # 0-1 arası
```

### Metin

```dil
metin.uzunluk("Merhaba")           # 7
metin.büyükHarf("merhaba")         # "MERHABA"
metin.küçükHarf("MERHABA")         # "merhaba"
metin.böl("a,b,c", ",")            # ["a", "b", "c"]
metin.birleştir(["a", "b"], "-")   # "a-b"
metin.içerir("Merhaba", "rha")     # doğru
metin.başlar("Merhaba", "Mer")     # doğru
metin.biter("Merhaba", "ba")       # doğru
```

### Dizi

```dil
sayılar := [1, 2, 3, 4, 5]

dizi.uzunluk(sayılar)              # 5
dizi.ekle(sayılar, 6)              # [1,2,3,4,5,6]
dizi.çıkar(sayılar)                # 6
dizi.ilkEkle(sayılar, 0)           # [0,1,2,3,4,5]
dizi.ilkÇıkar(sayılar)             # 0
dizi.dilimle(sayılar, 1, 3)        # [2,3]
dizi.tersÇevir(sayılar)            # [5,4,3,2,1]
```

### Konsol

```dil
konsol.yaz("Normal mesaj")
konsol.hata("Hata mesajı")
konsol.uyarı("Uyarı mesajı")
konsol.bilgi("Bilgi mesajı")
konsol.temizle()
```

### Tip Kontrolü

```dil
tip(42)           # "sayı"
tip("Merhaba")    # "yazı"
tip(doğru)        # "mantıksal"
tip([1, 2, 3])    # "dizi"
tip({a: 1})       # "nesne"
tip(boş)          # "boş"
```

---

## İleri Seviye Özellikler

### Hata Yönetimi

```dil
dene {
    sonuç := 10 / 0
    yaz(sonuç)
} yakala hata {
    yaz("Hata oluştu:", hata)
}
```

### Pattern Matching (Gelecek Sürüm)

```dil
fonksiyon değerlendir(x) {
    eşleştir x {
        0 => yaz("Sıfır")
        1..10 => yaz("Bir ile on arası")
        yazı s => yaz("Metin:", s)
        dizi d => yaz("Dizi uzunluğu:", d.uzunluk)
        _ => yaz("Diğer")
    }
}
```

### Tip Sistemi (Gelecek Sürüm)

```dil
# Özel tip tanımlama
tip Nokta = {
    x: sayı,
    y: sayı
}

# Union tipler
tip Sonuç = tamam | hata

# Generic tipler
tip Liste<T> = dizi<T>
```

### Makrolar (Gelecek Sürüm)

```dil
# Derleme zamanı kod üretimi
makro tekrarla(n, kod) {
    döngü i := 0; i < n; i++ {
        kod
    }
}

tekrarla(5, {
    yaz("Merhaba")
})
```

---

## Örnekler

### Fibonacci Dizisi

```dil
fonksiyon fibonacci(n: sayı) -> dizi {
    eğer n <= 0 {
        döndür []
    }

    eğer n == 1 {
        döndür [0]
    }

    sonuç := [0, 1]

    döngü i := 2; i < n; i++ {
        yeniSayı := sonuç[i-1] + sonuç[i-2]
        dizi.ekle(sonuç, yeniSayı)
    }

    döndür sonuç
}

yaz(fibonacci(10))
```

### Faktöriyel

```dil
fonksiyon faktöriyel(n: sayı) -> sayı {
    eğer n <= 1 {
        döndür 1
    }
    döndür n * faktöriyel(n - 1)
}

yaz(faktöriyel(5))  # 120
```

### Asal Sayı Kontrolü

```dil
fonksiyon asalMı(n: sayı) -> mantıksal {
    eğer n <= 1 {
        döndür yanlış
    }

    döngü i := 2; i * i <= n; i++ {
        eğer n % i == 0 {
            döndür yanlış
        }
    }

    döndür doğru
}

yaz(asalMı(17))  # doğru
```

---

## Katkıda Bulunma

Dil açık kaynaklı bir projedir. Katkılarınızı bekliyoruz!

### Geliştirme

```bash
# Testleri çalıştır
npm test

# Geliştirme modu
npm run dev
```

### Hata Bildirimi

GitHub Issues üzerinden hata bildirebilirsiniz.

---

## Lisans

MIT License - Detaylar için LICENSE dosyasına bakın.

---

## İletişim

- **Web**: https://dil-lang.org
- **GitHub**: https://github.com/dil-lang/dil
- **Discord**: https://discord.gg/dil-lang
- **Twitter**: @dil_lang

---

**Dil** ile Türkçe kodlamanın tadını çıkarın! 🚀🇹🇷
