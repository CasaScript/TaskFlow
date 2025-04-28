const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const helmet = require("helmet");
const cookieParser = require("cookie-parser"); 
const rateLimit = require("./middleware/rateLimit");
const morgan = require("morgan");


const app = express();

// Middlewares de sécurité
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Autoriser les cookies
}));
app.use(express.json());
app.use(helmet());
app.use(cookieParser());

// Connexion à MongoDB (avec options)
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connecté à MongoDB"))
.catch(err => console.error("Échec de connexion :", err));

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

app.use("/api/users", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/categories", categoryRoutes);

// Middleware d'erreur
app.use(errorHandler);

// Limiteur de taux
app.use(rateLimit());
app.use('/api/users/login', authLimiter); // Limite les requêtes de connexion à 5 par 15 minutes
app.use('/api/users/register', authLimiter); // Limite les requêtes d'inscription à 5 par 15 minutes

// Logger de requêtes
app.use(morgan("dev"));

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));