export default {
  şimdi: () => Date.now(),
  
  tarih: () => new Date().toISOString(),
  
  yerelTarih: () => new Date().toLocaleString('tr-TR'),
  
  biçimle: (format) => {
    // Basit formatlama (şimdilik sadece ISO)
    return new Date().toISOString(); 
  },
  
  bekle: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  yıl: () => new Date().getFullYear(),
  ay: () => new Date().getMonth() + 1,
  gün: () => new Date().getDate(),
  saat: () => new Date().getHours(),
  dakika: () => new Date().getMinutes(),
  saniye: () => new Date().getSeconds()
};
