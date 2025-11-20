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
import { useSports } from '../hooks/useApi';
import SportsIcon from '@mui/icons-material/Sports';

const SportSelector = ({ value, onChange, disabled }) => {
  const { data: sports = [], isLoading, error } = useSports();

  const getSportPhotoUrl = (sportId) => {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/sports/${sportId}/photo`;
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
        Error loading sports: {error.message}
      </Alert>
    );
  }

  if (sports.length === 0) {
    return (
      <Alert severity="info">
        No sports registered
      </Alert>
    );
  }

  return (
    <FormControl component="fieldset" fullWidth disabled={disabled}>
      <FormLabel component="legend" sx={{ mb: 1 }}>
        Select Sport *
      </FormLabel>
      <RadioGroup
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {sports.map((sport) => (
            <Paper
              key={sport.id}
              elevation={value == sport.id ? 3 : 1}
              sx={{
                p: 1.5,
                cursor: 'pointer',
                border: value == sport.id ? '2px solid #1976d2' : '2px solid transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  elevation: 2,
                  borderColor: value == sport.id ? '#1976d2' : '#e0e0e0',
                },
              }}
              onClick={() => !disabled && onChange(sport.id.toString())}
            >
              <FormControlLabel
                value={sport.id.toString()}
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 1 }}>
                    <Avatar
                      src={sport.photo_path ? getSportPhotoUrl(sport.id) : undefined}
                      alt={sport.name || 'Sport'}
                      sx={{ width: 48, height: 48, bgcolor: '#1976d2' }}
                    >
                      <SportsIcon />
                    </Avatar>
                    <Typography variant="body1" fontWeight="medium">
                      {sport.name}
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

export default SportSelector;
