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
// GET: Récupérer toutes les catégories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);                                                           

  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}); 

// Récupérer une catégorie par ID
router.get('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('taches');
    if (!category) return res.status(404).json({ error: "Catégorie non trouvée" });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

//Mise à jour d'une catégorie (Protégé par JWT)
router.put('/:id', auth, async (req, res) => {
  try {
    const { error } = categorySchema.validate(req.body);
    if (error) return res.status(400).json({ errors: error.details });

    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true} );
    if (!category) return res.status(404).json({ error: "Catégorie non trouvée" });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}); 

// Supprimer une catégorie (Protégé par JWT)
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Catégorie non trouvée" });
    }
    res.status(200).json({ message: "Catégorie supprimée" });

  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupération des tâches d'une catégorie (Protégé par JWT)
router.get('/:id/taches', auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('taches');
    if (!category) return res.status(404).json({ error: "Catégorie non trouvée" });
    res.status(200).json(category.taches);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;