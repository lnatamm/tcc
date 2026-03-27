import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Typography,
} from '@mui/material';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

import { useAuth } from '../../context/AuthContext';
import { useAthletes, usePhysicalTestsByAthlete } from '../../hooks/useApi';
import SchedulePhysicalTestModal from '../../components/SchedulePhysicalTestModal';
import EditPhysicalTestModal from '../../components/EditPhysicalTestModal';

const toMidnightDate = (dt) => {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const getScheduledStartDate = (physicalTest) => {
  const rows = physicalTest?.physical_test_has_exercise;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const startDates = rows.map((r) => r?.start_date).filter(Boolean);
  if (startDates.length === 0) return null;
  // ISO strings sort lexicographically for timestamps
  startDates.sort();
  return startDates[0];
};

const getDaysDiffFromToday = (scheduledIso) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduled = toMidnightDate(scheduledIso);
  if (!scheduled) return null;
  const diffMs = scheduled.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

const PhysicalTestsPage = () => {
  const { user } = useAuth();
  const userName = user?.nome || 'Derek';

  const [selectedAthleteId, setSelectedAthleteId] = useState('');
  const [showExpiredByAthlete, setShowExpiredByAthlete] = useState({});
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  const { data: athletes = [], isLoading: loadingAthletes, error: athletesError } = useAthletes();
  const athleteId = selectedAthleteId ? Number(selectedAthleteId) : null;
  const { data: tests = [], isLoading, error } = usePhysicalTestsByAthlete(athleteId);

  const showExpired = !!showExpiredByAthlete[athleteId];

  const normalizedTests = useMemo(() => {
    return (tests || []).map((t) => {
      const scheduledIso = getScheduledStartDate(t);
      const daysDiff = getDaysDiffFromToday(scheduledIso);
      const isExpired = typeof daysDiff === 'number' ? daysDiff < 0 : false;
      return { ...t, scheduledIso, daysDiff, isExpired };
    });
  }, [tests]);

  const visibleTests = useMemo(() => {
    if (!athleteId) return [];
    if (showExpired) return normalizedTests;
    return normalizedTests.filter((t) => !t.isExpired);
  }, [athleteId, normalizedTests, showExpired]);

  const handleToggleExpired = (checked) => {
    if (!athleteId) return;
    setShowExpiredByAthlete((prev) => ({ ...prev, [athleteId]: checked }));
  };

  const handleOpenEdit = (test) => {
    setSelectedTest(test);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setSelectedTest(null);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, pt: 12 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FactCheckIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight="700">
              Testes Físicos
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Agende e edite testes por aluno
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ mb: 2, p: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Selecione o aluno</InputLabel>
          <Select
            value={selectedAthleteId}
            onChange={(e) => setSelectedAthleteId(e.target.value)}
            label="Selecione o aluno"
            disabled={loadingAthletes}
          >
            {athletes.map((athlete) => (
              <MenuItem key={athlete.id} value={String(athlete.id)}>
                {athlete.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {athletesError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro ao carregar alunos: {athletesError.message}
        </Alert>
      )}

      {!athleteId && (
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
          <Typography variant="h6" color="text.secondary" fontWeight="500">
            Selecione um aluno
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Escolha um aluno para ver e agendar testes físicos
          </Typography>
        </Paper>
      )}

      {athleteId && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showExpired}
                  onChange={(e) => handleToggleExpired(e.target.checked)}
                />
              }
              label="Mostrar Expirados"
            />

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setScheduleOpen(true)}
            >
              Agendar Teste
            </Button>
          </Box>

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Erro ao carregar testes: {error.message}
            </Alert>
          )}

          {!isLoading && !error && visibleTests.length === 0 && (
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
              <Typography variant="h6" color="text.secondary" fontWeight="500">
                Nenhum teste agendado
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {showExpired
                  ? 'Não há testes para este aluno'
                  : 'Não há testes futuros para este aluno'}
              </Typography>
            </Paper>
          )}

          {!isLoading && !error && visibleTests.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {visibleTests.map((t) => {
                const scheduledLabel = t.scheduledIso
                  ? new Date(t.scheduledIso).toLocaleDateString('pt-BR')
                  : 'Sem data';

                let statusChip = null;
                if (t.isExpired) {
                  statusChip = <Chip label="Expirado" color="error" size="small" />;
                } else if (typeof t.daysDiff === 'number') {
                  if (t.daysDiff === 0) {
                    statusChip = <Chip label="Hoje" size="small" />;
                  } else {
                    statusChip = <Chip label={`Faltam ${t.daysDiff} dias`} size="small" />;
                  }
                }

                return (
                  <Card key={t.id}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="700">
                            {t.name}
                          </Typography>
                          {t.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {t.description}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            Data: {scheduledLabel}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>{statusChip}</Box>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenEdit(t)}
                      >
                        Editar
                      </Button>
                    </CardActions>
                  </Card>
                );
              })}
            </Box>
          )}
        </>
      )}

      <SchedulePhysicalTestModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        athleteId={athleteId}
        userName={userName}
      />

      <EditPhysicalTestModal
        open={editOpen}
        onClose={handleCloseEdit}
        physicalTest={selectedTest}
        userName={userName}
      />
    </Container>
  );
};

export default PhysicalTestsPage;
