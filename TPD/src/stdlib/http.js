export default {
  getir: async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP Hatanı: ${response.status} ${response.statusText}`);
      }
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    } catch (e) {
      throw new Error(`İstek hatası: ${e.message}`);
    }
  },
  
  gönder: async (url, veri, metod = 'POST') => {
    try {
      const options = {
        method: metod,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (veri) {
        options.body = JSON.stringify(veri);
      }
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP Hatanı: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    } catch (e) {
       throw new Error(`İstek hatası: ${e.message}`);
    }
  }
};
