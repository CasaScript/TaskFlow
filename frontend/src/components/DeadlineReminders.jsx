import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Badge, IconButton } from '@mui/material';
import { AccessTime as AccessTimeIcon, Check as CheckIcon } from '@mui/icons-material';
import { notificationService } from '../api/notificationService';
import { useNotification } from '../context/NotificationContext';

const DeadlineReminders = () => {
  const [deadlineNotifications, setDeadlineNotifications] = useState([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadDeadlineNotifications();
    // Rafraîchir les notifications toutes les 5 minutes
    const interval = setInterval(loadDeadlineNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDeadlineNotifications = async () => {
    try {
      const notifications = await notificationService.getNotifications();
      // Filtrer pour ne garder que les notifications d'échéance non lues
      const deadlines = notifications.filter(
        notif => notif.message.includes('échéance') && !notif.lu
      );
      setDeadlineNotifications(deadlines);
    } catch (err) {
      showNotification('Erreur lors du chargement des rappels', 'error');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setDeadlineNotifications(prev => 
        prev.filter(notif => notif._id !== notificationId)
      );
    } catch (err) {
      showNotification('Erreur lors du marquage de la notification', 'error');
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, maxWidth: 400, zIndex: 1000 }}>
      {deadlineNotifications.map((notification) => (
        <Card 
          key={notification._id} 
          sx={{ 
            mb: 1, 
            backgroundColor: notification.type === 'error' ? '#ffebee' : 
                           notification.type === 'warning' ? '#fff3e0' : '#e3f2fd'
          }}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AccessTimeIcon color={notification.type} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body1">
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(notification.dateCreation).toLocaleString()}
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={() => handleMarkAsRead(notification._id)}
              title="Marquer comme lu"
            >
              <CheckIcon />
            </IconButton>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default DeadlineReminders;