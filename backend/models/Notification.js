const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  lu: {
    type: Boolean,
    default: false
  },
  lienAction: {
    type: String
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

// Index pour améliorer les performances des requêtes
notificationSchema.index({ utilisateur: 1, lu: 1, dateCreation: -1 });

module.exports = mongoose.model('Notification', notificationSchema);