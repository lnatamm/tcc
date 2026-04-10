import React, { useState, useEffect } from 'react';
import './style.css';
import {useTeamsWithAthletes } from '../../hooks/useApi';
import AddTeamModal from '../../components/AddTeamModal';
import AthleteRoutinesModal from '../../components/AthleteRoutinesModal';
import AddAthleteToTeamModal from '../../components/AddAthleteToTeamModal';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '../../api';

const Home = () => {
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [routinesModalOpen, setRoutinesModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [addToTeam, setAddToTeam] = useState(null);
  const [athletePhotos, setAthletePhotos] = useState({});
  const { data: teams = [], isLoading: loading, error } = useTeamsWithAthletes();
  
  const userName = "Derek";

  // Load athlete photos as blob URLs
  useEffect(() => {
    let cancelled = false;
    const urlsToRevoke = [];

    const loadAthletePhotos = async () => {
      const photos = {};
      for (const team of teams) {
        if (team.athletes) {
          for (const athlete of team.athletes) {
            try {
              const response = await api.get(`/athletes/${athlete.id}/photo`, {
                responseType: 'blob'
              });
              const imageUrl = URL.createObjectURL(response.data);
              urlsToRevoke.push(imageUrl);
              photos[athlete.id] = imageUrl;
            } catch (err) {
              console.error(`Error loading photo for athlete ${athlete.id}:`, err);
            }
          }
        }
      }

      if (cancelled) {
        urlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
        return;
      }

      setAthletePhotos(photos);
    };

    if (teams.length > 0) {
      loadAthletePhotos();
    }

    return () => {
      cancelled = true;
      urlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [teams]);

  const toggleTeam = (teamId) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  const handleViewRoutines = (athlete) => {
    setSelectedAthlete(athlete);
    setRoutinesModalOpen(true);
  };

  const handleCloseRoutines = () => {
    setRoutinesModalOpen(false);
    setSelectedAthlete(null);
  };

  return (
    <Box className="home">
      <Container maxWidth="md" sx={{ py: 4, pt: 10 }}>
        <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" fontWeight={700}>
              Teams
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage teams and athletes.
            </Typography>
          </Stack>
        </Paper>

        {loading && (
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={18} />
              <Typography>Loading teams...</Typography>
            </Stack>
          </Paper>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Unable to load teams. Please try again later.
          </Alert>
        )}

        {!loading && !error && teams.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            No teams found.
          </Alert>
        )}

        {!loading && !error && (
          <Stack spacing={1.25}>
            {teams.map((team) => {
              const athleteCount = Array.isArray(team?.athletes) ? team.athletes.length : 0;
              const expanded = expandedTeam === team.id;

              return (
                <Accordion
                  key={team.id}
                  expanded={expanded}
                  onChange={() => toggleTeam(team.id)}
                  disableGutters
                  elevation={0}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, '&:before': { display: 'none' } }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                      <Typography fontWeight={700} sx={{ flex: 1 }}>
                        {team.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={`${athleteCount} athlete${athleteCount === 1 ? '' : 's'}`}
                        variant="outlined"
                      />
                    </Stack>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setAddToTeam(team)}
                        >
                          Add athlete
                        </Button>
                      </Stack>

                      {team.athletes && team.athletes.length > 0 ? (
                        <Stack spacing={1}>
                          {team.athletes.map((athlete) => (
                            <Paper key={athlete.id} variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar
                                  src={athletePhotos[athlete.id]}
                                  alt={athlete.name}
                                  sx={{ width: 40, height: 40 }}
                                >
                                  {athlete.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography fontWeight={700}>{athlete.name}</Typography>
                                </Box>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleViewRoutines(athlete)}
                                >
                                  View routines
                                </Button>
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No athletes enrolled.
                        </Typography>
                      )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              );
            })}

            <Button
              fullWidth
              variant="contained"
              onClick={() => setModalOpen(true)}
              sx={{ mt: 1 }}
            >
              Add team
            </Button>
          </Stack>
        )}
      </Container>

      <AddTeamModal 
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <AthleteRoutinesModal
        open={routinesModalOpen}
        onClose={handleCloseRoutines}
        athlete={selectedAthlete}
        userName={userName}
      />

      <AddAthleteToTeamModal
        open={!!addToTeam}
        onClose={() => setAddToTeam(null)}
        teamId={addToTeam?.id}
        teamName={addToTeam?.name}
        existingAthleteIds={(addToTeam?.athletes || []).map((a) => a?.id).filter(Boolean)}
      />
    </Box>
  );
};

export default Home;
