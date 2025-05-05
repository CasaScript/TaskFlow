const express = require("express");
const mongoose = require("mongoose");
const schedule = require('node-schedule');
const ReminderService = require('./services/reminderService');
require("dotenv").config();
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const helmet = require("helmet");
const cookieParser = require("cookie-parser"); 
const rateLimit = require("./middleware/rateLimit");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const mongoSanitize = require("express-mongo-sanitize");
const antiNoSQLInjection = require("./middleware/antiNoSQLInjection");
const authLimiter = require("./middleware/rateLimit"); 
const app = express();
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./docs/swagger.yaml");

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

// Middlewares de sécurité
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Autoriser les cookies
}));
app.use(express.json()); // Parser le JSON
app.use(helmet()); // Sécuriser les en-têtes HTTP
app.use(cookieParser()); // Parser les cookies
app.use(antiNoSQLInjection); // Middleware pour prévenir les injections NoSQL
app.use(errorHandler); // Middleware pour gérer les erreurs



// Activer la sanitisation des données
//app.use(mongoSanitize({
  //replaceWith: '_', 
  //replace: '_',  
//}));




// Connexion à MongoDB (avec options)
mongoose.connect(process.env.MONGODB_URI, {})
.then(() => console.log("Connecté à MongoDB"))
.catch(err => console.error("Échec de connexion :", err));

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

app.use("/api/users", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/notifications", notificationRoutes);



// NoSQL Injection Prevention


// Limiteur de taux
app.use(rateLimit);
app.use('/api/users/login', authLimiter); // Limite les requêtes de connexion à 5 par 15 minutes
app.use('/api/users/register', authLimiter); // Limite les requêtes d'inscription à 5 par 15 minutes



// Logger de requêtes
const logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}   


//configuration de Morgan pour enregistrer les requêtes dans un fichier
const accessLogStream = fs .createWriteStream(path.join(logDirectory, 'access.log'), { flags: 'a' });
//Middleware de morgan pour logger les requêtes HTTP
app.use(morgan('combined', { stream: accessLogStream }));
//détaillé en production
app.use(morgan('dev'));

// Configuration des tâches planifiées
// Vérifier les échéances toutes les heures
schedule.scheduleJob('0 * * * *', async () => {
  await ReminderService.checkDeadlines();
});

// Vérifier les échéances à venir une fois par jour à 9h
schedule.scheduleJob('0 9 * * *', async () => {
  await ReminderService.checkUpcomingDeadlines();
});



// Démarrage du serveur
const PORT = process.env.PORT || 5000;
// Démarre le serveur UNIQUEMENT si on n'est pas en mode test
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}

module.exports = app; // Exporter l'application pour les tests