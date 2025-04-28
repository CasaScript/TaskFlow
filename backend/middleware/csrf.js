const crypto = require("crypto");

// Génère un token CSRF et le stocke dans un cookie
const generateCSRFToken = (req, res, next) => {
  const csrfToken = crypto.randomBytes(32).toString("hex");
  res.cookie("csrf-token", csrfToken, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production" 
  });
  req.csrfToken = csrfToken;
  next();
};

// Vérifie le token CSRF pour les requêtes critiques
const verifyCSRFToken = (req, res, next) => {
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    const csrfCookie = req.cookies["csrf-token"];
    const csrfHeader = req.headers["x-csrf-token"];
    if (!csrfCookie || csrfCookie !== csrfHeader) {
      return res.status(403).json({ error: "Action non autorisée" });
    }
  }
  next();
};

module.exports = { generateCSRFToken, verifyCSRFToken };