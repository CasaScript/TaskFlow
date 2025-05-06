import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Box,
  Typography,
  Tab,
  Tabs,
  IconButton,
  Drawer,
  Fab,
  Button
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  Add as AddIcon,
  Logout as LogoutIcon 
} from '@mui/icons-material';
import NotificationsList from '../components/NotificationsList';
import ReminderSettings from '../components/ReminderSettings';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const { logout } = useAuth();
  const { showNotification } = useNotification();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      showNotification('Déconnexion réussie', 'success');
    } catch (error) {
      showNotification('Erreur lors de la déconnexion', 'error');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* En-tête avec titre, paramètres et déconnexion */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4">Tableau de bord</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={toggleSettings} title="Paramètres des notifications">
                <SettingsIcon />
              </IconButton>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Déconnexion
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Section principale */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
              <Tab label="Tâches à venir" />
              <Tab label="Notifications" />
            </Tabs>

            {activeTab === 0 ? (
              <TaskList />
            ) : (
              <NotificationsList />
            )}
          </Paper>
        </Grid>

        {/* Panneau latéral */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, position: 'relative', minHeight: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Rappels d'échéance
            </Typography>
            {/* Le composant DeadlineReminders est déjà présent globalement */}
          </Paper>
        </Grid>
      </Grid>

      {/* Drawer pour les paramètres */}
      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={toggleSettings}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Paramètres des notifications
          </Typography>
          <ReminderSettings />
        </Box>
      </Drawer>

      {/* Bouton d'ajout de tâche */}
      <Fab 
        color="primary" 
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setNewTaskOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Modal de création de tâche */}
      {newTaskOpen && (
        <TaskForm
          open={true}
          handleClose={() => setNewTaskOpen(false)}
          onTaskSaved={() => setNewTaskOpen(false)}
        />
      )}
    </Container>
  );
};

export default Dashboard;