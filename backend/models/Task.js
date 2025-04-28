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
      ref: "User", 
      required: true 
   },
   categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
   }],
   dateCreation: { type: Date, default: Date.now },
   dateModification: { type: Date }
});

// Index composé pour les recherches fréquentes
taskSchema.index({ utilisateur: 1, statut: 1, dateEcheance: 1 });

module.exports = mongoose.model("Tache", taskSchema);