import React, { createContext, useContext, useState, useEffect } from 'react';
import Notification from '../components/Notification';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' // 'error', 'warning', 'info', 'success'
  });
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Vérifier si les notifications sont supportées
    if ('Notification' in window) {
      // Demander la permission si ce n'est pas déjà fait
      if (Notification.permission === 'granted') {
        setHasPermission(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          setHasPermission(permission === 'granted');
        });
      }
    }
  }, []);

  const showNotification = (message, severity = 'info', showSystemNotif = false) => {
    // Afficher la notification dans l'application
    setNotification({
      open: true,
      message,
      severity,
    });

    // Si demandé et autorisé, afficher aussi une notification système
    if (showSystemNotif && hasPermission) {
      new Notification('TaskFlow', {
        body: message,
        icon: '/vite.svg'  // Vous pouvez changer l'icône
      });
    }
  };

  const closeNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hasPermission }}>
      {children}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={closeNotification}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification doit être utilisé dans un NotificationProvider');
  }
  return context;
};