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
  Chip
} from '@mui/material';
import api from '../api';

export default function AddAthleteMetricValueModal({ open, onClose, onSuccess, athleteId, athleteName }) {
  const [loading, setLoading] = useState(false);
  const [baseMetrics, setBaseMetrics] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('');
  const [value, setValue] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      fetchBaseMetrics();
    }
  }, [open]);

  const fetchBaseMetrics = async () => {
    try {
      const response = await api.get('/metrics');
      // Get all metrics (both simple and aggregated)
      setBaseMetrics(response.data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const handleMetricChange = (metricId) => {
    setSelectedMetric(metricId);
    if (errors.selectedMetric) {
      setErrors(prev => ({ ...prev, selectedMetric: '' }));
    }
  };

  const handleValueChange = (newValue) => {
    setValue(newValue);
    if (errors.value) {
      setErrors(prev => ({ ...prev, value: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedMetric) {
      newErrors.selectedMetric = 'Please select a metric';
    }

    // Value is only required for non-aggregated metrics
    const metric = baseMetrics.find(m => m.id === parseInt(selectedMetric));
    if (metric && !metric.aggregated) {
      if (!value || isNaN(parseFloat(value))) {
        newErrors.value = 'Please enter a valid numeric value';
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
      const metric = baseMetrics.find(m => m.id === parseInt(selectedMetric));
      await api.post('/athlete-metrics', {
        id_metric: parseInt(selectedMetric),
        id_athlete: athleteId,
        value: metric?.aggregated ? null : parseFloat(value),
        created_by: 'system'
      });

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error adding metric value:', error);
      setErrors({ submit: 'Error adding metric value. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedMetric('');
    setValue('');
    setErrors({});
    onClose();
  };

  const selectedMetricData = baseMetrics.find(m => m.id === parseInt(selectedMetric));

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Metric Value</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          {errors.submit && (
            <Alert severity="error">{errors.submit}</Alert>
          )}

          {athleteName && (
            <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="body2" color="primary.contrastText">
                <strong>Athlete:</strong> {athleteName}
              </Typography>
            </Box>
          )}

          <FormControl fullWidth error={!!errors.selectedMetric}>
            <InputLabel>Select Metric</InputLabel>
            <Select
              value={selectedMetric}
              label="Select Metric"
              onChange={(e) => handleMetricChange(e.target.value)}
              disabled={loading}
            >
              {baseMetrics.map((metric) => (
                <MenuItem key={metric.id} value={metric.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {metric.name}
                    {metric.aggregated && (
                      <Chip 
                        label="Aggregated" 
                        size="small" 
                        color="primary"
                      />
                    )}
                    <Chip 
                      label={metric.id_sport ? `Sport: ${metric.id_sport}` : 'General'} 
                      size="small" 
                      variant="outlined"
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.selectedMetric && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                {errors.selectedMetric}
              </Typography>
            )}
          </FormControl>

          {selectedMetricData && selectedMetricData.description && (
            <Alert severity="info">
              <Typography variant="body2">
                <strong>{selectedMetricData.name}:</strong> {selectedMetricData.description}
              </Typography>
            </Alert>
          )}

          {selectedMetricData && !selectedMetricData.aggregated && (
            <TextField
              label="Value"
              fullWidth
              required
              type="number"
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              error={!!errors.value}
              helperText={errors.value || 'Enter the numeric value for this metric'}
              disabled={loading}
            />
          )}

          {selectedMetricData && selectedMetricData.aggregated && (
            <Alert severity="info">
              <Typography variant="body2">
                This is an <strong>aggregated metric</strong>. Its value will be calculated automatically based on the formula and component metrics.
              </Typography>
            </Alert>
          )}

          {selectedMetricData && !selectedMetricData.aggregated && (
            <Alert severity="info">
              <Typography variant="body2">
                Multiple values for the same metric will be <strong>summed together</strong> when calculating aggregated metrics.
              </Typography>
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
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Adding...' : 'Add Value'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
