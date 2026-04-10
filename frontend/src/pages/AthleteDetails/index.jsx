import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';

import api from '../../api';
import { useAthlete, useAthleteTeams, useRoutineExercisesByAthlete } from '../../hooks/useApi';

const getAthleteStatusLabel = (status) => {
  if (status === 'Ativo') return 'Active';
  if (status === 'Inativo') return 'Inactive';
  return status || '—';
};

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

const getWeekDates = (weekOffset = 0) => {
  const today = new Date();
  const currentDay = today.getDay();
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

const AthleteDetails = () => {
  const params = useParams();
  const athleteId = useMemo(() => {
    const raw = params?.athleteId;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }, [params?.athleteId]);

  const {
    data: athlete,
    isLoading: loadingAthlete,
    error: athleteError,
  } = useAthlete(athleteId);

  const {
    data: athleteTeamsRaw = [],
    isLoading: loadingTeams,
    error: teamsError,
  } = useAthleteTeams(athleteId);

  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const [selectedDayKey, setSelectedDayKey] = useState(() => dayKeyFromDate(new Date()));

  const {
    routines,
    routineExercises,
    isLoading: loadingRoutineExercises,
    error: routineExercisesError,
  } = useRoutineExercisesByAthlete(athleteId);

  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    let active = true;
    let objectUrl = null;

    const load = async () => {
      setPhotoUrl(null);
      if (!athleteId) return;

      try {
        const response = await api.get(`/athletes/${athleteId}/photo`, { responseType: 'blob' });
        objectUrl = URL.createObjectURL(response.data);
        if (active) setPhotoUrl(objectUrl);
      } catch {
        if (active) setPhotoUrl(null);
      }
    };

    load();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [athleteId]);

  const teams = useMemo(() => {
    if (!Array.isArray(athleteTeamsRaw)) return [];
    return athleteTeamsRaw
      .map((row) => row?.team || row)
      .filter(Boolean);
  }, [athleteTeamsRaw]);

  const routineNameById = useMemo(() => {
    const map = new Map();
    (routines || []).forEach((r) => {
      if (r?.id) map.set(r.id, r?.name || 'Routine');
    });
    return map;
  }, [routines]);

  const workoutsByDayKey = useMemo(() => {
    const result = new Map();
    (routineExercises || []).forEach((row) => {
      const key = String(row?.days_of_week || '').toUpperCase();
      if (!key) return;
      const list = result.get(key) || [];
      list.push(row);
      result.set(key, list);
    });

    // Sort each day by start time
    result.forEach((list, key) => {
      const sorted = [...list].sort((a, b) => String(a?.start_hour || '').localeCompare(String(b?.start_hour || '')));
      result.set(key, sorted);
    });

    return result;
  }, [routineExercises]);

  const calendarDays = useMemo(() => {
    return weekDates.map((date) => {
      const dayKey = dayKeyFromDate(date);
      const count = (workoutsByDayKey.get(dayKey) || []).length;
      return {
        date,
        dayKey,
        count,
      };
    });
  }, [weekDates, workoutsByDayKey]);

  const selectedDayRows = useMemo(() => {
    return workoutsByDayKey.get(String(selectedDayKey || '').toUpperCase()) || [];
  }, [selectedDayKey, workoutsByDayKey]);

  const athleteName = athlete?.name || '—';
  const athleteInitial = String(athlete?.name || 'A').trim().charAt(0).toUpperCase();

  if (!athleteId) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Invalid athlete id.</Alert>
      </Container>
    );
  }

  if (loadingAthlete) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={20} />
          <Typography>Loading athlete...</Typography>
        </Stack>
      </Container>
    );
  }

  if (athleteError) {
    const message = athleteError?.response?.status === 404 ? 'Athlete not found.' : 'Unable to load athlete. Please try again.';
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{message}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={700}>
            Athlete Summary
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Avatar
              src={photoUrl || undefined}
              sx={{ width: 72, height: 72 }}
              alt={athleteName}
            >
              {athleteInitial}
            </Avatar>

            <Box>
              <Typography variant="h6" fontWeight={700}>
                {athleteName}
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle1" fontWeight={700}>
              Details
            </Typography>

            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemText primary="Name" secondary={athlete?.name || '—'} />
              </ListItem>
              {'status' in (athlete || {}) && (
                <ListItem disableGutters>
                  <ListItemText primary="Status" secondary={getAthleteStatusLabel(athlete?.status)} />
                </ListItem>
              )}
              {('sportName' in (athlete || {}) || 'sport' in (athlete || {}) || 'id_sport' in (athlete || {})) && (
                <ListItem disableGutters>
                  <ListItemText
                    primary="Sport"
                    secondary={athlete?.sportName || athlete?.sport || athlete?.id_sport || '—'}
                  />
                </ListItem>
              )}
            </List>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="subtitle1" fontWeight={700}>
                Teams
              </Typography>
              {loadingTeams && <CircularProgress size={16} />}
            </Stack>

            {teamsError ? (
              <Alert severity="error">Unable to load teams.</Alert>
            ) : teams.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No teams found.
              </Typography>
            ) : (
              <List dense disablePadding>
                {teams.map((team) => (
                  <ListItem key={team.id ?? team.name} disableGutters>
                    <ListItemText primary={team?.name || '—'} />
                  </ListItem>
                ))}
              </List>
            )}
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <CalendarTodayIcon color="primary" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Routine Calendar
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatWeekRange(weekDates)}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <IconButton size="small" onClick={() => setWeekOffset((v) => v - 1)} aria-label="Previous week">
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton size="small" onClick={() => setWeekOffset((v) => v + 1)} aria-label="Next week">
                  <ChevronRightIcon />
                </IconButton>
                {weekOffset !== 0 && (
                  <IconButton size="small" onClick={() => setWeekOffset(0)} aria-label="Current week">
                    <TodayIcon />
                  </IconButton>
                )}
              </Stack>
            </Stack>

            {routineExercisesError ? (
              <Alert severity="error">Unable to load routine calendar.</Alert>
            ) : loadingRoutineExercises ? (
              <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Loading routine...
                </Typography>
              </Stack>
            ) : (
              <>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                  {calendarDays.map((d) => {
                    const dayMeta = DAYS_OF_WEEK.find((x) => x.key === d.dayKey);
                    const isSelected = d.dayKey === selectedDayKey;
                    return (
                      <Paper
                        key={d.dayKey}
                        variant="outlined"
                        onClick={() => setSelectedDayKey(d.dayKey)}
                        sx={{
                          p: 1,
                          cursor: 'pointer',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          bgcolor: isSelected ? 'action.hover' : 'background.paper',
                        }}
                      >
                        <Stack spacing={0.5} alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            {dayMeta?.label || d.dayKey}
                          </Typography>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {d.date.getDate()}
                          </Typography>
                          <Typography variant="caption" color={d.count ? 'primary.main' : 'text.secondary'}>
                            {d.count ? `${d.count} item${d.count === 1 ? '' : 's'}` : '—'}
                          </Typography>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Box>

                <Box sx={{ pt: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                    {DAYS_OF_WEEK.find((d) => d.key === selectedDayKey)?.label || selectedDayKey}
                  </Typography>

                  {selectedDayRows.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No routine items for this day.
                    </Typography>
                  ) : (
                    <List dense disablePadding>
                      {selectedDayRows.map((row) => {
                        const exerciseName = row?.exercise?.name || 'Exercise';
                        const timeRange = row?.start_hour && row?.end_hour ? `${row.start_hour} - ${row.end_hour}` : null;
                        const routineName = routineNameById.get(row?.id_routine) || 'Routine';
                        const secondaryParts = [routineName, timeRange].filter(Boolean);
                        return (
                          <ListItem key={row?.id ?? `${row?.id_routine}-${row?.id_exercise}-${row?.start_hour}-${row?.days_of_week}`} disableGutters>
                            <ListItemText primary={exerciseName} secondary={secondaryParts.join(' • ')} />
                          </ListItem>
                        );
                      })}
                    </List>
                  )}
                </Box>
              </>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default AthleteDetails;
