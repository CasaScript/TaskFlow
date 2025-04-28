const express = require('express');
const Joi = require('joi');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth'); // Middleware d'authentification

// Créer une tâche (protégé par JWT)
router.post('/', auth, async (req, res) => {
  try {
    const task = new Task({ ...req.body, utilisateur: req.user.id });
    await task.save();
    res.status(201).send(task);
  } catch (err) {
    res.status(400).send({ error: 'Erreur lors de la création' });
  }
});

// Schéma de validation Joi pour les tâches
const tacheSchema = Joi.object({
    titre: Joi.string()
      .min(3)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Le titre est requis',
        'string.min': 'Le titre doit contenir au moins {#limit} caractères',
        'string.max': 'Le titre ne peut pas dépasser {#limit} caractères'
      }),
      
    description: Joi.string()
      .max(500)
      .allow('')
      .messages({
        'string.max': 'La description ne peut pas dépasser {#limit} caractères'
      }),
      
    dateEcheance: Joi.date()
      .min('now')
      .messages({
        'date.min': 'La date d\'échéance doit être future'
      }),
      
    statut: Joi.string()
      .valid('à faire', 'en cours', 'terminée')
      .default('à faire'),
      
    priorite: Joi.string()
      .valid('basse', 'moyenne', 'haute')
      .default('moyenne'),
      
    utilisateur: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'ID utilisateur invalide'
      }),
      
    categories: Joi.array()
      .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
      .messages({
        'string.pattern.base': 'ID catégorie invalide'
      })
  });
  
  // Middleware de validation
  const validateTache = async (req, res, next) => {
    try {
      await tacheSchema.validateAsync(req.body, { abortEarly: false });
      next();
    } catch (error) {
      const errors = error.details.map(detail => ({
        field: detail.context.key,
        message: detail.message
      }));
      return res.status(400).json({ errors });
    }
  };
  
  // Middleware pour vérifier si l'ID est valide
  const validateId = async (req, res, next) => {
    const idSchema = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required();
    try {
      await idSchema.validateAsync(req.params.id);
      next();
    } catch (error) {
      return res.status(400).json({ message: 'ID tâche invalide' });
    }
  };
  
  /**
   * POST /api/taches
   * Création d'une nouvelle tâche
   */
  router.post('/', validateTache, async (req, res) => {
    try {
      const tache = new Tache(req.body);
      await tache.save();
      
      const tachePopulee = await Tache.findById(tache._id)
        .populate('utilisateur', '-motDePasse')
        .populate('categories');
        
      res.status(201).json(tachePopulee);
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de la création de la tâche',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  });
  
  /**
   * GET /api/taches
   * Récupération de toutes les tâches avec pagination
   */
  router.get('/', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
  
      // Construire le query filter
      const filter = {};
      if (req.query.statut) filter.statut = req.query.statut;
      if (req.query.priorite) filter.priorite = req.query.priorite;
  
      // Construire le sort
      const sort = {};
      if (req.query.sort) {
        const [field, order] = req.query.sort.split(':');
        sort[field] = order === 'desc' ? -1 : 1;
      } else {
        sort.dateCreation = -1; // Par défaut, trier par date de création décroissante
      }
  
      const [taches, total] = await Promise.all([
        Tache.find(filter)
          .populate('utilisateur', '-motDePasse')
          .populate('categories')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Tache.countDocuments(filter)
      ]);
  
      res.json({
        taches,
        pagination: {
          page,
          limit,
          totalDocs: total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des tâches',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
  
  /**
   * GET /api/taches/:id
   * Récupération d'une tâche par ID
   */
  router.get('/:id', validateId, async (req, res) => {
    try {
      const tache = await Tache.findById(req.params.id)
        .populate('utilisateur', '-motDePasse')
        .populate('categories')
        .lean();
  
      if (!tache) {
        return res.status(404).json({ message: "Tâche non trouvée" });
      }
      res.json(tache);
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de la récupération de la tâche',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
  
  /**
   * PUT /api/taches/:id
   * Mise à jour d'une tâche
   */
  router.put('/:id', [validateId, validateTache], async (req, res) => {
    try {
      const tache = await Tache.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { 
          new: true, 
          runValidators: true 
        }
      )
      .populate('utilisateur', '-motDePasse')
      .populate('categories')
      .lean();
  
      if (!tache) {
        return res.status(404).json({ message: "Tâche non trouvée" });
      }
      res.json(tache);
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de la mise à jour de la tâche',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
  
  /**
   * DELETE /api/taches/:id
   * Suppression d'une tâche
   */
  router.delete('/:id', validateId, async (req, res) => {
    try {
      const tache = await Tache.findByIdAndDelete(req.params.id);
      if (!tache) {
        return res.status(404).json({ message: "Tâche non trouvée" });
      }
      res.json({ 
        message: "Tâche supprimée avec succès",
        id: req.params.id
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de la suppression de la tâche',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
  
  /**
   * GET /api/taches/utilisateur/:id
   * Récupération des tâches d'un utilisateur avec pagination
   */
  router.get('/utilisateur/:id', validateId, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
  
      const [taches, total] = await Promise.all([
        Tache.find({ utilisateur: req.params.id })
          .populate('utilisateur', '-motDePasse')
          .populate('categories')
          .sort({ dateCreation: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Tache.countDocuments({ utilisateur: req.params.id })
      ]);
  
      res.json({
        taches,
        pagination: {
          page,
          limit,
          totalDocs: total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des tâches de l\'utilisateur',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
  
  module.exports = router;