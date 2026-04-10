import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';

export default function AddAthleteModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  submitError = '',
}) {
  const [athleteName, setAthleteName] = useState('');
  const [error, setError] = useState('');

  const handleClose = () => {
    if (loading) {
      return;
    }

    setAthleteName('');
    setError('');
    onClose();
  };

  const handleSubmit = () => {
    if (loading) {
      return;
    }

    const sanitizedAthleteName = athleteName.trim();

    if (!sanitizedAthleteName) {
      setError('Enter the athlete name.');
      return;
    }

    setError('');
    onSubmit(sanitizedAthleteName);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add athlete</DialogTitle>
      <DialogContent>
        {(error || submitError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || submitError}
          </Alert>
        )}

        <TextField
          autoFocus
          fullWidth
          label="Athlete name"
          placeholder="Enter the athlete name"
          value={athleteName}
          onChange={(event) => {
            setAthleteName(event.target.value);
            if (error) {
              setError('');
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleSubmit();
            }
          }}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {loading ? 'Adding...' : 'Add athlete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
