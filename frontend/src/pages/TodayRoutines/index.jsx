import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import TodayIcon from '@mui/icons-material/Today';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ActiveExercise from '../../components/ActiveExercise';
import { useTodayExercises, useAthletes } from '../../hooks/useApi';

const TodayRoutines = () => {
  const [selectedAthleteId, setSelectedAthleteId] = useState(null);
  const [filterTab, setFilterTab] = useState('all'); // all, not-started, in-progress, completed

  const { data: athletes = [], isLoading: loadingAthletes } = useAthletes();
  const { data: exercises = [], isLoading, error, refetch } = useTodayExercises(selectedAthleteId);

  const today = new Date();
  const todayFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const filteredExercises = exercises.filter((ex) => {
    if (filterTab === 'all') return true;
    if (filterTab === 'not-started') return ex.status === 'NOT STARTED';
    if (filterTab === 'in-progress') return ex.status === 'IN PROGRESS';
    if (filterTab === 'completed') return ex.status === 'COMPLETED';
    return true;
  });

  const counts = {
    all: exercises.length,
    'not-started': exercises.filter((ex) => ex.status === 'NOT STARTED').length,
    'in-progress': exercises.filter((ex) => ex.status === 'IN PROGRESS').length,
    completed: exercises.filter((ex) => ex.status === 'COMPLETED').length,
  };

  const completionPercentage = exercises.length > 0
    ? Math.round((counts.completed / exercises.length) * 100)
    : 0;

  return (
    <Container maxWidth="md" sx={{ py: 4, pt: 12 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <TodayIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight="700">
              Today's Workout
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {todayFormatted}
            </Typography>
          </Box>
        </Box>

        {selectedAthleteId && exercises.length > 0 && (
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="700">
                {counts.completed}
              </Typography>
              <Typography variant="caption">Completed</Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="700">
                {counts['in-progress']}
              </Typography>
              <Typography variant="caption">In Progress</Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="700">
                {counts['not-started']}
              </Typography>
              <Typography variant="caption">Pending</Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="700">
                {completionPercentage}%
              </Typography>
              <Typography variant="caption">Progress</Typography>
            </Box>
          </Box>
        )}
      </Paper>

      <Paper elevation={1} sx={{ mb: 3, p: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Select Athlete</InputLabel>
          <Select
            value={selectedAthleteId || ''}
            onChange={(e) => setSelectedAthleteId(e.target.value)}
            label="Select Athlete"
          >
            {athletes.map((athlete) => (
              <MenuItem key={athlete.id} value={athlete.id}>
                {athlete.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {!selectedAthleteId && (
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
          <FitnessCenterIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight="500">
            Select an Athlete
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Choose an athlete to view their workout schedule for today
          </Typography>
        </Paper>
      )}

      {selectedAthleteId && (
        <>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Error loading exercises: {error.message}
            </Alert>
          )}

          {!isLoading && !error && exercises.length === 0 && (
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
                No Exercises Scheduled
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                There are no exercises scheduled for today
              </Typography>
            </Paper>
          )}

          {!isLoading && !error && exercises.length > 0 && (
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
                        <span>Done</span>
                        <Chip label={counts.completed} size="small" color="success" />
                      </Box>
                    }
                  />
                </Tabs>
              </Box>

              {filteredExercises.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa',
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No exercises in this category
                  </Typography>
                </Paper>
              ) : (
                <Box>
                  {filteredExercises.map((exercise) => (
                    <ActiveExercise
                      key={exercise.routine_has_exercise_id}
                      exerciseData={exercise}
                      onComplete={() => refetch()}
                    />
                  ))}
                </Box>
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default TodayRoutines;
