import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import { useAthletes } from '../../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import AthleteRoutinesModal from '../../components/AthleteRoutinesModal';
import './style.css';

const RoutinesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [routinesModalOpen, setRoutinesModalOpen] = useState(false);
  const { data: athletes = [], isLoading, error } = useAthletes();
  const navigate = useNavigate();

  const userName = "Derek";

  const filteredAthletes = athletes.filter((athlete) =>
    athlete.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewRoutines = (athlete) => {
    setSelectedAthlete(athlete);
    setRoutinesModalOpen(true);
  };

  const handleCloseRoutines = () => {
    setRoutinesModalOpen(false);
    setSelectedAthlete(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, pt: 12 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FitnessCenterIcon sx={{ fontSize: 48 }} />
          <Box>
            <Typography variant="h4" fontWeight="700">
              Training Routines
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Manage and view athlete workout routines
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search athletes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ backgroundColor: 'white' }}
        />
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading athletes: {error.message}
        </Alert>
      )}

      {!isLoading && !error && filteredAthletes.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            border: '2px dashed',
            borderColor: 'divider',
          }}
        >
          <PersonIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight="500">
            {searchTerm ? 'No athletes found' : 'No athletes available'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {searchTerm
              ? 'Try adjusting your search criteria'
              : 'Add athletes to get started'}
          </Typography>
        </Paper>
      )}

      {!isLoading && !error && filteredAthletes.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Athletes ({filteredAthletes.length})
          </Typography>
          <Grid container spacing={3}>
            {filteredAthletes.map((athlete) => (
              <Grid item xs={12} sm={6} md={4} key={athlete.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: 'primary.main',
                          fontSize: '1.5rem',
                          fontWeight: 600,
                        }}
                      >
                        {athlete.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="600">
                          {athlete.name}
                        </Typography>
                        <Chip
                          icon={<PersonIcon sx={{ fontSize: 16 }} />}
                          label="Athlete"
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<CalendarTodayIcon />}
                      onClick={() => handleViewRoutines(athlete)}
                    >
                      View Routines
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <AthleteRoutinesModal
        open={routinesModalOpen}
        onClose={handleCloseRoutines}
        athlete={selectedAthlete}
        userName={userName}
      />
    </Container>
  );
};

export default RoutinesPage;
