import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Chip,
} from '@mui/material';

const WEEKDAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

const WeekSchedulePicker = ({ value, onChange, error }) => {
  // value format: { dayOfWeek: number, startTime: string, endTime: string }
  const [selectedDay, setSelectedDay] = useState(value?.dayOfWeek ?? null);
  const [startTime, setStartTime] = useState(value?.startTime ?? '');
  const [endTime, setEndTime] = useState(value?.endTime ?? '');

  const handleDayChange = (event, newDay) => {
    if (newDay !== null) {
      setSelectedDay(newDay);
      onChange({
        dayOfWeek: newDay,
        startTime,
        endTime,
      });
    }
  };

  const handleStartTimeChange = (newStartTime) => {
    setStartTime(newStartTime);
    if (selectedDay !== null) {
      onChange({
        dayOfWeek: selectedDay,
        startTime: newStartTime,
        endTime,
      });
    }
  };

  const handleEndTimeChange = (newEndTime) => {
    setEndTime(newEndTime);
    if (selectedDay !== null) {
      onChange({
        dayOfWeek: selectedDay,
        startTime,
        endTime: newEndTime,
      });
    }
  };

  const getDayName = (dayValue) => {
    return WEEKDAYS.find(d => d.value === dayValue)?.label || '';
  };

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        Select Day of Week
      </Typography>

      <ToggleButtonGroup
        value={selectedDay}
        exclusive
        onChange={handleDayChange}
        aria-label="day of week"
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          mb: 3,
          '& .MuiToggleButton-root': {
            flex: 1,
            border: '1px solid',
            borderColor: 'divider',
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            },
          },
        }}
      >
        {WEEKDAYS.map((day) => (
          <ToggleButton 
            key={day.value} 
            value={day.value}
            sx={{ 
              py: 1.5,
              fontSize: '0.875rem',
              fontWeight: 'medium',
            }}
          >
            {day.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {selectedDay !== null && (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            backgroundColor: 'background.default',
            border: '2px solid',
            borderColor: error ? 'error.main' : 'primary.main',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Chip 
              label={getDayName(selectedDay)} 
              color="primary" 
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              Set time range
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Start Time"
                type="time"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  step: 300, // 5 min intervals
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="End Time"
                type="time"
                value={endTime}
                onChange={(e) => handleEndTimeChange(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  step: 300, // 5 min intervals
                }}
              />
            </Grid>
          </Grid>

          {startTime && endTime && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Duration: {calculateDuration(startTime, endTime)}
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

const calculateDuration = (start, end) => {
  if (!start || !end) return '';
  
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  const diffMinutes = endMinutes - startMinutes;
  
  if (diffMinutes <= 0) return 'Invalid range';
  
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

export default WeekSchedulePicker;
