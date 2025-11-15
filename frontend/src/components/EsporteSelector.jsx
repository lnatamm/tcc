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
import { useEsportes } from '../hooks/useApi';
import SportsIcon from '@mui/icons-material/Sports';

const EsporteSelector = ({ value, onChange, disabled }) => {
  const { data: esportes = [], isLoading, error } = useEsportes();

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
        Erro ao carregar esportes: {error.message}
      </Alert>
    );
  }

  if (esportes.length === 0) {
    return (
      <Alert severity="info">
        Nenhum esporte cadastrado
      </Alert>
    );
  }

  return (
    <FormControl component="fieldset" fullWidth disabled={disabled}>
      <FormLabel component="legend" sx={{ mb: 1 }}>
        Selecione o Esporte *
      </FormLabel>
      <RadioGroup
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {esportes.map((esporte) => (
            <Paper
              key={esporte.id}
              elevation={value == esporte.id ? 3 : 1}
              sx={{
                p: 1.5,
                cursor: 'pointer',
                border: value == esporte.id ? '2px solid #1976d2' : '2px solid transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  elevation: 2,
                  borderColor: value == esporte.id ? '#1976d2' : '#e0e0e0',
                },
              }}
              onClick={() => !disabled && onChange(esporte.id.toString())}
            >
              <FormControlLabel
                value={esporte.id.toString()}
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 1 }}>
                    <Avatar
                      src={esporte.foto_path}
                      alt={esporte.nome}
                      sx={{ width: 48, height: 48, bgcolor: '#1976d2' }}
                    >
                      <SportsIcon />
                    </Avatar>
                    <Typography variant="body1" fontWeight="medium">
                      {esporte.nome}
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

export default EsporteSelector;
