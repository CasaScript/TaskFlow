import api from './axiosConfig';

export const notificationService = {
  // Récupérer toutes les notifications
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Marquer une notification comme lue
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/lu`);
    return response.data;
  },

  // Marquer toutes les notifications comme lues
  markAllAsRead: async () => {
    const response = await api.put('/notifications/marquer-tout-lu');
    return response.data;
  },

  // Supprimer une notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  }
};