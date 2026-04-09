import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';

import ActiveExercise from '../../components/ActiveExercise';
import { useEvents, useMyAthlete, useAthleteTeams, useRoutineExercisesByAthlete, useTodayExercises } from '../../hooks/useApi';

const DAYS_OF_WEEK = [
  { key: 'MONDAY', label: 'Seg', index: 1 },
  { key: 'TUESDAY', label: 'Ter', index: 2 },
  { key: 'WEDNESDAY', label: 'Qua', index: 3 },
  { key: 'THURSDAY', label: 'Qui', index: 4 },
  { key: 'FRIDAY', label: 'Sex', index: 5 },
  { key: 'SATURDAY', label: 'Sáb', index: 6 },
  { key: 'SUNDAY', label: 'Dom', index: 0 },
];

const dayKeyFromDate = (date) => {
  const dayMap = {
    0: 'SUNDAY',
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY',
  };
  return dayMap[date.getDay()];
};

const localYmd = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getWeekDates = (weekOffset = 0) => {
  const today = new Date();
  const currentDay = today.getDay(); // 0=Sunday
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);

  const dates = [];
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  return dates;
};

const formatWeekRange = (weekDates) => {
  const start = weekDates[0];
  const end = weekDates[6];
  const startStr = start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const endStr = end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${startStr} - ${endStr}`;
};

const AthleteHome = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [filterTab, setFilterTab] = useState('all');

  const { data: myAthlete, isLoading: loadingMyAthlete, error: myAthleteError } = useMyAthlete();
  const athleteId = myAthlete?.id;

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const { data: athleteTeams = [], isLoading: loadingTeams } = useAthleteTeams(athleteId);
  const { data: events = [], isLoading: loadingEvents } = useEvents();
  const {
    routineExercises,
    isLoading: loadingRoutineExercises,
    error: routineExercisesError,
  } = useRoutineExercisesByAthlete(athleteId);

  const {
    data: todayExercises = [],
    isLoading: loadingTodayExercises,
    error: todayExercisesError,
    refetch: refetchToday,
  } = useTodayExercises(athleteId);

  const workoutDaysSet = useMemo(() => {
    const set = new Set();
    routineExercises.forEach((re) => {
      if (re?.days_of_week) set.add(String(re.days_of_week).toUpperCase());
    });
    return set;
  }, [routineExercises]);

  const eventDaysSet = useMemo(() => {
    const teamIdSet = new Set(
      (athleteTeams || [])
        .map((row) => row?.team?.id ?? row?.id)
        .filter(Boolean)
        .map((id) => Number(id))
    );

    const weekStart = weekDates[0];
    const weekEnd = weekDates[6];
    const ymdSet = new Set();

    (events || []).forEach((evt) => {
      const evtTeamIds = (evt?.teams || []).map((t) => Number(t?.id)).filter(Boolean);
      const matchesTeam = evtTeamIds.some((id) => teamIdSet.has(id));
      if (!matchesTeam) return;

      const startDate = evt?.start_date ? new Date(evt.start_date) : null;
      if (!startDate || Number.isNaN(startDate.getTime())) return;

      // Compare by local date range
      const day = new Date(startDate);
      day.setHours(0, 0, 0, 0);

      if (day >= weekStart && day <= weekEnd) {
        ymdSet.add(localYmd(day));
      }
    });

    return ymdSet;
  }, [athleteTeams, events, weekDates]);

  const calendarDays = useMemo(() => {
    return weekDates.map((date) => {
      const dayKey = dayKeyFromDate(date);
      const hasWorkout = workoutDaysSet.has(dayKey);
      const hasEvent = eventDaysSet.has(localYmd(date));
      return {
        date,
        dayKey,
        hasWorkout,
        hasEvent,
      };
    });
  }, [eventDaysSet, weekDates, workoutDaysSet]);

  const counts = useMemo(() => {
    const all = todayExercises.length;
    const notStarted = todayExercises.filter((ex) => ex.status === 'NOT STARTED').length;
    const inProgress = todayExercises.filter((ex) => ex.status === 'IN PROGRESS').length;
    const completed = todayExercises.filter((ex) => ex.status === 'COMPLETED').length;
    return {
      all,
      'not-started': notStarted,
      'in-progress': inProgress,
      completed,
    };
  }, [todayExercises]);

  const filteredTodayExercises = useMemo(() => {
    return todayExercises.filter((ex) => {
      if (filterTab === 'all') return true;
      if (filterTab === 'not-started') return ex.status === 'NOT STARTED';
      if (filterTab === 'in-progress') return ex.status === 'IN PROGRESS';
      if (filterTab === 'completed') return ex.status === 'COMPLETED';
      return true;
    });
  }, [filterTab, todayExercises]);

  const todayFormatted = useMemo(() => {
    const today = new Date();
    return today.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  if (loadingMyAthlete) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6, pt: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (myAthleteError) {
    return (
      <Container maxWidth="md" sx={{ py: 4, pt: 12 }}>
        <Alert severity="error">Não foi possível carregar seu perfil de atleta.</Alert>
      </Container>
    );
  }

  if (!athleteId) {
    return (
      <Container maxWidth="md" sx={{ py: 4, pt: 12 }}>
        <Alert severity="warning">Perfil de atleta não encontrado para este usuário.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, pt: 12 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CalendarTodayIcon sx={{ fontSize: 36 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="700">
              Minha Rotina
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {formatWeekRange(weekDates)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => setWeekOffset((v) => v - 1)}
              sx={{ color: 'white', border: '1px solid', borderColor: 'rgba(255,255,255,0.35)' }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setWeekOffset((v) => v + 1)}
              sx={{ color: 'white', border: '1px solid', borderColor: 'rgba(255,255,255,0.35)' }}
            >
              <ChevronRightIcon />
            </IconButton>
            {weekOffset !== 0 && (
              <IconButton
                size="small"
                onClick={() => setWeekOffset(0)}
                sx={{ color: 'white', border: '1px solid', borderColor: 'rgba(255,255,255,0.35)' }}
                aria-label="Ir para semana atual"
              >
                <TodayIcon />
              </IconButton>
            )}
          </Box>
        </Box>
      </Paper>

      {(routineExercisesError || todayExercisesError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Falha ao carregar dados da rotina/treinos.
        </Alert>
      )}

      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="600">
            Calendário da semana
          </Typography>
          {(loadingRoutineExercises || loadingTeams || loadingEvents) && (
            <Chip size="small" label="Carregando…" />
          )}
        </Box>

        <Grid container spacing={1.5}>
          {calendarDays.map((d) => {
            const dayLabel = DAYS_OF_WEEK.find((x) => x.key === d.dayKey)?.label || d.dayKey;
            const dateLabel = d.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

            return (
              <Grid item xs={6} sm={3} md={12 / 7} key={localYmd(d.date)}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    height: '100%',
                    borderColor: d.hasWorkout || d.hasEvent ? 'primary.main' : 'divider',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block">
                    {dayLabel}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight="700">
                    {dateLabel}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {d.hasWorkout && (
                      <Chip size="small" icon={<FitnessCenterIcon />} label="Treino" />
                    )}
                    {d.hasEvent && (
                      <Chip size="small" icon={<CalendarTodayIcon />} label="Evento" />
                    )}
                    {!d.hasWorkout && !d.hasEvent && (
                      <Chip size="small" variant="outlined" label="—" />
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      <Divider sx={{ mb: 3 }} />

      <Paper elevation={0} sx={{ p: 3, mb: 2, backgroundColor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TodayIcon sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h5" fontWeight="700">
              Treinos de hoje
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {todayFormatted}
            </Typography>
          </Box>
        </Box>

        {todayExercises.length > 0 && (
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="800">
                {counts.completed}
              </Typography>
              <Typography variant="caption">Concluídos</Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="800">
                {counts['in-progress']}
              </Typography>
              <Typography variant="caption">Em andamento</Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="800">
                {counts['not-started']}
              </Typography>
              <Typography variant="caption">Pendentes</Typography>
            </Box>
          </Box>
        )}
      </Paper>

      {loadingTodayExercises && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loadingTodayExercises && todayExercises.length === 0 && (
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
          <CalendarTodayIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight="500">
            Nenhum treino hoje
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Não há exercícios agendados para hoje
          </Typography>
        </Paper>
      )}

      {!loadingTodayExercises && todayExercises.length > 0 && (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={filterTab}
              onChange={(e, newValue) => setFilterTab(newValue)}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                },
              }}
            >
              <Tab
                value="all"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>Todos</span>
                    <Chip label={counts.all} size="small" />
                  </Box>
                }
              />
              <Tab
                value="not-started"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>Pendentes</span>
                    <Chip label={counts['not-started']} size="small" color="default" />
                  </Box>
                }
              />
              <Tab
                value="in-progress"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PlayCircleIcon sx={{ fontSize: 16 }} />
                    <span>Ativos</span>
                    <Chip label={counts['in-progress']} size="small" color="warning" />
                  </Box>
                }
              />
              <Tab
                value="completed"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ fontSize: 16 }} />
                    <span>Feitos</span>
                    <Chip label={counts.completed} size="small" color="success" />
                  </Box>
                }
              />
            </Tabs>
          </Box>

          {filteredTodayExercises.length === 0 ? (
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
              <Typography variant="body1" color="text.secondary">
                Nenhum exercício nessa categoria
              </Typography>
            </Paper>
          ) : (
            <Box>
              {filteredTodayExercises.map((exercise) => (
                <ActiveExercise
                  key={exercise.routine_has_exercise_id}
                  exerciseData={exercise}
                  onComplete={() => refetchToday()}
                />
              ))}
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default AthleteHome;
