const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 100 requests per windowMs
  message: "Trop de requêtes de cette adresse IP, veuillez réessayer plus tard.",
  Headers: true,
});

module.exports = authLimiter;