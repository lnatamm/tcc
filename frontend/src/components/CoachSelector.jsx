import React from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Avatar,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useCoaches } from '../hooks/useApi';

const CoachSelector = ({ value, onChange, disabled }) => {
  const { data: coaches = [], isLoading, error } = useCoaches();

  const getCoachPhotoUrl = (coachId) => {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/coaches/${coachId}/photo`;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading coaches: {error.message}
      </Alert>
    );
  }

  if (coaches.length === 0) {
    return (
      <Alert severity="info">
        No coaches registered
      </Alert>
    );
  }

  return (
    <FormControl component="fieldset" fullWidth disabled={disabled}>
      <FormLabel component="legend" sx={{ mb: 1 }}>
        Select Coach *
      </FormLabel>
      <RadioGroup
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {coaches.map((coach) => (
            <Paper
              key={coach.id}
              elevation={value == coach.id ? 3 : 1}
              sx={{
                p: 1.5,
                cursor: 'pointer',
                border: value == coach.id ? '2px solid #1976d2' : '2px solid transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  elevation: 2,
                  borderColor: value == coach.id ? '#1976d2' : '#e0e0e0',
                },
              }}
              onClick={() => !disabled && onChange(coach.id.toString())}
            >
              <FormControlLabel
                value={coach.id.toString()}
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 1 }}>
                    <Avatar
                      src={coach.photo_path ? getCoachPhotoUrl(coach.id) : undefined}
                      alt={coach.name || 'Coach'}
                      sx={{ width: 48, height: 48 }}
                    >
                      {coach.name ? coach.name.charAt(0).toUpperCase() : '?'}
                    </Avatar>
                    <Typography variant="body1" fontWeight="medium">
                      {coach.name}
                    </Typography>
                  </Box>
                }
                sx={{ m: 0, width: '100%' }}
              />
            </Paper>
          ))}
        </Box>
      </RadioGroup>
    </FormControl>
  );
};

export default CoachSelector;
