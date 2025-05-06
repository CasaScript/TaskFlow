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
// const mongoSanitize = require("express-mongo-sanitize");
const antiNoSQLInjection = require("./middleware/antiNoSQLInjection");
const authLimiter = require("./middleware/rateLimit");
const app = express();

// CORS configuration avec options plus strictes
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600 // Cache preflight requests for 10 minutes
}));

// Middleware de sécurité
app.use(cookieParser());
app.use(express.json());
app.use(helmet());
// app.use(mongoSanitize({
//   replaceWith: '_'
// }));
app.use(antiNoSQLInjection);

// Health check endpoint en premier pour éviter les middlewares inutiles
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Connexion MongoDB avec retry
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI, {})
    .then(() => console.log("Connecté à MongoDB"))
    .catch(err => {
      console.error("Échec de connexion MongoDB:", err);
      setTimeout(connectWithRetry, 5000);
    });
};
connectWithRetry();

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Application des routes avec préfixe API
app.use("/api/users", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/notifications", notificationRoutes);

// Limiteur de taux après les routes de health check
app.use(rateLimit);
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

// Logger configuration
const logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, 'access.log'),
  { flags: 'a' }
);

app.use(morgan('combined', { stream: accessLogStream }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Tâches planifiées
schedule.scheduleJob('0 * * * *', async () => {
  await ReminderService.checkDeadlines();
});

// Vérifier les échéances à venir une fois par jour à 9h
schedule.scheduleJob('0 9 * * *', async () => {
  await ReminderService.checkUpcomingDeadlines();
});

// Gestion des erreurs en dernier
app.use(errorHandler);

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
// Démarre le serveur UNIQUEMENT si on n'est pas en mode test
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}

module.exports = app;