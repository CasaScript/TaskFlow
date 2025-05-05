import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  OutlinedInput
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { fr } from 'date-fns/locale';
import api from '../api/axiosConfig';
import { useNotification } from '../context/NotificationContext';

const PRIORITY_OPTIONS = [
  { value: 'Basse', color: '#4CAF50' },
  { value: 'Moyenne', color: '#FF9800' },
  { value: 'Haute', color: '#F44336' }
];

const STATUS_OPTIONS = [
  { value: 'À faire', color: '#90CAF9' },
  { value: 'En cours', color: '#FFB74D' },
  { value: 'Terminé', color: '#81C784' }
];

const TaskForm = ({ open, handleClose, task = null, onTaskSaved }) => {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    dateEcheance: new Date(),
    priorite: 'Moyenne',
    statut: 'À faire',
    categories: []
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (task) {
      setFormData({
        titre: task.titre,
        description: task.description || '',
        dateEcheance: new Date(task.dateEcheance),
        priorite: task.priorite,
        statut: task.statut,
        categories: task.categories.map(cat => cat._id)
      });
    }
    loadCategories();
  }, [task]);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      showNotification('Erreur lors du chargement des catégories', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = task
        ? await api.put(`/tasks/${task._id}`, formData)
        : await api.post('/tasks', formData);

      showNotification(
        `Tâche ${task ? 'modifiée' : 'créée'} avec succès`,
        'success'
      );
      onTaskSaved(response.data);
      handleClose();
    } catch (err) {
      showNotification(
        err.response?.data?.error || 'Erreur lors de la sauvegarde',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              name="titre"
              label="Titre"
              value={formData.titre}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
            />

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
              <DateTimePicker
                label="Date d'échéance"
                value={formData.dateEcheance}
                onChange={(newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    dateEcheance: newValue
                  }));
                }}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>

            <FormControl fullWidth>
              <InputLabel>Priorité</InputLabel>
              <Select
                name="priorite"
                value={formData.priorite}
                onChange={handleChange}
                label="Priorité"
              >
                {PRIORITY_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: option.color
                        }}
                      />
                      {option.value}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {task && (
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  label="Statut"
                >
                  {STATUS_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: option.color
                          }}
                        />
                        {option.value}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth>
              <InputLabel>Catégories</InputLabel>
              <Select
                multiple
                name="categories"
                value={formData.categories}
                onChange={handleChange}
                input={<OutlinedInput label="Catégories" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const category = categories.find(cat => cat._id === value);
                      return (
                        <Chip
                          key={value}
                          label={category?.nom || value}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskForm;