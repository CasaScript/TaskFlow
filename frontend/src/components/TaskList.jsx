import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Toolbar,
  Typography,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import api from '../api/axiosConfig';
import { useNotification } from '../context/NotificationContext';
import TaskForm from './TaskForm';

const PRIORITY_COLORS = {
  'Basse': '#4CAF50',
  'Moyenne': '#FF9800',
  'Haute': '#F44336'
};

const STATUS_COLORS = {
  'À faire': '#90CAF9',
  'En cours': '#FFB74D',
  'Terminé': '#81C784'
};

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalTasks, setTotalTasks] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    status: '',
    category: ''
  });
  const [categories, setCategories] = useState([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadCategories();
    loadTasks();
  }, [page, rowsPerPage, filters]);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      showNotification('Erreur lors du chargement des catégories', 'error');
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...filters
      });
      const response = await api.get(`/tasks?${params}`);
      setTasks(response.data.taches);
      setTotalTasks(response.data.pagination.totalDocs);
    } catch (err) {
      showNotification('Erreur lors du chargement des tâches', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        showNotification('Tâche supprimée avec succès', 'success');
        loadTasks();
      } catch (err) {
        showNotification('Erreur lors de la suppression', 'error');
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { statut: newStatus });
      showNotification('Statut mis à jour avec succès', 'success');
      loadTasks();
    } catch (err) {
      showNotification('Erreur lors de la mise à jour du statut', 'error');
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar sx={{ gap: 2 }}>
          <TextField
            label="Rechercher"
            variant="outlined"
            size="small"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priorité</InputLabel>
            <Select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              label="Priorité"
            >
              <MenuItem value="">Toutes</MenuItem>
              {Object.keys(PRIORITY_COLORS).map(priority => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              label="Statut"
            >
              <MenuItem value="">Tous</MenuItem>
              {Object.keys(STATUS_COLORS).map(status => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Catégorie</InputLabel>
            <Select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              label="Catégorie"
            >
              <MenuItem value="">Toutes</MenuItem>
              {categories.map(category => (
                <MenuItem key={category._id} value={category._id}>
                  {category.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Toolbar>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Titre</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Échéance</TableCell>
                <TableCell>Priorité</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Catégories</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task._id}>
                  <TableCell>{task.titre}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{formatDate(task.dateEcheance)}</TableCell>
                  <TableCell>
                    <Chip
                      label={task.priorite}
                      size="small"
                      sx={{
                        bgcolor: PRIORITY_COLORS[task.priorite],
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.statut}
                      size="small"
                      sx={{
                        bgcolor: STATUS_COLORS[task.statut],
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {task.categories.map(cat => (
                        <Chip
                          key={cat._id}
                          label={cat.nom}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Modifier">
                      <IconButton
                        size="small"
                        onClick={() => setEditTask(task)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    {task.statut !== 'Terminé' && (
                      <Tooltip title="Marquer comme terminé">
                        <IconButton
                          size="small"
                          onClick={() => handleStatusChange(task._id, 'Terminé')}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(task._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalTasks}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Lignes par page :"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
          }
        />
      </Paper>

      {editTask && (
        <TaskForm
          open={true}
          handleClose={() => setEditTask(null)}
          task={editTask}
          onTaskSaved={() => {
            setEditTask(null);
            loadTasks();
          }}
        />
      )}
    </Box>
  );
};

export default TaskList;