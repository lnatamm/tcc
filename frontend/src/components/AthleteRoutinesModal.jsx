import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  IconButton,
  Collapse,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import InfoIcon from '@mui/icons-material/Info';
import RepeatIcon from '@mui/icons-material/Repeat';
import TimerIcon from '@mui/icons-material/Timer';
import NotesIcon from '@mui/icons-material/Notes';
import CategoryIcon from '@mui/icons-material/Category';
import { useRoutinesByAthlete, useRoutineExercises, useCreateRoutine } from '../hooks/useApi';
import AddExerciseToRoutineModal from './AddExerciseToRoutineModal';

const DAYS_OF_WEEK = [
  { key: 'MONDAY', label: 'Monday', short: 'MON', index: 1 },
  { key: 'TUESDAY', label: 'Tuesday', short: 'TUE', index: 2 },
  { key: 'WEDNESDAY', label: 'Wednesday', short: 'WED', index: 3 },
  { key: 'THURSDAY', label: 'Thursday', short: 'THU', index: 4 },
  { key: 'FRIDAY', label: 'Friday', short: 'FRI', index: 5 },
  { key: 'SATURDAY', label: 'Saturday', short: 'SAT', index: 6 },
  { key: 'SUNDAY', label: 'Sunday', short: 'SUN', index: 0 },
];

const getWeekDates = (weekOffset = 0) => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset + (weekOffset * 7));
  monday.setHours(0, 0, 0, 0);
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  
  return dates;
};

const formatWeekRange = (weekDates) => {
  const start = weekDates[0];
  const end = weekDates[6];
  
  const startStr = start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  const endStr = end.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  
  return `${startStr} - ${endStr}`;
};

const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

