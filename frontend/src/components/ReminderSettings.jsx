import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel,
  Slider,
  Button
} from '@mui/material';
import { useNotification } from '../context/NotificationContext';

const ReminderSettings = () => {
  const [settings, setSettings] = useState({
    enableEmailNotifications: false,
    enableBrowserNotifications: true,
    reminderDays: [1, 3, 7], // Jours avant l'échéance
    notificationTimes: ['09:00'], // Heures de notification
  });

  const { showNotification } = useNotification();

  // Charger les préférences de l'utilisateur depuis le localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('reminderSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Sauvegarder les changements
  const handleSave = () => {
    localStorage.setItem('reminderSettings', JSON.stringify(settings));
    showNotification('Préférences de notification enregistrées', 'success');
  };

  // Demander la permission pour les notifications du navigateur
  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setSettings(prev => ({
          ...prev,
          enableBrowserNotifications: true
        }));
        showNotification('Notifications du navigateur activées', 'success');
      } else {
        showNotification('Permission refusée pour les notifications', 'error');
      }
    } catch (err) {
      showNotification('Erreur lors de la demande de permission', 'error');
    }
  };

  return (
    <Card sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Paramètres des rappels
        </Typography>

        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.enableEmailNotifications}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  enableEmailNotifications: e.target.checked
                }))}
              />
            }
            label="Recevoir les notifications par email"
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.enableBrowserNotifications}
                onChange={(e) => {
                  if (e.target.checked) {
                    requestNotificationPermission();
                  } else {
                    setSettings(prev => ({
                      ...prev,
                      enableBrowserNotifications: false
                    }));
                  }
                }}
              />
            }
            label="Recevoir les notifications du navigateur"
          />
        </FormGroup>

        <Box sx={{ mt: 3 }}>
          <Typography gutterBottom>
            Rappels avant l'échéance (en jours)
          </Typography>
          <Slider
            value={Math.max(...settings.reminderDays)}
            max={14}
            min={1}
            step={1}
            marks={[
              { value: 1, label: '1j' },
              { value: 3, label: '3j' },
              { value: 7, label: '7j' },
              { value: 14, label: '14j' }
            ]}
            onChange={(_, value) => {
              setSettings(prev => ({
                ...prev,
                reminderDays: [1, value >= 3 ? 3 : null, value >= 7 ? 7 : null].filter(Boolean)
              }));
            }}
          />
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSave}
          >
            Enregistrer les préférences
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ReminderSettings;