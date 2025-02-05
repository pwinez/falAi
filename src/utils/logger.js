// Log seviyeleri
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
  
  return {
    timestamp,
    level,
    message,
    details
  };
};

// Log fonksiyonları
export const logInfo = (message, details = {}) => {
  const logEntry = formatLog(LOG_LEVELS.INFO, message, details);
  console.log(`[${logEntry.timestamp}] [${logEntry.level}]`, message, details);
};

export const logAdmin = (message, details = {}) => {
  const logEntry = formatLog(LOG_LEVELS.ADMIN, message, details);
  console.info(`[${logEntry.timestamp}] [${logEntry.level}]`, message, details);
};

export const logError = (message, details = {}) => {
  const logEntry = formatLog(LOG_LEVELS.ERROR, message, details);
  console.error(`[${logEntry.timestamp}] [${logEntry.level}]`, message, details);
};

export const logWarning = (message, details = {}) => {
  const logEntry = formatLog(LOG_LEVELS.WARNING, message, details);
  console.warn(`[${logEntry.timestamp}] [${logEntry.level}]`, message, details);
};

export const logSecurity = (message, details = {}) => {
  const logEntry = formatLog(LOG_LEVELS.SECURITY, message, details);
  console.info(`[${logEntry.timestamp}] [${logEntry.level}]`, message, details);
}; 