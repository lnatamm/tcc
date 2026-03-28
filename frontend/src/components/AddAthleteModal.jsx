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

export default function AddAthleteModal({ open, onClose, onSubmit, loading = false }) {
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
    const sanitizedAthleteName = athleteName.trim();

    if (!sanitizedAthleteName) {
      setError('Informe o nome do atleta.');
      return;
    }

    setError('');
    onSubmit(sanitizedAthleteName);
    setAthleteName('');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Adicionar aluno</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          autoFocus
          fullWidth
          label="Nome do atleta"
          placeholder="Digite o nome do atleta"
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
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {loading ? 'Abrindo...' : 'Continuar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
