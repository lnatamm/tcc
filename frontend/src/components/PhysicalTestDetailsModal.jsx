import React, { useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';

import { usePhysicalTestExercises } from '../hooks/useApi';

const getScheduledStartDate = (physicalTest) => {
  const rows = physicalTest?.physical_test_has_exercise;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const startDates = rows.map((r) => r?.start_date).filter(Boolean);
  if (startDates.length === 0) return null;
  startDates.sort();
  return startDates[0];
};

const getScheduledLabel = (physicalTest) => {
  const iso = physicalTest?.scheduledIso || getScheduledStartDate(physicalTest);
  if (!iso) return 'Sem data';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return 'Sem data';
  return dt.toLocaleDateString('pt-BR');
};

const toExerciseName = (row) => {
  return row?.exercise?.name || row?.exercise_name || row?.name || null;
};

const PhysicalTestDetailsModal = ({ open, onClose, physicalTest }) => {
  const physicalTestId = open ? physicalTest?.id : null;

  const {
    data: exerciseRows = [],
    isLoading,
    error,
  } = usePhysicalTestExercises(physicalTestId);

  const scheduledLabel = useMemo(() => getScheduledLabel(physicalTest), [physicalTest]);

  const exerciseNames = useMemo(() => {
    const names = (exerciseRows || []).map(toExerciseName).filter(Boolean);
    return names;
  }, [exerciseRows]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Detalhes do Teste</DialogTitle>
      <DialogContent>
        {!physicalTest?.id && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Nenhum teste selecionado.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Erro ao carregar exercícios: {error.message}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {physicalTest?.name || 'Teste'}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Data: {scheduledLabel}
          </Typography>

          {!!physicalTest?.description && (
            <Typography variant="body2" color="text.secondary">
              {physicalTest.description}
            </Typography>
          )}

          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Exercícios
            </Typography>

            {isLoading ? (
              <Typography variant="body2" color="text.secondary">
                Carregando...
              </Typography>
            ) : exerciseNames.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nenhum exercício cadastrado para este teste.
              </Typography>
            ) : (
              <List dense disablePadding>
                {exerciseNames.map((name, index) => (
                  <ListItem key={`${name}-${index}`} disableGutters>
                    <ListItemText primary={name} />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhysicalTestDetailsModal;
