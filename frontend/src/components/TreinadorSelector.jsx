import React from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Avatar,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useTreinadores } from '../hooks/useApi';

const TreinadorSelector = ({ value, onChange, disabled }) => {
  const { data: treinadores = [], isLoading, error } = useTreinadores();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Erro ao carregar treinadores: {error.message}
      </Alert>
    );
  }

  if (treinadores.length === 0) {
    return (
      <Alert severity="info">
        Nenhum treinador cadastrado
      </Alert>
    );
  }

  return (
    <FormControl component="fieldset" fullWidth disabled={disabled}>
      <FormLabel component="legend" sx={{ mb: 1 }}>
        Selecione o Treinador *
      </FormLabel>
      <RadioGroup
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {treinadores.map((treinador) => (
            <Paper
              key={treinador.id}
              elevation={value == treinador.id ? 3 : 1}
              sx={{
                p: 1.5,
                cursor: 'pointer',
                border: value == treinador.id ? '2px solid #1976d2' : '2px solid transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  elevation: 2,
                  borderColor: value == treinador.id ? '#1976d2' : '#e0e0e0',
                },
              }}
              onClick={() => !disabled && onChange(treinador.id.toString())}
            >
              <FormControlLabel
                value={treinador.id.toString()}
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 1 }}>
                    <Avatar
                      src={treinador.foto_path}
                      alt={treinador.nome}
                      sx={{ width: 48, height: 48 }}
                    >
                      {treinador.nome.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body1" fontWeight="medium">
                      {treinador.nome}
                    </Typography>
                  </Box>
                }
                sx={{ m: 0, width: '100%' }}
              />
            </Paper>
          ))}
        </Box>
      </RadioGroup>
    </FormControl>
  );
};

export default TreinadorSelector;
