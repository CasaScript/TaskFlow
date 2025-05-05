const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Récupérer toutes les notifications de l'utilisateur connecté
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      utilisateur: req.user._id 
    })
    .sort({ dateCreation: -1 })
    .limit(50);
    
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des notifications" });
  }
});

// Marquer une notification comme lue
router.put('/:id/lu', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, utilisateur: req.user._id },
      { lu: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification non trouvée" });
    }

    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la mise à jour de la notification" });
  }
});

// Marquer toutes les notifications comme lues
router.put('/marquer-tout-lu', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { utilisateur: req.user._id, lu: false },
      { lu: true }
    );

    res.json({ message: "Toutes les notifications ont été marquées comme lues" });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la mise à jour des notifications" });
  }
});

// Supprimer une notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      utilisateur: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification non trouvée" });
    }

    res.json({ message: "Notification supprimée" });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la suppression de la notification" });
  }
});

module.exports = router;