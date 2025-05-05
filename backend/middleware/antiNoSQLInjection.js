
module.exports = (req, res, next) => {
    const payload = { ...req.body, ...req.query, ...req.params };
  
    // Vérifier les opérateurs MongoDB interdits
    const hasForbiddenKeys = Object.keys(payload).some((key) => 
      key.startsWith("$") || typeof payload[key] === "object"
    );
  
    if (hasForbiddenKeys) {
      logger.warn(`Tentative d'injection NoSQL depuis l'IP ${req.ip}`);
      return res.status(400).json({ error: "Requête bloquée pour sécurité" });
    }
  
    next();
  };
  
