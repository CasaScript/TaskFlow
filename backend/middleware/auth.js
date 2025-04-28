
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  // Récupérer le token depuis les headers
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Accès refusé" });
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-mot_de_passe"); // Ne pas renvoyer le mot de passe
    
    if (!user) throw new Error();
    req.user = user; // Ajouter l'utilisateur à la requête
    next();
  } catch (err) {
    res.status(401).json({ error: "Token invalide" });
  }
};
