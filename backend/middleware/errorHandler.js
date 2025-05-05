const logger = require('../utils/logger').default; 
module.exports = (err, req, res, next) => {
  // Journalisation détaillée
  logger.error(`${err.message}\nStack: ${err.stack}\n`);

  res.status(500).json({
    error: "Erreur serveur",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};


const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      error: "Erreur serveur",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  };
  
  module.exports = errorHandler;