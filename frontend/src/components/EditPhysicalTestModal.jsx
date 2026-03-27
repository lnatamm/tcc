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
  Typography,
} from '@mui/material';

import { useAddExercisesToPhysicalTest, useExercises } from '../hooks/useApi';

const getScheduledStartDate = (physicalTest) => {
  const rows = physicalTest?.physical_test_has_exercise;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const startDates = rows.map((r) => r?.start_date).filter(Boolean);
  if (startDates.length === 0) return null;
  startDates.sort();
  return startDates[0];
};

const EditPhysicalTestModal = ({ open, onClose, physicalTest, userName }) => {
  const physicalTestId = physicalTest?.id;

  const { data: exercises = [], isLoading: loadingExercises, error: exercisesError } = useExercises();
  const addMutation = useAddExercisesToPhysicalTest();

  const [exerciseIds, setExerciseIds] = useState([]);

  useEffect(() => {
    if (!open) {
      setExerciseIds([]);
      addMutation.reset();
    }
  }, [open]);

  const exerciseNameById = useMemo(() => {
    const map = new Map();
    (exercises || []).forEach((ex) => map.set(ex.id, ex.name));
    return map;
  }, [exercises]);

  const scheduledIso = useMemo(() => getScheduledStartDate(physicalTest), [physicalTest]);
  const scheduledLabel = scheduledIso ? new Date(scheduledIso).toLocaleDateString('pt-BR') : 'Sem data';

  const canSubmit = !!physicalTestId && exerciseIds.length > 0 && !addMutation.isPending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await addMutation.mutateAsync({
      physicalTestId,
      payload: {
        exercise_ids: exerciseIds,
        created_by: userName,
      },
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Teste</DialogTitle>
      <DialogContent>
        {!physicalTestId && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Nenhum teste selecionado.
          </Alert>
        )}

        {exercisesError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Erro ao carregar exercícios: {exercisesError.message}
          </Alert>
        )}

        {addMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Erro ao adicionar exercícios: {addMutation.error?.message || 'Erro desconhecido'}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {physicalTest?.name || 'Teste'} — Data: {scheduledLabel}
          </Typography>

          <FormControl fullWidth disabled={loadingExercises || !physicalTestId}>
            <InputLabel>Adicionar exercícios</InputLabel>
            <Select
              multiple
              value={exerciseIds}
              label="Adicionar exercícios"
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPhysicalTestModal;
