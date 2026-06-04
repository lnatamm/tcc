import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import { useExercises, useSchedulePhysicalTest } from '../hooks/useApi';
import CreateExerciseModal from './CreateExerciseModal';

const SchedulePhysicalTestModal = ({ open, onClose, athleteId, userName }) => {
  const {
    data: exercises = [],
    isLoading: loadingExercises,
    error: exercisesError,
    refetch: refetchExercises,
  } = useExercises();
  const scheduleMutation = useSchedulePhysicalTest();
  const resetScheduleMutation = scheduleMutation.reset;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [exerciseIds, setExerciseIds] = useState([]);
  const [createExerciseModalOpen, setCreateExerciseModalOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
      setScheduledDate('');
      setExerciseIds([]);
      resetScheduleMutation();
    }
  }, [open, resetScheduleMutation]);

  const exerciseNameById = useMemo(() => {
    const map = new Map();
    (exercises || []).forEach((ex) => map.set(ex.id, ex.name));
    return map;
  }, [exercises]);

  const canSubmit = !!athleteId && name.trim() && scheduledDate && exerciseIds.length > 0 && !scheduleMutation.isPending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await scheduleMutation.mutateAsync({
      id_athlete: athleteId,
      name: name.trim(),
      description: description.trim() || null,
      scheduled_date: scheduledDate,
      exercise_ids: exerciseIds,
      created_by: userName,
    });
    onClose();
  };

  const handleNewExerciseSuccess = () => {
    refetchExercises();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Physical Test</DialogTitle>
        <DialogContent>
          {!athleteId && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Select an athlete before scheduling.
            </Alert>
          )}

          {exercisesError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Unable to load exercises. Please try again.
            </Alert>
          )}

          {scheduleMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Unable to schedule the test. Please try again.
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />

            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />

            <TextField
              label="Test date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Select Exercises
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

              <FormControl fullWidth disabled={loadingExercises}>
                <InputLabel>Exercises</InputLabel>
                <Select
                  multiple
                  value={exerciseIds}
                  label="Exercises"
                  onChange={(e) => setExerciseIds(e.target.value)}
                  renderValue={(selected) =>
                    (selected || [])
                      .map((id) => exerciseNameById.get(id) || String(id))
                      .join(', ')
                  }
                >
                  {(exercises || []).map((ex) => (
                    <MenuItem key={ex.id} value={ex.id}>
                      <Checkbox checked={exerciseIds.includes(ex.id)} />
                      <ListItemText primary={ex.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Typography variant="caption" color="text.secondary">
              The test will be scheduled for the selected date, and every exercise in the test will share that date.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit}>
            Schedule
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

export default SchedulePhysicalTestModal;
