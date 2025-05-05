class NotificationPushService {
  static async requestPermission() {
    if (!('Notification' in window)) {
      throw new Error('Ce navigateur ne prend pas en charge les notifications');
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static async showNotification(title, options = {}) {
    if (!('Notification' in window)) {
      return false;
    }

    try {
      const settings = JSON.parse(localStorage.getItem('reminderSettings') || '{}');
      
      if (!settings.enableBrowserNotifications) {
        return false;
      }

      if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
          icon: '/vite.svg',
          badge: '/vite.svg',
          ...options
        });

        notification.onclick = function() {
          if (options.url) {
            window.open(options.url);
          }
          notification.close();
        };

        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur lors de l\'affichage de la notification:', error);
      return false;
    }
  }

  static async showDeadlineNotification(task) {
    const timeUntilDeadline = new Date(task.dateEcheance) - new Date();
    const daysUntilDeadline = Math.ceil(timeUntilDeadline / (1000 * 60 * 60 * 24));
    
    let urgencyLevel;
    if (daysUntilDeadline <= 1) {
      urgencyLevel = 'high';
    } else if (daysUntilDeadline <= 3) {
      urgencyLevel = 'medium';
    } else {
      urgencyLevel = 'low';
    }

    const options = {
      body: `La tâche "${task.titre}" arrive à échéance dans ${daysUntilDeadline} jour${daysUntilDeadline > 1 ? 's' : ''}`,
      tag: `deadline-${task._id}`,
      requireInteraction: urgencyLevel === 'high',
      url: `/tasks/${task._id}`,
      actions: [
        {
          action: 'view',
          title: 'Voir la tâche'
        },
        {
          action: 'dismiss',
          title: 'Ignorer'
        }
      ]
    };

    return this.showNotification('Rappel d\'échéance TaskFlow', options);
  }
}

export default NotificationPushService;