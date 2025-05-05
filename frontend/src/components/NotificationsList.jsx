import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, IconButton, Badge, Box, Typography } from '@mui/material';
import { Delete as DeleteIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { notificationService } from '../api/notificationService';
import { useNotification } from '../context/NotificationContext';

const NotificationsList = () => {
  const [notifications, setNotifications] = useState([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      showNotification('Erreur lors du chargement des notifications', 'error');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(notif => 
        notif._id === notificationId ? { ...notif, lu: true } : notif
      ));
    } catch (err) {
      showNotification('Erreur lors du marquage de la notification', 'error');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(notifications.filter(notif => notif._id !== notificationId));
      showNotification('Notification supprimée', 'success');
    } catch (err) {
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(notif => ({ ...notif, lu: true })));
      showNotification('Toutes les notifications ont été marquées comme lues', 'success');
    } catch (err) {
      showNotification('Erreur lors du marquage des notifications', 'error');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          Notifications
          <Badge 
            badgeContent={notifications.filter(n => !n.lu).length} 
            color="primary" 
            sx={{ ml: 2 }}
          />
        </Typography>
        {notifications.some(n => !n.lu) && (
          <IconButton onClick={handleMarkAllAsRead} title="Marquer tout comme lu">
            <CheckCircleIcon />
          </IconButton>
        )}
      </Box>
      <List>
        {notifications.map((notification) => (
          <ListItem
            key={notification._id}
            sx={{
              bgcolor: notification.lu ? 'transparent' : 'action.hover',
              mb: 1,
              borderRadius: 1
            }}
            secondaryAction={
              <>
                {!notification.lu && (
                  <IconButton 
                    edge="end" 
                    onClick={() => handleMarkAsRead(notification._id)}
                    title="Marquer comme lu"
                  >
                    <CheckCircleIcon />
                  </IconButton>
                )}
                <IconButton 
                  edge="end" 
                  onClick={() => handleDelete(notification._id)}
                  title="Supprimer"
                >
                  <DeleteIcon />
                </IconButton>
              </>
            }
          >
            <ListItemText
              primary={notification.message}
              secondary={new Date(notification.dateCreation).toLocaleString()}
            />
          </ListItem>
        ))}
        {notifications.length === 0 && (
          <Typography color="text.secondary" align="center">
            Aucune notification
          </Typography>
        )}
      </List>
    </Box>
  );
};

export default NotificationsList;