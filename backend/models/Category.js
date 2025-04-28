const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    nom: { type: String, required: true, unique: true },
    description: { type: String },
    dateCreation: { type: Date, default: Date.now },
    dateModification: { type: Date },
    icone: { type: String },
    taches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tache' }]
});

// Index pour optimiser les recherches
categorySchema.index({ dateCreation: 1 });
categorySchema.index({ dateModification: 1 });


module.exports = mongoose.model('Categorie', categorySchema);

