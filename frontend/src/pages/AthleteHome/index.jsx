import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
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
  { key: 'MONDAY', label: 'Mon', index: 1 },
  { key: 'TUESDAY', label: 'Tue', index: 2 },
  { key: 'WEDNESDAY', label: 'Wed', index: 3 },
  { key: 'THURSDAY', label: 'Thu', index: 4 },
  { key: 'FRIDAY', label: 'Fri', index: 5 },
  { key: 'SATURDAY', label: 'Sat', index: 6 },
  { key: 'SUNDAY', label: 'Sun', index: 0 },
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
  const startStr = start.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  const endStr = end.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${startStr} - ${endStr}`;
};

const formatEventDate = (dateIso) => {
  if (!dateIso) return 'No date';
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return 'No date';
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const AthleteHome = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [filterTab, setFilterTab] = useState('all');
  const [selectedEventDate, setSelectedEventDate] = useState(null);

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

  const eventDaysMap = useMemo(() => {
    const teamIdSet = new Set(
      (athleteTeams || [])
        .map((row) => row?.team?.id ?? row?.id)
        .filter(Boolean)
        .map((id) => Number(id))
    );

    const weekStart = weekDates[0];
    const weekEnd = weekDates[6];
    const ymdMap = new Map();

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
        const key = localYmd(day);
        const list = ymdMap.get(key) || [];
        list.push(evt);
        ymdMap.set(key, list);
      }
    });

    ymdMap.forEach((list, key) => {
      const sorted = [...list].sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || '')));
      ymdMap.set(key, sorted);
    });

    return ymdMap;
  }, [athleteTeams, events, weekDates]);

  const calendarDays = useMemo(() => {
    return weekDates.map((date) => {
      const dayKey = dayKeyFromDate(date);
      const eventKey = localYmd(date);
      const eventsForDay = eventDaysMap.get(eventKey) || [];
      const hasWorkout = workoutDaysSet.has(dayKey);
      const hasEvent = eventsForDay.length > 0;
      return {
        date,
        dayKey,
        hasWorkout,
        hasEvent,
        eventsForDay,
      };
    });
  }, [eventDaysMap, weekDates, workoutDaysSet]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedEventDate) return [];
    return eventDaysMap.get(selectedEventDate) || [];
  }, [eventDaysMap, selectedEventDate]);

  const selectedEventDayLabel = useMemo(() => {
    if (!selectedEventDate) return '';
    const currentDay = calendarDays.find((day) => localYmd(day.date) === selectedEventDate);
    if (!currentDay) return '';
    const dayLabel = DAYS_OF_WEEK.find((x) => x.key === currentDay.dayKey)?.label || currentDay.dayKey;
    return `${dayLabel} ${currentDay.date.getDate()}`;
  }, [calendarDays, selectedEventDate]);

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
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const handleOpenEventDetails = (date) => {
    setSelectedEventDate(date);
  };

  const handleCloseEventDetails = () => {
    setSelectedEventDate(null);
  };

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
        <Alert severity="error">Unable to load your athlete profile.</Alert>
      </Container>
    );
  }

  if (!athleteId) {
    return (
      <Container maxWidth="md" sx={{ py: 4, pt: 12 }}>
        <Alert severity="warning">No athlete profile found for this user.</Alert>
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
              My Routine
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
                aria-label="Go to current week"
              >
                <TodayIcon />
              </IconButton>
            )}
          </Box>
        </Box>
      </Paper>

      {(routineExercisesError || todayExercisesError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Unable to load routine/workout data.
        </Alert>
      )}

      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="600">
            Week calendar
          </Typography>
          {(loadingRoutineExercises || loadingTeams || loadingEvents) && (
            <Chip size="small" label="Loading…" />
          )}
        </Box>

        <Grid container spacing={1.5}>
          {calendarDays.map((d) => {
            const dayLabel = DAYS_OF_WEEK.find((x) => x.key === d.dayKey)?.label || d.dayKey;
            const dateLabel = d.date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });

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
                      <Chip size="small" icon={<FitnessCenterIcon />} label="Workout" />
                    )}
                    {d.hasEvent && (
                      <Chip
                        size="small"
                        icon={<CalendarTodayIcon />}
                        label={d.eventsForDay.length > 1 ? `Events (${d.eventsForDay.length})` : 'Event'}
                        onClick={() => handleOpenEventDetails(localYmd(d.date))}
                        clickable
                      />
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

      <Dialog open={Boolean(selectedEventDate)} onClose={handleCloseEventDetails} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedEventDayLabel ? `Events on ${selectedEventDayLabel}` : 'Event details'}</DialogTitle>
        <DialogContent dividers>
          {selectedDayEvents.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No event details available for this day.
            </Typography>
          ) : (
            <List disablePadding>
              {selectedDayEvents.map((event, index) => {
                const teamNames = (event?.teams || []).map((team) => team?.name).filter(Boolean);
                const secondaryParts = [
                  formatEventDate(event?.start_date),
                  teamNames.length ? teamNames.join(', ') : null,
                ].filter(Boolean);

                return (
                  <React.Fragment key={event?.id ?? `${selectedEventDate}-${index}`}>
                    {index > 0 && <Divider sx={{ my: 1.5 }} />}
                    <ListItem disableGutters alignItems="flex-start">
                      <ListItemText
                        primary={event?.name || 'Event'}
                        secondary={
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              {secondaryParts.join(' • ')}
                            </Typography>
                            <Typography variant="body2">
                              {event?.description || 'No description provided.'}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEventDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      <Divider sx={{ mb: 3 }} />

      <Paper elevation={0} sx={{ p: 3, mb: 2, backgroundColor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TodayIcon sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h5" fontWeight="700">
              Today's workouts
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
              <Typography variant="caption">Completed</Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="800">
                {counts['in-progress']}
              </Typography>
              <Typography variant="caption">In progress</Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="800">
                {counts['not-started']}
              </Typography>
              <Typography variant="caption">Pending</Typography>
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
            No workouts today
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            There are no exercises scheduled for today.
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
                    <span>All</span>
                    <Chip label={counts.all} size="small" />
                  </Box>
                }
              />
              <Tab
                value="not-started"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>Pending</span>
                    <Chip label={counts['not-started']} size="small" color="default" />
                  </Box>
                }
              />
              <Tab
                value="in-progress"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PlayCircleIcon sx={{ fontSize: 16 }} />
                    <span>Active</span>
                    <Chip label={counts['in-progress']} size="small" color="warning" />
                  </Box>
                }
              />
              <Tab
                value="completed"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ fontSize: 16 }} />
                    <span>Completed</span>
                    <Chip label={counts.completed} size="small" color="success" />
                  </Box>
                }
              />
            </Tabs>
          </Box>

          {filteredTodayExercises.length === 0 ? (
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
              <Typography variant="body1" color="text.secondary">
                No exercises in this category
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
