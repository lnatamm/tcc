import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  OutlinedInput,
  TextField,
  Typography,
} from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

import { useCreateEvent, useTeams } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const AddEventModal = ({ open, onClose }) => {
  const { user } = useAuth();
  const { data: teams = [] } = useTeams();
  const createEvent = useCreateEvent();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [selectedTeamIds, setSelectedTeamIds] = useState([]);
  const [teamsDialogOpen, setTeamsDialogOpen] = useState(false);
  const [validationError, setValidationError] = useState('');

  const selectedTeams = useMemo(() => {
    if (!selectedTeamIds.length) return [];
    const selected = new Set(selectedTeamIds);
    return teams.filter((team) => selected.has(team.id));
  }, [teams, selectedTeamIds]);

  const resetState = () => {
    setName('');
    setDescription('');
    setStartDate('');
    setSelectedTeamIds([]);
    setTeamsDialogOpen(false);
    setValidationError('');
    createEvent.reset();
  };

  const handleClose = () => {
    if (createEvent.isPending) return;
    resetState();
    onClose();
  };

  const toggleTeamSelection = (teamId) => {
    setSelectedTeamIds((prev) => {
      if (prev.includes(teamId)) {
        return prev.filter((id) => id !== teamId);
      }
      return [...prev, teamId];
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setValidationError('Informe o nome do evento.');
      return;
    }

    if (!startDate) {
      setValidationError('Informe a data do evento.');
      return;
    }

    if (!selectedTeamIds.length) {
      setValidationError('Selecione pelo menos uma turma.');
      return;
    }

    setValidationError('');

    createEvent.mutate(
      {
        name: name.trim(),
        description: description.trim() || null,
        start_date: startDate,
        team_ids: selectedTeamIds,
        created_by: user?.nome || 'system',
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Criar Evento</DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {(validationError || createEvent.isError) && (
                <Alert severity="error">
                  {validationError || createEvent.error?.response?.data?.detail || 'Erro ao criar evento.'}
                </Alert>
              )}

              <TextField
                label="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={createEvent.isPending}
                autoFocus
                fullWidth
              />

              <TextField
                label="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                minRows={3}
                disabled={createEvent.isPending}
                fullWidth
              />

              <TextField
                label="Data"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                disabled={createEvent.isPending}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel id="selected-teams-label">Turmas selecionadas</InputLabel>
                <OutlinedInput
                  label="Turmas selecionadas"
                  value={selectedTeams.map((team) => team.name).join(', ')}
                  readOnly
                />
                <FormHelperText>
                  {selectedTeamIds.length
                    ? `${selectedTeamIds.length} turma(s) vinculada(s)`
                    : 'Nenhuma turma selecionada'}
                </FormHelperText>
              </FormControl>

              <Button
                type="button"
                variant="outlined"
                startIcon={<GroupAddIcon />}
                onClick={() => setTeamsDialogOpen(true)}
                disabled={createEvent.isPending}
              >
                Adicionar turmas
              </Button>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} disabled={createEvent.isPending}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createEvent.isPending}
              startIcon={createEvent.isPending ? <CircularProgress size={16} /> : null}
            >
              {createEvent.isPending ? 'Criando...' : 'Criar evento'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={teamsDialogOpen}
        onClose={() => setTeamsDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Adicionar turmas no evento</DialogTitle>
        <DialogContent dividers>
          {!teams.length ? (
            <Typography variant="body2" color="text.secondary">
              Nenhuma turma disponível.
            </Typography>
          ) : (
            <List sx={{ p: 0 }}>
              {teams.map((team) => (
                <ListItem key={team.id} disablePadding>
                  <ListItemButton onClick={() => toggleTeamSelection(team.id)}>
                    <Checkbox edge="start" checked={selectedTeamIds.includes(team.id)} tabIndex={-1} />
                    <ListItemText primary={team.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTeamsDialogOpen(false)}>Concluir</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddEventModal;
