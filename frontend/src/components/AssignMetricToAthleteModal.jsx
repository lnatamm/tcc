import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import api from '../api';

export default function AssignMetricToAthleteModal({ open, onClose, onSuccess, athlete }) {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState([]);
  const [formulas, setFormulas] = useState([]);
  const [athleteMetrics, setAthleteMetrics] = useState([]);
  const [selectedMetricId, setSelectedMetricId] = useState('');
  const [value, setValue] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && athlete) {
      fetchMetrics();
      fetchFormulas();
      fetchAthleteMetrics();
    }
  }, [open, athlete]);

  const fetchMetrics = async () => {
    try {
      const response = await api.get('/metrics');
      setMetrics(response.data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const fetchFormulas = async () => {
    try {
      const response = await api.get('/formulas');
      setFormulas(response.data);
    } catch (error) {
      console.error('Error loading formulas:', error);
    }
  };

  const fetchAthleteMetrics = async () => {
    try {
      const response = await api.get(`/athletes/${athlete.id}/metrics`);
      setAthleteMetrics(response.data);
    } catch (error) {
      console.error('Error loading athlete metrics:', error);
    }
  };

  const selectedMetric = metrics.find(m => m.id === selectedMetricId);
  const selectedFormula = selectedMetric?.id_formula 
    ? formulas.find(f => f.id === selectedMetric.id_formula)
    : null;

  // Filter out metrics already assigned to this athlete
  const athleteMetricIds = athleteMetrics.map(am => am.id);
  const availableMetrics = metrics.filter(m => !athleteMetricIds.includes(m.id));

  const validateForm = () => {
    const newErrors = {};

    if (!selectedMetricId) {
      newErrors.metric = 'Please select a metric';
    }

    // Only validate value for non-aggregated metrics
    if (selectedMetric && !selectedMetric.aggregated) {
      if (!value || isNaN(value) || parseFloat(value) < 0) {
        newErrors.value = 'Please enter a valid positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id_metric: selectedMetricId,
        id_athlete: athlete.id,
        // Only include value for non-aggregated metrics
        value: selectedMetric.aggregated ? null : parseFloat(value),
        created_by: 'system'
      };

      await api.post('/athlete-metrics', payload);
      
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error assigning metric:', error);
      setErrors({ submit: 'Error assigning metric. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedMetricId('');
    setValue('');
    setErrors({});
    onClose();
  };

  const handleMetricChange = (metricId) => {
    setSelectedMetricId(metricId);
    if (errors.metric) {
      setErrors(prev => ({ ...prev, metric: '' }));
    }
  };

  const handleValueChange = (newValue) => {
    setValue(newValue);
    if (errors.value) {
      setErrors(prev => ({ ...prev, value: '' }));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Assign Metric to {athlete?.name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {errors.submit && (
            <Alert severity="error">{errors.submit}</Alert>
          )}

          <FormControl fullWidth error={!!errors.metric}>
            <InputLabel>Metric *</InputLabel>
            <Select
              value={selectedMetricId}
              label="Metric *"
              onChange={(e) => handleMetricChange(e.target.value)}
            >
              <MenuItem value="">
                <em>Select a metric</em>
              </MenuItem>
              {availableMetrics.length === 0 ? (
                <MenuItem disabled>
                  <em>No available metrics (all already assigned)</em>
                </MenuItem>
              ) : (
                availableMetrics.map((metric) => (
                  <MenuItem key={metric.id} value={metric.id}>
                    {metric.name} {metric.aggregated && '(Aggregated)'}
                  </MenuItem>
                ))
              )}
            </Select>
            {errors.metric && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                {errors.metric}
              </Typography>
            )}
          </FormControl>

          {selectedMetric && (
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.300' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Metric Details
              </Typography>
              
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body2">
                  {selectedMetric.name}
                </Typography>
              </Box>

              {selectedMetric.description && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body2">
                    {selectedMetric.description}
                  </Typography>
                </Box>
              )}

              {selectedFormula && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Formula
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {selectedFormula.name}
                    </Typography>
                    {selectedFormula.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {selectedFormula.description}
                      </Typography>
                    )}
                  </Box>
                </>
              )}

              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Type
                </Typography>
                <Typography variant="body2">
                  {selectedMetric.aggregated ? 'Aggregated (Calculated)' : 'Base Metric'}
                </Typography>
              </Box>
            </Paper>
          )}

          {selectedMetric && !selectedMetric.aggregated && (
            <TextField
              label="Value *"
              type="number"
              fullWidth
              required
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              error={!!errors.value}
              helperText={errors.value || 'Enter the metric value for this athlete'}
              inputProps={{ min: 0, step: 'any' }}
            />
          )}

          {selectedMetric && selectedMetric.aggregated && (
            <Alert severity="info">
              This is an aggregated metric. Its value will be automatically calculated based on other metrics.
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || availableMetrics.length === 0}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Assigning...' : 'Assign Metric'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
