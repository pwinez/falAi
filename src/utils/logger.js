import fs from 'fs';
import path from 'path';

// Log dosyası yapılandırması
const LOG_FILE = 'system_logs.txt';

// Log seviyelerini tanımla
const LOG_LEVELS = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  SECURITY: 'SECURITY',
  ADMIN: 'ADMIN'
};

// Log formatını oluştur
const formatLog = (level, message, details = {}) => {
  const timestamp = new Date().toLocaleString('tr-TR', { 
    timeZone: 'Europe/Istanbul' 
  });
  
  return `[${timestamp}] [${level}] ${message}\nDetaylar: ${JSON.stringify(details, null, 2)}\n${'-'.repeat(80)}\n`;
};

// Log dosyasına yaz
const writeToLog = (logEntry) => {
  fs.appendFileSync(LOG_FILE, logEntry, { encoding: 'utf8' });
};

// Log fonksiyonları
export const logInfo = (message, details = {}) => {
  const logEntry = formatLog(LOG_LEVELS.INFO, message, details);
  writeToLog(logEntry);
};

export const logAdmin = (message, details = {}) => {
  const logEntry = formatLog(LOG_LEVELS.ADMIN, message, details);
  writeToLog(logEntry);
};

export const logError = (message, details = {}) => {
  const logEntry = formatLog(LOG_LEVELS.ERROR, message, details);
  writeToLog(logEntry);
};

export const logWarning = (message, details = {}) => {
  const logEntry = formatLog(LOG_LEVELS.WARNING, message, details);
  writeToLog(logEntry);
};

export const logSecurity = (message, details = {}) => {
  const logEntry = formatLog(LOG_LEVELS.SECURITY, message, details);
  writeToLog(logEntry);
};

// Log dosyasını oluştur (eğer yoksa)
if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, '=== Sistem Log Dosyası ===\n\n', { encoding: 'utf8' });
} 