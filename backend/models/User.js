const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
   nom: { type: String, required: true },
   email: { type: String, required: true, unique: true },
   motDePasse: { type: String, required: true },
   dateCreation: { type: Date, default: Date.now },
   dernierConnexion: { type: Date },
});

// Middleware pour hacher le mot de passe avant la sauvegarde
userSchema.pre("save", async function (next) {
   if (!this.isModified("motDePasse")) return next();
   this.motDePasse = await bcrypt.hash(this.motDePasse, 10);
});

// Mettre à jour la date de dernière connexion avant la sauvegarde 
userSchema.pre("save", function (next) {
  if (this.isModified("dernierConnexion")){
    this.dernierConnexion = Date.now();
  }
  next();
});

// Masquer le mot de passe dans les réponses JSON
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.motDePasse;
  return userObject;
};

// Création d'index pour optimiser les recherches
//userSchema.index({ email: 1 });

module.exports = mongoose.model("Utilisateur", userSchema); 