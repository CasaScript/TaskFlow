// backend/utils/logger.js
const { createLogger, transports, format } = require("winston");
const { combine, timestamp, printf } = format;

// Format personnalisé
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Configuration des transports (fichiers + console)
const logger = createLogger({
  level: "info",
  format: combine(timestamp(), logFormat),
  transports: [
    new transports.File({ 
      filename: "logs/error.log", 
      level: "error" 
    }),
    new transports.File({ 
      filename: "logs/combined.log" 
    }),
    new transports.Console() // Affiche les logs dans la console
  ],
});

module.exports = logger;