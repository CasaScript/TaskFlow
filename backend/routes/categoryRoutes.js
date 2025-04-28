const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const Joi = require('joi');

// Schéma de validation Joi
const categorySchema = Joi.object({
  nom: Joi.string().min(3).required(),
  description: Joi.string().max(500).optional()
});

// Créer une catégorie (Protégé par JWT)
router.post('/', auth, async (req, res) => {
  try {
    // Validation
    const { error } = categorySchema.validate(req.body);
    if (error) return res.status(400).json({ errors: error.details });

    // Création
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Ajoutez d'autres routes (GET, PUT, DELETE) ici...

module.exports = router;