import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  CircularProgress,
  Alert,
  Autocomplete,
  IconButton,
  Typography,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useExercises, useAddExerciseToRoutine } from '../hooks/useApi';
import CreateExerciseModal from './CreateExerciseModal';
import WeekSchedulePicker from './WeekSchedulePicker';
import ExcludedDatesManager from './ExcludedDatesManager';

const DAYS_OF_WEEK_MAP = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const AddExerciseToRoutineModal = ({ open, onClose, routineId, routineName, userName = 'system' }) => {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [schedule, setSchedule] = useState({ dayOfWeek: null, startTime: '', endTime: '' });
  const [excludedDates, setExcludedDates] = useState([]);
  const [errors, setErrors] = useState({});
  const [createExerciseModalOpen, setCreateExerciseModalOpen] = useState(false);

  const { data: exercises = [], isLoading: loadingExercises, refetch: refetchExercises } = useExercises();
  const addExerciseToRoutine = useAddExerciseToRoutine();

  const handleExerciseChange = (event, newValue) => {
    setSelectedExercise(newValue);
    if (errors.exercise) {
      setErrors(prev => ({ ...prev, exercise: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!selectedExercise) {
      newErrors.exercise = 'Please select an exercise';
    }
    if (schedule.dayOfWeek === null) {
      newErrors.schedule = 'Please select a day of the week';
    }
    if (!schedule.startTime) {
      newErrors.schedule = 'Start time is required';
    }
    if (!schedule.endTime) {
      newErrors.schedule = 'End time is required';
    }

    // Validate that end is after start
    if (schedule.startTime && schedule.endTime) {
      const [startHour, startMin] = schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = schedule.endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      if (endMinutes <= startMinutes) {
        newErrors.schedule = 'End time must be after start time';
      }
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const dayOfWeek = DAYS_OF_WEEK_MAP[schedule.dayOfWeek];

      const payload = {
        id_routine: routineId,
        id_exercise: selectedExercise.id,
        days_of_week: dayOfWeek,
        start_hour: schedule.startTime,
        end_hour: schedule.endTime,
        created_by: userName,
      };

      const result = await addExerciseToRoutine.mutateAsync(payload);
      
      // If there are excluded dates, add them
      if (excludedDates.length > 0 && result?.id) {
        // Note: You'll need to implement the excluded dates API calls
        // For now, we'll store them temporarily with the exercise
        console.log('Excluded dates to add:', excludedDates, 'for exercise:', result.id);
      }
      
      // Reset form
      setSelectedExercise(null);
      setSchedule({ dayOfWeek: null, startTime: '', endTime: '' });
      setExcludedDates([]);
      setErrors({});
      
      onClose();
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to add exercise to routine' });
    }
  };

  const handleCancel = () => {
    setSelectedExercise(null);
    setSchedule({ dayOfWeek: null, startTime: '', endTime: '' });
    setExcludedDates([]);
    setErrors({});
    onClose();
  };

  const handleScheduleChange = (newSchedule) => {
    setSchedule(newSchedule);
    if (errors.schedule) {
      setErrors(prev => ({ ...prev, schedule: null }));
    }
  };

  const handleAddExcludedDate = (dateData) => {
    setExcludedDates(prev => [...prev, dateData]);
  };

  const handleRemoveExcludedDate = (dateToRemove) => {
    setExcludedDates(prev => prev.filter(d => d.excluded_date !== dateToRemove));
  };

  const handleNewExerciseSuccess = (newExercise) => {
    refetchExercises();
    // Auto-select the newly created exercise
    if (newExercise) {
      setSelectedExercise(newExercise);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add Exercise to {routineName}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {errors.submit && (
              <Alert severity="error">{errors.submit}</Alert>
            )}

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Select Exercise
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateExerciseModalOpen(true)}
                  sx={{ ml: 'auto' }}
                >
                  New Exercise
                </Button>
              </Box>
              
              <Autocomplete
                value={selectedExercise}
                onChange={handleExerciseChange}
                options={exercises}
                getOptionLabel={(option) => option.name || ''}
                loading={loadingExercises}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box>
                      <Typography variant="body1">{option.name}</Typography>
                      {option.description && (
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      )}
                      {(option.sets || option.reps) && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {option.sets && `${option.sets} sets`}
                          {option.sets && option.reps && ' × '}
                          {option.reps && `${option.reps} reps`}
                        </Typography>
                      )}
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Exercise"
                    error={!!errors.exercise}
                    helperText={errors.exercise}
                    required
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingExercises ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Box>

            <Divider sx={{ my: 1 }} />

            <WeekSchedulePicker
              value={schedule}
              onChange={handleScheduleChange}
              error={errors.schedule}
            />

            {schedule.dayOfWeek !== null && schedule.startTime && schedule.endTime && (
              <ExcludedDatesManager
                excludedDates={excludedDates}
                onAdd={handleAddExcludedDate}
                onRemove={handleRemoveExcludedDate}
                disabled={addExerciseToRoutine.isPending}
              />
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCancel} disabled={addExerciseToRoutine.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={addExerciseToRoutine.isPending || loadingExercises}
          >
            {addExerciseToRoutine.isPending ? 'Adding...' : 'Add to Routine'}
          </Button>
        </DialogActions>
      </Dialog>

      <CreateExerciseModal
        open={createExerciseModalOpen}
        onClose={() => setCreateExerciseModalOpen(false)}
        onSuccess={handleNewExerciseSuccess}
      />
    </>
  );
};

export default AddExerciseToRoutineModal;
