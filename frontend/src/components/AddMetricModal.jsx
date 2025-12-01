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
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import api from '../api';
import CoachSelector from './CoachSelector';
import SportSelector from './SportSelector';

export default function AddMetricModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formulas, setFormulas] = useState([]);
  const [availableMetrics, setAvailableMetrics] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    id_formula: '',
    id_coach: '',
    id_sport: '',
    ids_metrics: [],
    aggregated: false,
    value: ''
  });

  const [metricSelections, setMetricSelections] = useState([]);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      fetchFormulas();
      fetchMetrics();
    }
  }, [open]);

  const fetchFormulas = async () => {
    try {
      const response = await api.get('/formulas');
      setFormulas(response.data);
    } catch (error) {
      console.error('Error loading formulas:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await api.get('/metrics');
      // Only non-aggregated metrics can be used as parameters for formulas
      setAvailableMetrics(response.data.filter(m => !m.aggregated));
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear field error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // If formula changes, reset selected metrics
    if (field === 'id_formula') {
      setFormData(prev => ({ ...prev, ids_metrics: [] }));
      const selectedFormula = formulas.find(f => f.id === value);
      const maxArgs = selectedFormula?.max_arguments || 0;
      setMetricSelections(Array(maxArgs).fill(''));
    }

    // If aggregated is unchecked, clear formula and metrics
    if (field === 'aggregated' && !value) {
      setFormData(prev => ({
        ...prev,
        id_formula: '',
        ids_metrics: []
      }));
      setMetricSelections([]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.id_coach) {
      newErrors.id_coach = 'Coach is required';
    }

    if (!formData.id_sport) {
      newErrors.id_sport = 'Sport is required';
    }

    if (formData.aggregated) {
      if (!formData.id_formula) {
        newErrors.id_formula = 'Formula is required for aggregated metrics';
      } else {
        const selectedFormula = formulas.find(f => f.id === formData.id_formula);
        if (selectedFormula) {
          const filledMetrics = metricSelections.filter(m => m !== '');
          if (filledMetrics.length === 0) {
            newErrors.ids_metrics = 'Select at least one metric';
          } else if (selectedFormula.max_arguments && filledMetrics.length < selectedFormula.max_arguments) {
            newErrors.ids_metrics = `This formula requires exactly ${selectedFormula.max_arguments} metrics`;
          }
        }
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
      // Create the metric
      const filledMetrics = metricSelections.filter(m => m !== '');
      const metricPayload = {
        name: formData.name,
        description: formData.description || null,
        id_formula: formData.aggregated && formData.id_formula ? formData.id_formula : null,
        id_coach: formData.id_coach,
        id_sport: formData.id_sport,
        ids_metrics: formData.aggregated && filledMetrics.length > 0 
          ? filledMetrics.join(',') 
          : null,
        aggregated: formData.aggregated,
        created_by: 'system'
      };

      await api.post('/metrics', metricPayload);
      
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating metric:', error);
      setErrors({ submit: 'Error creating metric. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      id_formula: '',
      id_coach: '',
      id_sport: '',
      ids_metrics: [],
      aggregated: false,
      value: ''
    });
    setMetricSelections([]);
    setErrors({});
    onClose();
  };

  const handleMetricSelectionChange = (index, value) => {
    const newSelections = [...metricSelections];
    newSelections[index] = value;
    setMetricSelections(newSelections);
    // Clear error
    if (errors.ids_metrics) {
      setErrors(prev => ({ ...prev, ids_metrics: '' }));
    }
  };

  const selectedFormula = formulas.find(f => f.id === formData.id_formula);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Metric</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {errors.submit && (
            <Alert severity="error">{errors.submit}</Alert>
          )}

          <TextField
            label="Metric Name"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />

          <Box>
            <CoachSelector
              value={formData.id_coach}
              onChange={(value) => handleChange('id_coach', value)}
              disabled={loading}
            />
            {errors.id_coach && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {errors.id_coach}
              </Alert>
            )}
          </Box>

          <Box>
            <SportSelector
              value={formData.id_sport}
              onChange={(value) => handleChange('id_sport', value)}
              disabled={loading}
            />
            {errors.id_sport && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {errors.id_sport}
              </Alert>
            )}
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.aggregated}
                onChange={(e) => handleChange('aggregated', e.target.checked)}
              />
            }
            label="Aggregated Metric (calculated from other metrics)"
          />

          {formData.aggregated && (
            <>
              <FormControl fullWidth error={!!errors.id_formula}>
                <InputLabel>Formula *</InputLabel>
                <Select
                  value={formData.id_formula}
                  label="Formula *"
                  onChange={(e) => handleChange('id_formula', e.target.value)}
                >
                  <MenuItem value="">
                    <em>Select a formula</em>
                  </MenuItem>
                  {formulas.map((formula) => (
                    <MenuItem key={formula.id} value={formula.id}>
                      {formula.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.id_formula && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.id_formula}
                  </Typography>
                )}
              </FormControl>

              {selectedFormula && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {selectedFormula.name}
                  </Typography>
                  <Typography variant="body2">
                    {selectedFormula.description}
                  </Typography>
                  {selectedFormula.max_arguments && (
                    <Typography variant="caption">
                      Maximum arguments: {selectedFormula.max_arguments}
                    </Typography>
                  )}
                </Alert>
              )}

              {formData.id_formula && selectedFormula && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Select the metrics in operation order:
                  </Typography>
                  {metricSelections.map((selection, index) => (
                    <FormControl 
                      key={index} 
                      fullWidth 
                      sx={{ mb: 2 }}
                      error={!!errors.ids_metrics}
                    >
                      <InputLabel>
                        {selectedFormula.name === 'Division' && index === 0 && 'Numerator (Metric 1)'}
                        {selectedFormula.name === 'Division' && index === 1 && 'Denominator (Metric 2)'}
                        {selectedFormula.name !== 'Division' && `Metric ${index + 1}`}
                      </InputLabel>
                      <Select
                        value={selection}
                        label={
                          selectedFormula.name === 'Division' && index === 0 ? 'Numerator (Metric 1)' :
                          selectedFormula.name === 'Division' && index === 1 ? 'Denominator (Metric 2)' :
                          `Metric ${index + 1}`
                        }
                        onChange={(e) => handleMetricSelectionChange(index, e.target.value)}
                      >
                        <MenuItem value="">
                          <em>Select a metric</em>
                        </MenuItem>
                        {availableMetrics
                          .filter(m => !metricSelections.includes(m.id) || m.id === selection)
                          .map((metric) => (
                            <MenuItem key={metric.id} value={metric.id}>
                              {metric.name} (Value: {metric.value || 'N/A'})
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  ))}
                  {errors.ids_metrics && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {errors.ids_metrics}
                    </Alert>
                  )}
                </Box>
              )}
            </>
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
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
