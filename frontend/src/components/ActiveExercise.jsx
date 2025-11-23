import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Paper,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import TimerIcon from '@mui/icons-material/Timer';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { useStartExercise, useUpdateExerciseProgress, useEndExercise } from '../hooks/useApi';

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const ActiveExercise = ({ exerciseData, onComplete }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [concludedSets, setConcludedSets] = useState(exerciseData.concluded_sets || 0);
  const [concludedReps, setConcludedReps] = useState(exerciseData.concluded_reps || 0);
  const [concludedGoal, setConcludedGoal] = useState(exerciseData.concluded_goal || 0);
  const [showEndDialog, setShowEndDialog] = useState(false);

  const startExercise = useStartExercise();
  const updateProgress = useUpdateExerciseProgress();
  const endExercise = useEndExercise();

  const isInProgress = exerciseData.status === 'IN PROGRESS';
  const isCompleted = exerciseData.status === 'COMPLETED';
  const exercise = exerciseData.exercise;
  const exerciseType = exercise.type_exercise?.id;

  // Timer effect
  useEffect(() => {
    if (!isInProgress) return;

    const startDate = new Date(exerciseData.start_date);
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now - startDate) / 1000);
      setElapsedTime(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [isInProgress, exerciseData.start_date]);

  // Initialize concluded values from exerciseData
  useEffect(() => {
    if (exerciseData.concluded_sets !== undefined) setConcludedSets(exerciseData.concluded_sets);
    if (exerciseData.concluded_reps !== undefined) setConcludedReps(exerciseData.concluded_reps);
    if (exerciseData.concluded_goal !== undefined) setConcludedGoal(exerciseData.concluded_goal);
  }, [exerciseData]);

  const handleStart = async () => {
    try {
      await startExercise.mutateAsync({
        id_routine_has_exercise: exerciseData.routine_has_exercise_id,
        created_by: 'system',
      });
    } catch (error) {
      console.error('Error starting exercise:', error);
    }
  };

  const handleUpdateProgress = async (sets, reps) => {
    if (!exerciseData.exercise_stats_id) return;

    try {
      const updateData = { 
        updated_by: 'system',
        concluded_sets: sets,
        concluded_reps: reps
      };

      await updateProgress.mutateAsync({
        exerciseStatsId: exerciseData.exercise_stats_id,
        data: updateData,
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleIncrementSets = () => {
    const newSets = concludedSets + 1;
    const newReps = newSets * (exerciseData.reps || 0);
    setConcludedSets(newSets);
    setConcludedReps(newReps);
    handleUpdateProgress(newSets, newReps);
  };

  const handleDecrementSets = () => {
    const newSets = Math.max(0, concludedSets - 1);
    const newReps = newSets * (exerciseData.reps || 0);
    setConcludedSets(newSets);
    setConcludedReps(newReps);
    handleUpdateProgress(newSets, newReps);
  };

  const handleIncrementGoal = () => {
    const newValue = concludedGoal + 1;
    setConcludedGoal(newValue);
    handleUpdateProgress('concluded_goal', newValue);
  };

  const handleDecrementGoal = () => {
    const newValue = Math.max(0, concludedGoal - 1);
    setConcludedGoal(newValue);
    handleUpdateProgress('concluded_goal', newValue);
  };

  const checkIfComplete = () => {
    if (exerciseType === 1) {
      return concludedSets >= exerciseData.sets;
    } else if (exerciseType === 2) {
      return concludedGoal >= exerciseData.goal;
    }
    return false;
  };

  const handleEndClick = () => {
    if (!checkIfComplete()) {
      setShowEndDialog(true);
    } else {
      handleEnd();
    }
  };

  const handleEnd = async () => {
    try {
      const endData = { updated_by: 'system' };

      if (exerciseType === 1) {
        endData.concluded_sets = concludedSets;
        endData.concluded_reps = concludedReps;
      } else if (exerciseType === 2) {
        endData.concluded_goal = concludedGoal;
      }

      await endExercise.mutateAsync({
        exerciseHistoryId: exerciseData.exercise_history_id,
        data: endData,
      });

      setShowEndDialog(false);
      if (onComplete) onComplete();
    } catch (error) {
      console.error('Error ending exercise:', error);
    }
  };

  const getProgress = () => {
    if (exerciseType === 1) {
      return exerciseData.sets ? (concludedSets / exerciseData.sets) * 100 : 0;
    } else if (exerciseType === 2) {
      return exerciseData.goal ? (concludedGoal / exerciseData.goal) * 100 : 0;
    }
    return 0;
  };

  if (isCompleted) {
    return (
      <Card sx={{ mb: 2, borderLeft: '4px solid', borderLeftColor: 'success.main' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="600">
                {exercise.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {exerciseData.start_hour} - {exerciseData.end_hour}
              </Typography>
              <Chip label="Completed" color="success" size="small" sx={{ mt: 1 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!isInProgress) {
    return (
      <Card sx={{ mb: 2, borderLeft: '4px solid', borderLeftColor: 'primary.main' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="600">
                {exercise.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {exerciseData.start_hour} - {exerciseData.end_hour}
              </Typography>
              {exercise.description && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  {exercise.description}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                {exerciseType === 1 && (
                  <>
                    <Chip label={`${exerciseData.sets} sets`} size="small" />
                    <Chip label={`${exerciseData.reps} reps`} size="small" />
                  </>
                )}
                {exerciseType === 2 && (
                  <Chip label={`Goal: ${exerciseData.goal}`} size="small" />
                )}
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleStart}
              disabled={startExercise.isPending}
              sx={{ ml: 2 }}
            >
              Start
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ mb: 2, borderLeft: '4px solid', borderLeftColor: 'warning.main' }}>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6" fontWeight="600">
                {exercise.name}
              </Typography>
              <Chip
                icon={<TimerIcon />}
                label={formatTime(elapsedTime)}
                color="warning"
                sx={{ fontWeight: 'bold', fontSize: '1rem' }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {exerciseData.start_hour} - {exerciseData.end_hour}
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={Math.min(getProgress(), 100)}
            sx={{ mb: 3, height: 8, borderRadius: 4 }}
          />

          {exerciseType === 1 && (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f5f5f5', textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    Sets
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <IconButton size="small" onClick={handleDecrementSets} disabled={concludedSets === 0}>
                      <RemoveIcon />
                    </IconButton>
                    <Typography variant="h4" fontWeight="600" sx={{ minWidth: 60, textAlign: 'center' }}>
                      {concludedSets}
                    </Typography>
                    <IconButton size="small" onClick={handleIncrementSets}>
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    / {exerciseData.sets}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f5f5f5', textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    Total Reps
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h4" fontWeight="600" sx={{ minWidth: 60, textAlign: 'center' }}>
                      {concludedReps}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    ({concludedSets} × {exerciseData.reps})
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}

          {exerciseType === 2 && (
            <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f5f5f5', textAlign: 'center', mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                Goal Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <IconButton onClick={handleDecrementGoal} disabled={concludedGoal === 0}>
                  <RemoveIcon />
                </IconButton>
                <Typography variant="h3" fontWeight="600" sx={{ minWidth: 100, textAlign: 'center' }}>
                  {concludedGoal}
                </Typography>
                <IconButton onClick={handleIncrementGoal}>
                  <AddIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                / {exerciseData.goal}
              </Typography>
            </Paper>
          )}

          <Button
            variant="contained"
            color="error"
            startIcon={<StopIcon />}
            onClick={handleEndClick}
            fullWidth
            disabled={endExercise.isPending}
          >
            End Exercise
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showEndDialog} onClose={() => setShowEndDialog(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Incomplete Exercise
        </DialogTitle>
        <DialogContent>
          <Typography>
            You haven't completed all the required {exerciseType === 1 ? 'sets and reps' : 'goals'} for this exercise.
            Are you sure you want to end it?
          </Typography>
          {exerciseType === 1 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Progress: {concludedSets}/{exerciseData.sets} sets ({concludedReps} total reps)
              </Typography>
            </Box>
          )}
          {exerciseType === 2 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Progress: {concludedGoal}/{exerciseData.goal}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEndDialog(false)}>
            Continue Exercise
          </Button>
          <Button onClick={handleEnd} variant="contained" color="error">
            End Anyway
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ActiveExercise;
