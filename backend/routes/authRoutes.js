const Joi = require('joi');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger').default; // Importer le logger

const userSchema = Joi.object({
    nom: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    motDePasse: Joi.string().min(6).required()
  });


  
 // Route d'inscription
router.post("/register", async (req, res) => {
  try {
    const { nom, email, mot_de_passe } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Cet email est déjà utilisé" });
    }

    // Créer un nouvel utilisateur (le mot de passe est hashé automatiquement via le modèle User)
    const user = new User({ nom, email, mot_de_passe });
    await user.save();

    // Générer un token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de l'inscription" });
  }
});

// Route de connexion
router.post("/login", async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Identifiants incorrects" });
      logger.info(`Connexion réussie pour l'utilisateur ${user.email}`);
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isMatch) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    // Générer un token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Utiliser secure si en production
      sameSite: "Strict",
      maxAge: 3600000, // 1 heure
      domain: process.env.NODE_ENV === "production" ? "yourdomain.com" : undefined, 
      path: "/",
    });





//Répondre avec le token et les informations de l'utilisateur
    res.json({ token });
  } catch (err) {
    logger.error(`Echec de connexion depuis l'IP ${req.ip} : ${err.message}`);
    res.status(500).json({ error: "Erreur lors de la connexion" }); 
  }
});

// Route de déconnexion
router.post("/logout", (req, res) => {
  logger.info(`Déconnexion de l'utilisateur ${req.user?.email}`);
  res.clearCookie("token");
  res.status(200).json({ message: "Déconnexion réussie" });
});


module.exports = router;