const ExerciseDetailsModal = ({ open, onClose, exercise, routineExercise }) => {
  if (!exercise) return null;

  const startTime = routineExercise?.start_hour || '';
  const endTime = routineExercise?.end_hour || '';
  
  const calculateDuration = () => {
    if (!startTime || !endTime) return 'N/A';
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    const diffMinutes = endMinutes - startMinutes;
    
    if (diffMinutes <= 0) return 'Invalid time';
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}min`;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle 
        sx={{ 
          backgroundColor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 2.5,
        }}
      >
        <FitnessCenterIcon sx={{ fontSize: 28 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight="600">
            {exercise.name}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Exercise Details
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ 
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {/* Horário Section */}
        <Box sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ScheduleIcon sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" fontWeight="600">
              Schedule
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper elevation={0} sx={{ p: 2, backgroundColor: 'white', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  Start
                </Typography>
                <Typography variant="h6" fontWeight="600" color="primary.main">
                  {startTime || 'N/A'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper elevation={0} sx={{ p: 2, backgroundColor: 'white', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  End
                </Typography>
                <Typography variant="h6" fontWeight="600" color="primary.main">
                  {endTime || 'N/A'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
            <TimerIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Duration: <strong>{calculateDuration()}</strong>
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Exercise Details Section */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <InfoIcon sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" fontWeight="600">
              Exercise Information
            </Typography>
          </Box>

          <List sx={{ p: 0 }}>
            {exercise.type_exercise && (
              <>
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Box 
                      sx={{ 
                        backgroundColor: 'primary.light',
                        borderRadius: 1,
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <CategoryIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Type
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {exercise.type_exercise.name}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
                <Divider />
              </>
            )}

            {exercise.sets && (
              <>
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Box 
                      sx={{ 
                        backgroundColor: 'secondary.light',
                        borderRadius: 1,
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <RepeatIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Sets
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {exercise.sets}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
                <Divider />
              </>
            )}

            {exercise.reps && (
              <>
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Box 
                      sx={{ 
                        backgroundColor: 'success.light',
                        borderRadius: 1,
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <RepeatIcon sx={{ fontSize: 20, color: 'success.main' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Repetitions
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {exercise.reps}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
                <Divider />
              </>
            )}

            {exercise.rest_time && (
              <>
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Box 
                      sx={{ 
                        backgroundColor: 'warning.light',
                        borderRadius: 1,
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <TimerIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Rest Time
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {exercise.rest_time}s
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
                <Divider />
              </>
            )}
          </List>

          {exercise.description && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <NotesIcon sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="600">
                  Description
                </Typography>
              </Box>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  backgroundColor: '#f8f9fa',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {exercise.description}
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ExerciseCard = ({ exercise, routineExercise, onClick }) => {
  const startTime = routineExercise.start_hour || '';
  const endTime = routineExercise.end_hour || '';

  return (
    <Card 
      onClick={onClick}
      sx={{ 
        mb: 1.5,
        border: '1px solid',
        borderColor: 'primary.main',
        borderLeft: '4px solid',
        borderLeftColor: 'primary.main',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
          backgroundColor: 'rgba(25, 118, 210, 0.04)',
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box 
            sx={{ 
              backgroundColor: 'primary.main',
              borderRadius: '8px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 40,
              minHeight: 40,
            }}
          >
            <FitnessCenterIcon sx={{ fontSize: 20, color: 'white' }} />
          </Box>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="subtitle2" 
              fontWeight="600"
              sx={{ 
                mb: 0.5,
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {exercise?.name || 'Unknown Exercise'}
            </Typography>
            
            {exercise?.description && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  mb: 1,
                  lineHeight: 1.4,
                }}
              >
                {exercise.description}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ScheduleIcon sx={{ fontSize: 14, color: 'primary.main' }} />
              <Typography variant="caption" fontWeight="500" color="primary.main">
                {startTime} - {endTime}
              </Typography>
            </Box>
            
            {exercise && (
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                {exercise.sets && (
                  <Chip 
                    label={`${exercise.sets} sets`} 
                    size="small" 
                    sx={{ 
                      height: 22,
                      fontSize: '0.7rem',
                      backgroundColor: 'primary.light',
                      color: 'primary.dark',
                      fontWeight: 500,
                    }}
                  />
                )}
                {exercise.reps && (
                  <Chip 
                    label={`${exercise.reps} reps`} 
                    size="small" 
                    sx={{ 
                      height: 22,
                      fontSize: '0.7rem',
                      backgroundColor: 'secondary.light',
                      color: 'secondary.dark',
                      fontWeight: 500,
                    }}
                  />
                )}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'primary.main',
                    fontWeight: 500,
                    ml: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <InfoIcon sx={{ fontSize: 14 }} />
                  View details
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const WeekCalendarView = ({ routineId, routineName, userName }) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().getDay();
    const dayMap = { 0: 'SUNDAY', 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY', 4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY' };
    return dayMap[today] || 'MONDAY';
  });
  const [addExerciseModalOpen, setAddExerciseModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedRoutineExercise, setSelectedRoutineExercise] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const { data: exercises = [], isLoading, error } = useRoutineExercises(routineId);

  const handleExerciseClick = (exercise, routineExercise) => {
    setSelectedExercise(exercise);
    setSelectedRoutineExercise(routineExercise);
    setDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedExercise(null);
    setSelectedRoutineExercise(null);
  };

  const exercisesByDay = useMemo(() => {
    const grouped = {};
    DAYS_OF_WEEK.forEach(day => {
      grouped[day.key] = [];
    });
    
    exercises.forEach(routineExercise => {
      const day = routineExercise.days_of_week;
      if (grouped[day]) {
        grouped[day].push(routineExercise);
      }
    });
    
    // Sort exercises by start time
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => {
        const timeA = a.start_hour || '00:00';
        const timeB = b.start_hour || '00:00';
        return timeA.localeCompare(timeB);
      });
    });
    
    return grouped;
  }, [exercises]);

  const selectedDayExercises = exercisesByDay[selectedDay] || [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading exercises: {error.message}
      </Alert>
    );
  }

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, backgroundColor: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1" fontWeight="600" color="text.primary">
              <CalendarTodayIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
              Weekly Calendar
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton 
                size="small" 
                onClick={() => setWeekOffset(weekOffset - 1)}
                sx={{ 
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              
              <Paper 
                elevation={0}
                sx={{ 
                  px: 2, 
                  py: 0.5,
                  backgroundColor: weekOffset === 0 ? 'primary.light' : 'background.paper',
                  border: '1px solid',
                  borderColor: weekOffset === 0 ? 'primary.main' : 'divider',
                  minWidth: 200,
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" fontWeight="500" color={weekOffset === 0 ? 'primary.dark' : 'text.primary'}>
                  {formatWeekRange(weekDates)}
                </Typography>
              </Paper>
              
              <IconButton 
                size="small" 
                onClick={() => setWeekOffset(weekOffset + 1)}
                sx={{ 
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <ChevronRightIcon />
              </IconButton>
              
              {weekOffset !== 0 && (
                <Button
                  size="small"
                  startIcon={<TodayIcon />}
                  onClick={() => setWeekOffset(0)}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 500,
                    ml: 1,
                  }}
                >
                  Today
                </Button>
              )}
            </Box>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setAddExerciseModalOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            Add Exercise
          </Button>
        </Box>
        
        <Tabs
          value={selectedDay}
          onChange={(e, newValue) => setSelectedDay(newValue)}
          variant="fullWidth"
          sx={{
            px: 1,
            minHeight: 56,
            '& .MuiTab-root': {
              minHeight: 56,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          {DAYS_OF_WEEK.map((day, index) => {
            const count = exercisesByDay[day.key]?.length || 0;
            const dateForDay = weekDates[index];
            const isTodayDate = isToday(dateForDay);
            
            return (
              <Tab
                key={day.key}
                value={day.key}
                label={
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant="body2" 
                      fontWeight="600"
                      sx={{ 
                        color: isTodayDate && selectedDay !== day.key ? 'primary.main' : 'inherit'
                      }}
                    >
                      {day.short}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block',
                        color: isTodayDate ? 'primary.main' : 'text.secondary',
                        fontWeight: isTodayDate ? 600 : 400,
                      }}
                    >
                      {dateForDay.getDate()}
                    </Typography>
                    {count > 0 && (
                      <Chip
                        label={count}
                        size="small"
                        sx={{
                          height: 18,
                          minWidth: 18,
                          fontSize: '0.65rem',
                          mt: 0.5,
                          backgroundColor: selectedDay === day.key ? 'primary.main' : 'action.selected',
                          color: selectedDay === day.key ? 'white' : 'text.secondary',
                          fontWeight: 600,
                        }}
                      />
                    )}
                    {isTodayDate && (
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          mx: 'auto',
                          mt: 0.5,
                        }}
                      />
                    )}
                  </Box>
                }
              />
            );
          })}
        </Tabs>
      </Box>

      <Box sx={{ px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight="600" sx={{ color: 'text.primary' }}>
            {DAYS_OF_WEEK.find(d => d.key === selectedDay)?.label}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight="500">
            {weekDates[DAYS_OF_WEEK.findIndex(d => d.key === selectedDay)].toLocaleDateString('en-US', { 
              day: 'numeric', 
              month: 'long',
              year: 'numeric' 
            })}
          </Typography>
        </Box>

        {selectedDayExercises.length === 0 ? (
          <Paper 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              backgroundColor: '#f8f9fa',
              border: '2px dashed',
              borderColor: 'divider',
            }}
          >
            <CalendarTodayIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" fontWeight="500">
              No exercise planned
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Add exercises for this day
            </Typography>
          </Paper>
        ) : (
          <Box>
            {selectedDayExercises.map((routineExercise) => (
              <ExerciseCard
                key={routineExercise.id}
                exercise={routineExercise.exercise}
                routineExercise={routineExercise}
                onClick={() => handleExerciseClick(routineExercise.exercise, routineExercise)}
              />
            ))}
          </Box>
        )}
      </Box>

      <AddExerciseToRoutineModal
        open={addExerciseModalOpen}
        onClose={() => setAddExerciseModalOpen(false)}
        routineId={routineId}
        routineName={routineName}
        userName={userName}
      />

      <ExerciseDetailsModal
        open={detailsModalOpen}
        onClose={handleCloseDetailsModal}
        exercise={selectedExercise}
        routineExercise={selectedRoutineExercise}
      />
    </>
  );
};

const AthleteRoutinesModal = ({ open, onClose, athlete, userName = 'system' }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [createError, setCreateError] = useState(null);
  const [selectedRoutineTab, setSelectedRoutineTab] = useState(0);
  
  const { data: routines = [], isLoading, error } = useRoutinesByAthlete(athlete?.id);
  const createRoutine = useCreateRoutine();

  const handleCreateRoutine = async () => {
    if (!newRoutineName.trim()) {
      setCreateError('Routine name is required');
      return;
    }

    try {
      setCreateError(null);
      await createRoutine.mutateAsync({
        name: newRoutineName.trim(),
        id_athlete: athlete.id,
        created_by: userName,
      });
      
      setNewRoutineName('');
      setShowCreateForm(false);
    } catch (err) {
      setCreateError(err.message || 'Failed to create routine');
    }
  };

  const handleCancelCreate = () => {
    setNewRoutineName('');
    setCreateError(null);
    setShowCreateForm(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { 
          minHeight: '600px',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          backgroundColor: '#f8f9fa',
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" component="div" fontWeight="600">
              Training Routines
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {athlete?.name}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateForm(!showCreateForm)}
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            New Routine
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Collapse in={showCreateForm}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              backgroundColor: '#fff3cd',
              borderBottom: '1px solid',
              borderColor: 'warning.light',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Routine Name"
                  placeholder="e.g., Monday and Wednesday Training"
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                  size="medium"
                  autoFocus
                  error={!!createError}
                  helperText={createError}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateRoutine();
                    }
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleCreateRoutine}
                    disabled={createRoutine.isPending}
                  >
                    {createRoutine.isPending ? 'Creating...' : 'Create Routine'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancelCreate}
                    disabled={createRoutine.isPending}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
              <IconButton 
                onClick={handleCancelCreate}
                disabled={createRoutine.isPending}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Paper>
        </Collapse>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ m: 3 }}>
            Error loading routines: {error.message}
          </Alert>
        )}
        
        {!isLoading && !error && routines.length === 0 && !showCreateForm && (
          <Box sx={{ textAlign: 'center', p: 6 }}>
            <CalendarTodayIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" fontWeight="500">
              No routine found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Click "New Routine" to get started
            </Typography>
          </Box>
        )}
        
        {!isLoading && !error && routines.length > 0 && (
          <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
              <Tabs
                value={selectedRoutineTab}
                onChange={(e, newValue) => setSelectedRoutineTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  px: 2,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    minWidth: 120,
                    fontWeight: 500,
                    fontSize: '0.95rem',
                  },
                }}
              >
                {routines.map((routine, index) => (
                  <Tab 
                    key={routine.id} 
                    label={routine.name}
                  />
                ))}
              </Tabs>
            </Box>

            {routines.map((routine, index) => (
              <Box
                key={routine.id}
                role="tabpanel"
                hidden={selectedRoutineTab !== index}
              >
                {selectedRoutineTab === index && (
                  <WeekCalendarView 
                    routineId={routine.id} 
                    routineName={routine.name} 
                    userName={userName}
                  />
                )}
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AthleteRoutinesModal;
