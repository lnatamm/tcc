import React from 'react';
import { Container, Box, Typography, Button, Paper, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import './style.css';

const Perfil = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4, pt: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleGoBack}
        sx={{ mb: 3 }}
      >
        Voltar
      </Button>

      <Paper elevation={0} sx={{ p: 4, backgroundColor: '#f9f9f9' }}>
        <Typography variant="h4" fontWeight="700" sx={{ mb: 3 }}>
          Editar Perfil
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Nome Completo"
            defaultValue="Derek"
            fullWidth
            disabled
          />

          <TextField
            label="E-mail"
            type="email"
            fullWidth
            disabled
          />

          <TextField
            label="Telefone"
            fullWidth
            placeholder="+55 11 9999-9999"
          />

          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 2 }}>
            Para editar informações básicas, entre em contato com o administrador.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled
          >
            Salvar Alterações
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Perfil;
