const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const Joi = require("joi");

// Schéma de validation
const userUpdateSchema = Joi.object({
  nom: Joi.string()
  .min(2)
  .max(50)
  .required()
  .messages({
    'string.empty': 'Le nom est requis',
    'string.min': 'Le nom doit contenir au moins {#limit} caractères',
    'string.max': 'Le nom ne peut pas dépasser {#limit} caractères'
  }),

email: Joi.string()
  .email()
  .required()
  .messages({
    'string.email': 'Format d\'email invalide',
    'string.empty': 'L\'email est requis'
  }),

motDePasse: Joi.string()
  .min(6)
  .pattern(new RegExp('^[a-zA-Z0-9]{6,30}$'))
  .required()
  .messages({
    'string.pattern.base': 'Le mot de passe doit contenir entre 6 et 30 caractères alphanumériques',
    'string.empty': 'Le mot de passe est requis',
    'string.min': 'Le mot de passe doit contenir au moins {#limit} caractères'
  })
});

// Récupérer le profil utilisateur
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-motDePasse -__v");
    res.json(user);
  } catch (err) {
    res.status(500).json({ 
      error: "Erreur serveur",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Mettre à jour l'utilisateur (version corrigée)
router.put("/:id", auth, async (req, res) => {
  try {
    // 1. Validation Joi
    const { error } = userUpdateSchema.validate(req.body);
    if (error) return res.status(400).json({ errors: error.details });

    // 2. Vérification des droits
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: "Action non autorisée" });
    }

    // 3. Mise à jour sécurisée
    const allowedUpdates = ['nom', 'email'];
    const updates = Object.keys(req.body);
    
    const isValidUpdate = updates.every(update => 
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      return res.status(400).json({ error: "Champs invalides" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select("-motDePasse -__v");

    res.json(user);
  } catch (err) {
    res.status(400).json({
      error: "Échec de la mise à jour",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Supprimer l'utilisateur
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: "Action non autorisée" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Compte supprimé avec succès" });
  } catch (err) {
    res.status(500).json({
      error: "Erreur serveur",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;