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

import { useExercises, useSchedulePhysicalTest } from '../hooks/useApi';

const SchedulePhysicalTestModal = ({ open, onClose, athleteId, userName }) => {
  const { data: exercises = [], isLoading: loadingExercises, error: exercisesError } = useExercises();
  const scheduleMutation = useSchedulePhysicalTest();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [exerciseIds, setExerciseIds] = useState([]);

  useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
      setScheduledDate('');
      setExerciseIds([]);
      scheduleMutation.reset();
    }
  }, [open]);

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agendar Teste Físico</DialogTitle>
      <DialogContent>
        {!athleteId && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Selecione um aluno antes de agendar.
          </Alert>
        )}

        {exercisesError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Erro ao carregar exercícios: {exercisesError.message}
          </Alert>
        )}

        {scheduleMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Erro ao agendar teste: {scheduleMutation.error?.message || 'Erro desconhecido'}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />

          <TextField
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />

          <TextField
            label="Data do teste"
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <FormControl fullWidth disabled={loadingExercises}>
            <InputLabel>Exercícios</InputLabel>
            <Select
              multiple
              value={exerciseIds}
              label="Exercícios"
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

          <Typography variant="caption" color="text.secondary">
            O teste será agendado para a data escolhida, e todos os exercícios do teste compartilharão essa data.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit}>
          Agendar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SchedulePhysicalTestModal;
