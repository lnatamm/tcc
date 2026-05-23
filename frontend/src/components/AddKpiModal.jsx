import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import api from '../api';

export default function AddKpiModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    id_metric: ''
  });

  useEffect(() => {
    if (!open) return;

    const fetchMetrics = async () => {
      try {
        const response = await api.get('/metrics');
        setMetrics(response.data || []);
      } catch (error) {
        console.error('Error loading metrics:', error);
        setMetrics([]);
      }
    };

    fetchMetrics();
  }, [open]);

  const metricOptions = useMemo(() => metrics, [metrics]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.id_metric) {
      newErrors.id_metric = 'Metric is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post('/kpis', {
        name: formData.name.trim(),
        description: formData.description?.trim() ? formData.description.trim() : null,
        id_metric: parseInt(formData.id_metric, 10),
        created_by: 'system'
      });

      if (onSuccess) {
        await Promise.resolve(onSuccess(response.data));
      }
      handleClose();
    } catch (error) {
      console.error('Error creating KPI:', error);
      setErrors({ submit: 'Error creating KPI. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      id_metric: ''
    });
    setErrors({});
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add KPI (System-wide)</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {errors.submit && <Alert severity="error">{errors.submit}</Alert>}

          <TextField
            label="KPI Name"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            disabled={loading}
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            disabled={loading}
          />

          <FormControl fullWidth required error={!!errors.id_metric}>
            <InputLabel>Select Metric</InputLabel>
            <Select
              value={formData.id_metric}
              label="Select Metric"
              onChange={(e) => handleChange('id_metric', e.target.value)}
              disabled={loading}
            >
              {metricOptions.map((metric) => (
                <MenuItem key={metric.id} value={metric.id}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">{metric.name}</Typography>
                    {metric.description && (
                      <Typography variant="caption" color="text.secondary">
                        {metric.description}
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.id_metric && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                {errors.id_metric}
              </Typography>
            )}
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Creating...' : 'Create KPI'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
