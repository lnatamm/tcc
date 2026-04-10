import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

import { useAthletes, useCreateEnrollment } from '../hooks/useApi';

const AddAthleteToTeamModal = ({ open, onClose, teamId, teamName, existingAthleteIds = [] }) => {
  const { data: athletes = [], isLoading: loadingAthletes, error: athletesError } = useAthletes(open);
  const createEnrollment = useCreateEnrollment();

  const [selectedAthleteId, setSelectedAthleteId] = useState('');

  const availableAthletes = useMemo(() => {
    const existingSet = new Set((existingAthleteIds || []).map((id) => Number(id)).filter(Boolean));
    return (athletes || [])
      .filter((a) => !existingSet.has(Number(a?.id)))
      .sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || '')));
  }, [athletes, existingAthleteIds]);

  const handleClose = () => {
    if (createEnrollment.isPending) return;
    setSelectedAthleteId('');
    createEnrollment.reset();
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!teamId) return;

    const idTeam = Number(teamId);
    const idAthlete = Number(selectedAthleteId);
    if (!Number.isFinite(idTeam) || !Number.isFinite(idAthlete)) return;

    // Backend currently validates EnrollmentCreate with an "id" field.
    createEnrollment.mutate(
      {
        id_team: idTeam,
        id_athlete: idAthlete,
      },
      {
        onSuccess: () => {
          setSelectedAthleteId('');
          onClose();
        },
      }
    );
  };

  const noOptions = !loadingAthletes && !athletesError && availableAthletes.length === 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add athlete to team</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {teamName && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Team: {teamName}
            </Typography>
          )}

          {athletesError && <Alert severity="error">Unable to load athletes.</Alert>}
          {createEnrollment.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Unable to add athlete to the team. Please try again.
            </Alert>
          )}

          <TextField
            select
            fullWidth
            label={loadingAthletes ? 'Loading athletes...' : 'Athlete'}
            value={selectedAthleteId}
            onChange={(e) => setSelectedAthleteId(e.target.value)}
            disabled={loadingAthletes || !!athletesError || createEnrollment.isPending || noOptions}
            sx={{ mt: 2 }}
          >
            {noOptions ? (
              <MenuItem value="" disabled>
                No available athletes.
              </MenuItem>
            ) : (
              [
                <MenuItem key="placeholder" value="" disabled>
                  Select an athlete
                </MenuItem>,
                ...availableAthletes.map((a) => (
                  <MenuItem key={a.id} value={String(a.id)}>
                    {a.name}
                  </MenuItem>
                )),
              ]
            )}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={createEnrollment.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!selectedAthleteId || createEnrollment.isPending || !teamId}
            startIcon={createEnrollment.isPending && <CircularProgress size={16} />}
          >
            {createEnrollment.isPending ? 'Adding...' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddAthleteToTeamModal;
