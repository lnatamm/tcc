import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  IconButton,
  Collapse,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useRoutinesByAthlete, useRoutineExercises, useCreateRoutine } from '../hooks/useApi';
import AddExerciseToRoutineModal from './AddExerciseToRoutineModal';

const RoutineExercises = ({ routineId, routineName, userName }) => {
  const [addExerciseModalOpen, setAddExerciseModalOpen] = useState(false);
  const { data: exercises = [], isLoading, error } = useRoutineExercises(routineId);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 1 }}>
        Error loading exercises: {error.message}
      </Alert>
    );
  }

  return (
    <>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setAddExerciseModalOpen(true)}
          fullWidth
          size="small"
        >
          Add Exercise
        </Button>
      </Box>

      {exercises.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2, fontStyle: 'italic', textAlign: 'center' }}>
          No exercises in this routine yet
        </Typography>
      ) : (
        <List dense>
          {exercises.map((routineExercise, index) => {
        const exercise = routineExercise.exercise;
        const startTime = new Date(routineExercise.start);
        const endTime = new Date(routineExercise.end);
        
        return (
          <React.Fragment key={routineExercise.id}>
            {index > 0 && <Divider />}
            <ListItem>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FitnessCenterIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  <ListItemText
                    primary={exercise?.name || 'Unknown Exercise'}
                    secondary={exercise?.description}
                    primaryTypographyProps={{ fontWeight: 'medium', fontSize: '0.9rem' }}
                    secondaryTypographyProps={{ fontSize: '0.8rem' }}
                  />
                </Box>
                
                {exercise && (
                  <Box sx={{ display: 'flex', gap: 1, ml: 3.5, flexWrap: 'wrap' }}>
                    {exercise.sets && (
                      <Chip 
                        label={`${exercise.sets} sets`} 
                        size="small" 
                        variant="outlined"
                      />
                    )}
                    {exercise.reps && (
                      <Chip 
                        label={`${exercise.reps} reps`} 
                        size="small" 
                        variant="outlined"
                      />
                    )}
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 3.5, mt: 0.5 }}>
                  <ScheduleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            </ListItem>
          </React.Fragment>
        );
      })}
        </List>
      )}

      <AddExerciseToRoutineModal
        open={addExerciseModalOpen}
        onClose={() => setAddExerciseModalOpen(false)}
        routineId={routineId}
        routineName={routineName}
        userName={userName}
      />
    </>
  );
};

const AthleteRoutinesModal = ({ open, onClose, athlete, userName = 'system' }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [createError, setCreateError] = useState(null);
  
  const { data: routines = [], isLoading, error } = useRoutinesByAthlete(athlete?.id);
  const createRoutine = useCreateRoutine();

  const handleCreateRoutine = async () => {
    if (!newRoutineName.trim()) {
      setCreateError('Routine name is required');
      return;
    }

    try {
      setCreateError(null);
      await createRoutine.mutateAsync({
        name: newRoutineName.trim(),
        id_athlete: athlete.id,
        created_by: userName,
      });
      
      setNewRoutineName('');
      setShowCreateForm(false);
    } catch (err) {
      setCreateError(err.message || 'Failed to create routine');
    }
  };

  const handleCancelCreate = () => {
    setNewRoutineName('');
    setCreateError(null);
    setShowCreateForm(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '400px' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="span">
            Routines - {athlete?.name}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateForm(!showCreateForm)}
            size="small"
          >
            New Routine
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Collapse in={showCreateForm}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              mb: 2, 
              backgroundColor: 'background.default',
              border: '1px solid',
              borderColor: 'primary.main'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Routine Name"
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                  size="small"
                  autoFocus
                  error={!!createError}
                  helperText={createError}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateRoutine();
                    }
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                  <Button
                    variant="contained"
                    onClick={handleCreateRoutine}
                    disabled={createRoutine.isPending}
                    size="small"
                  >
                    {createRoutine.isPending ? 'Creating...' : 'Create'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancelCreate}
                    disabled={createRoutine.isPending}
                    size="small"
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
              <IconButton 
                size="small" 
                onClick={handleCancelCreate}
                disabled={createRoutine.isPending}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Paper>
        </Collapse>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error">
            Error loading routines: {error.message}
          </Alert>
        )}
        
        {!isLoading && !error && routines.length === 0 && !showCreateForm && (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No routines found for this athlete
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Click "New Routine" to create one
            </Typography>
          </Box>
        )}
        
        {!isLoading && !error && routines.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {routines.map((routine) => (
              <Accordion key={routine.id} defaultExpanded={routines.length === 1 && !showCreateForm}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {routine.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      Created: {new Date(routine.created_at).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails sx={{ p: 0 }}>
                  <RoutineExercises routineId={routine.id} routineName={routine.name} userName={userName} />
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AthleteRoutinesModal;
