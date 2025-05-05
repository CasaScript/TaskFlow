const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
   titre: { type: String, required: true, minlength: 3 },
   description: { type: String, maxlength: 500 },
   dateEcheance: { type: Date, required: true },
   priorite: { 
      type: String, 
      enum: ["Basse", "Moyenne", "Haute"], 
      default: "Moyenne" 
   },
   statut: { 
      type: String, 
      enum: ["À faire", "En cours", "Terminé"], 
      default: "À faire" 
   },
   utilisateur: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Utilisateur", 
      required: true 
   },
   categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categorie"
   }],
   dateCreation: { type: Date, default: Date.now },
   dateModification: { type: Date },
   rappels: [{
      date: Date,
      envoye: { type: Boolean, default: false }
   }]
});

// Middleware pour générer automatiquement les dates de rappel
taskSchema.pre('save', function(next) {
   if (this.isNew || this.isModified('dateEcheance')) {
      const echeance = new Date(this.dateEcheance);
      this.rappels = [
         { date: new Date(echeance.getTime() - 24 * 60 * 60 * 1000) }, // 1 jour avant
         { date: new Date(echeance.getTime() - 3 * 24 * 60 * 60 * 1000) }, // 3 jours avant
         { date: new Date(echeance.getTime() - 7 * 24 * 60 * 60 * 1000) }  // 1 semaine avant
      ];
   }
   next();
});

// Index composé pour les recherches fréquentes
taskSchema.index({ utilisateur: 1, statut: 1, dateEcheance: 1 });
taskSchema.index({ 'rappels.date': 1, 'rappels.envoye': 1 });

module.exports = mongoose.model("Tache", taskSchema);