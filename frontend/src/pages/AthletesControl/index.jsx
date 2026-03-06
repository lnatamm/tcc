import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import { useAthletes } from '../../hooks/useApi';
import './style.css';

const AthletesControl = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: athletes = [], isLoading, error } = useAthletes();

  const filteredAthletes = athletes.filter((athlete) =>
    athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    athlete.id.toString().includes(searchTerm)
  );

  // Dados mockados para estatísticas
  const stats = {
    totalAthletes: athletes.length || 101,
    activeAthletes: Math.floor((athletes.length || 101) * 0.45),
    totalTeams: 20,
  };

  const handleAddAthlete = () => {
    // TODO: Implementar modal para adicionar aluno
  };

  const handleViewAthlete = (athlete) => {
    // TODO: Implementar navegação para detalhes do aluno
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, pt: 3 }}>
      {/* Header Stats */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: 'white' }}>
        <Typography variant="h4" fontWeight="700" sx={{ mb: 3 }}>
          Controle de alunos e turmas
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total de alunos:
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {stats.totalAthletes}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Alunos ativos
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {stats.activeAthletes}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total de turmas:
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {stats.totalTeams}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total de alunos:
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {stats.totalAthletes}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Search and Add Button */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: 'white' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Pesquise por nome ou ID do atleta"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ 
              flex: 1,
              backgroundColor: '#f5f5f5',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddAthlete}
            sx={{ 
              backgroundColor: '#1976d2',
              textTransform: 'none',
              fontWeight: 600,
              padding: '10px 20px',
            }}
          >
            Adicionar aluno
          </Button>
        </Box>
      </Paper>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Erro ao carregar alunos: {error.message}
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredAthletes.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            backgroundColor: 'white',
            border: '2px dashed #ddd',
          }}
        >
          <PeopleIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight="500">
            {searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno disponível'}
          </Typography>
        </Paper>
      )}

      {/* Athletes Table */}
      {!isLoading && !error && filteredAthletes.length > 0 && (
        <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: 'white' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 700, color: '#333' }}>ALUNO</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#333' }}>TURMA</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#333' }}>MODALIDADE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#333' }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#333', textAlign: 'right' }}>AÇÕES</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAthletes.map((athlete) => (
                <TableRow key={athlete.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{ 
                          width: 48, 
                          height: 48, 
                          backgroundColor: '#667eea',
                          color: 'white',
                          fontWeight: 700,
                        }}
                      >
                        {athlete.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography fontWeight="600" variant="body2">
                          {athlete.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID do aluno
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      Nome da turma
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      Modalidade
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label="Ativo" 
                      size="small" 
                      sx={{ 
                        backgroundColor: '#4caf50', 
                        color: 'white',
                        fontWeight: 600,
                      }} 
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleViewAthlete(athlete)}
                      sx={{
                        backgroundColor: '#1976d2',
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Visualizar aluno
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AthletesControl;
