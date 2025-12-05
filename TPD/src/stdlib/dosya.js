import fs from 'fs';
import path from 'path';

// GÜVENLİK KATMANI
// Kullanıcının çalışma dizini dışına çıkmasını engeller (Path Traversal Protection)
const checkPath = (yol) => {
    const cwd = process.cwd();
    // Resolve: ".." gibi ifadeleri çözer
    const fullPath = path.resolve(cwd, yol);
    
    // Windows/Unix path separator uyumluluğu ile kontrol
    // Eğer fullPath, cwd ile başlamıyorsa, dışarı çıkmaya çalışıyordur.
    if (!fullPath.startsWith(cwd)) {
        throw new Error(`GÜVENLİK İHLALİ: Erişim reddedildi '${yol}'. Sadece proje klasörü içindeki dosyalara erişilebilir.`);
    }
    return fullPath;
};

export default {
  oku: (yol) => {
    try {
      return fs.readFileSync(checkPath(yol), 'utf-8');
    } catch (e) {
      throw new Error(`Dosya okuma hatası: ${e.message}`);
    }
  },
  yaz: (yol, veri) => {
    try {
      fs.writeFileSync(checkPath(yol), String(veri));
      return true;
    } catch (e) {
      throw new Error(`Dosya yazma hatası: ${e.message}`);
    }
  },
  ekle: (yol, veri) => {
     try {
      fs.appendFileSync(checkPath(yol), String(veri));
      return true;
    } catch (e) {
      throw new Error(`Dosya ekleme hatası: ${e.message}`);
    }
  },
  varMı: (yol) => fs.existsSync(checkPath(yol)),
  sil: (yol) => {
    try {
        const p = checkPath(yol);
        if (fs.lstatSync(p).isDirectory()) {
            fs.rmdirSync(p);
        } else {
            fs.unlinkSync(p);
        }
        return true;
    } catch(e) {
        throw new Error(`Silme hatası: ${e.message}`);
    }
  },
  klasörOluştur: (yol) => {
      fs.mkdirSync(checkPath(yol), { recursive: true });
      return true;
  },
  liste: (yol) => fs.readdirSync(checkPath(yol)),
  bilgi: (yol) => {
      const stats = fs.statSync(checkPath(yol));
      return {
          boyut: stats.size,
          oluşturma: stats.birthtime,
          değiştirme: stats.mtime,
          klasörMü: stats.isDirectory(),
          dosyaMı: stats.isFile()
      };
  }
};
