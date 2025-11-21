import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  TextField,
  Button,
  Paper,
  Stack,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const ExcludedDatesManager = ({ excludedDates = [], onAdd, onRemove, disabled = false }) => {
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = () => {
    if (newDate) {
      onAdd({
        excluded_date: newDate,
        reason: newReason.trim() || null,
      });
      setNewDate('');
      setNewReason('');
      setShowAddForm(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Excluded Dates (holidays, rest days)
        </Typography>
        {!showAddForm && (
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setShowAddForm(true)}
            disabled={disabled}
          >
            Add Exception
          </Button>
        )}
      </Box>

      {showAddForm && (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            mb: 2,
            backgroundColor: 'background.default',
            border: '1px dashed',
            borderColor: 'primary.main'
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Select a specific date to skip this exercise
          </Typography>
          <Stack spacing={1.5}>
            <TextField
              type="date"
              label="Date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: new Date().toISOString().split('T')[0] // Can't exclude past dates
              }}
            />
            <TextField
              label="Reason (optional)"
              placeholder="e.g., Holiday, Rest day, Competition"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              size="small"
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleAdd}
                disabled={!newDate}
                size="small"
              >
                Add
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowAddForm(false);
                  setNewDate('');
                  setNewReason('');
                }}
                size="small"
              >
                Cancel
              </Button>
            </Box>
          </Stack>
        </Paper>
      )}

      {excludedDates.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {excludedDates.map((item) => (
            <Tooltip 
              key={item.id || item.excluded_date} 
              title={item.reason || 'No reason provided'}
              arrow
            >
              <Chip
                label={formatDate(item.excluded_date)}
                onDelete={() => onRemove(item.id || item.excluded_date)}
                color="warning"
                variant="outlined"
                size="small"
                disabled={disabled}
                sx={{
                  '& .MuiChip-deleteIcon': {
                    color: 'warning.main',
                  },
                }}
              />
            </Tooltip>
          ))}
        </Box>
      ) : !showAddForm && (
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No exceptions added. This exercise will repeat every week on the selected day.
        </Typography>
      )}
    </Box>
  );
};

export default ExcludedDatesManager;
