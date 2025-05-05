const Task = require('../models/Task');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

class ReminderService {
  static async checkDeadlines() {
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Trouver les tâches qui arrivent à échéance dans les prochaines 24h
      const tasks = await Task.find({
        dateEcheance: {
          $gte: today,
          $lte: tomorrow
        },
        statut: { $ne: 'Terminé' }
      }).populate('utilisateur');

      // Créer des notifications pour chaque tâche
      for (const task of tasks) {
        // Vérifier si une notification existe déjà pour cette échéance
        const existingNotification = await Notification.findOne({
          'message': { $regex: new RegExp(`${task.titre}.*arrive à échéance`) },
          'dateCreation': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (!existingNotification) {
          const timeUntilDeadline = task.dateEcheance.getTime() - Date.now();
          const hoursLeft = Math.round(timeUntilDeadline / (1000 * 60 * 60));

          await Notification.create({
            utilisateur: task.utilisateur._id,
            message: `La tâche "${task.titre}" arrive à échéance dans ${hoursLeft} heures`,
            type: hoursLeft <= 2 ? 'error' : hoursLeft <= 12 ? 'warning' : 'info',
            lienAction: `/tasks/${task._id}`
          });

          logger.info(`Notification d'échéance créée pour la tâche: ${task.titre}`);
        }
      }
    } catch (error) {
      logger.error('Erreur lors de la vérification des échéances:', error);
    }
  }

  static async checkUpcomingDeadlines() {
    try {
      const today = new Date();
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(today.getDate() + 3);

      // Trouver les tâches qui arrivent à échéance dans les 3 prochains jours
      const tasks = await Task.find({
        dateEcheance: {
          $gte: today,
          $lte: threeDaysFromNow
        },
        statut: { $ne: 'Terminé' }
      }).populate('utilisateur');

      for (const task of tasks) {
        const daysUntilDeadline = Math.ceil((task.dateEcheance - today) / (1000 * 60 * 60 * 24));

        // Ne créer une notification que si elle n'existe pas déjà
        const existingNotification = await Notification.findOne({
          'message': { $regex: new RegExp(`${task.titre}.*dans ${daysUntilDeadline} jours`) },
          'dateCreation': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (!existingNotification) {
          await Notification.create({
            utilisateur: task.utilisateur._id,
            message: `Rappel: La tâche "${task.titre}" arrive à échéance dans ${daysUntilDeadline} jours`,
            type: 'info',
            lienAction: `/tasks/${task._id}`
          });

          logger.info(`Notification de rappel créée pour la tâche: ${task.titre}`);
        }
      }
    } catch (error) {
      logger.error('Erreur lors de la vérification des échéances à venir:', error);
    }
  }
}

module.exports = ReminderService;