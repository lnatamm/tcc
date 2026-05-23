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
import AddKpiModal from './AddKpiModal';

const CREATE_KPI_VALUE = '__create_kpi__';

function toDatetimeLocalValue(isoLikeString) {
  if (!isoLikeString) return '';
  // Expected input from backend/DB is ISO; datetime-local expects YYYY-MM-DDTHH:mm
  const date = new Date(isoLikeString);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function nowPlusDaysLocal(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toDatetimeLocalValue(d.toISOString());
}

export default function AssignAthleteKpiModal({
  open,
  onClose,
  onSuccess,
  athleteId,
  mode = 'create',
  athleteKpi = null,
}) {
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState([]);
  const [goalTypes, setGoalTypes] = useState([]);
  const [errors, setErrors] = useState({});

  const [addKpiModalOpen, setAddKpiModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    id_kpi: '',
    id_goal_type: '',
    goal_value: '',
    goal_date: nowPlusDaysLocal(30),
  });

  const isEditMode = mode === 'edit';

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        const requests = [api.get('/goal-types')];
        if (!isEditMode) {
          requests.unshift(api.get('/kpis'));
        }

        const responses = await Promise.all(requests);
        const goalTypeResponse = responses[responses.length - 1];
        const kpiResponse = responses.length === 2 ? responses[0] : null;

        setKpis(kpiResponse?.data || []);
        setGoalTypes(goalTypeResponse.data || []);
      } catch (error) {
        console.error('Error loading KPI configuration:', error);
        setKpis([]);
        setGoalTypes([]);
        setErrors((prev) => ({ ...prev, submit: 'Error loading KPI data. Please try again.' }));
      }
    };

    fetchData();
  }, [open, isEditMode]);

  useEffect(() => {
    if (!open) return;
    if (!isEditMode || !athleteKpi) return;

    setFormData({
      id_kpi: athleteKpi.kpi_id ?? athleteKpi.id_kpi ?? '',
      id_goal_type: athleteKpi.id_goal_type ?? '',
      goal_value: athleteKpi.goal_value ?? '',
      goal_date: toDatetimeLocalValue(athleteKpi.goal_date),
    });
    setErrors({});
  }, [open, isEditMode, athleteKpi]);

  const refreshKpis = async () => {
    const response = await api.get('/kpis');
    const nextKpis = response.data || [];
    setKpis(nextKpis);
    return nextKpis;
  };

  const extractCreatedKpiId = (createdPayload) => {
    if (!createdPayload) return null;
    if (Array.isArray(createdPayload)) {
      return createdPayload[0]?.id ?? null;
    }
    return createdPayload.id ?? null;
  };

  const kpiOptions = useMemo(() => kpis, [kpis]);
  const goalTypeOptions = useMemo(() => goalTypes, [goalTypes]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleKpiSelectionChange = (value) => {
    if (value === CREATE_KPI_VALUE) {
      setAddKpiModalOpen(true);
      return;
    }
    handleChange('id_kpi', value);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!athleteId) {
      newErrors.submit = 'Please select an athlete first.';
    }

    if (!formData.id_kpi) {
      newErrors.id_kpi = 'KPI is required';
    }

    if (!formData.id_goal_type) {
      newErrors.id_goal_type = 'Goal type is required';
    }

    if (formData.goal_value === '' || Number.isNaN(parseFloat(formData.goal_value))) {
      newErrors.goal_value = 'Please enter a valid numeric target value';
    }

    if (!formData.goal_date) {
      newErrors.goal_date = 'Goal date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Send ISO string; datetime-local is local time, so convert to Date then ISO.
      const goalDateIso = new Date(formData.goal_date).toISOString();

      if (isEditMode) {
        if (!athleteKpi?.athlete_kpi_id) {
          setErrors({ submit: 'Missing athlete KPI reference. Please close and try again.' });
          return;
        }

        await api.put(`/athlete-kpis/${athleteKpi.athlete_kpi_id}`, {
          id_kpi: parseInt(formData.id_kpi, 10),
          id_athlete: athleteId,
          id_goal_type: parseInt(formData.id_goal_type, 10),
          goal_value: parseFloat(formData.goal_value),
          goal_date: goalDateIso,
          updated_by: 'system'
        });
      } else {
        await api.post('/athlete-kpis', {
          id_kpi: parseInt(formData.id_kpi, 10),
          id_athlete: athleteId,
          id_goal_type: parseInt(formData.id_goal_type, 10),
          goal_value: parseFloat(formData.goal_value),
          goal_date: goalDateIso,
          created_by: 'system'
        });
      }

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Error saving athlete KPI:', error);
      setErrors({ submit: isEditMode ? 'Error updating KPI goal. Please try again.' : 'Error assigning KPI. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      id_kpi: '',
      id_goal_type: '',
      goal_value: '',
      goal_date: nowPlusDaysLocal(30),
    });
    setErrors({});
    setAddKpiModalOpen(false);
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit Athlete KPI Goal' : 'Assign KPI to Athlete'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {errors.submit && <Alert severity="error">{errors.submit}</Alert>}

          {isEditMode ? (
            <TextField
              label="KPI"
              fullWidth
              value={athleteKpi?.kpi_name || ''}
              disabled
            />
          ) : (
            <FormControl fullWidth required error={!!errors.id_kpi}>
              <InputLabel>Select KPI</InputLabel>
              <Select
                value={formData.id_kpi}
                label="Select KPI"
                onChange={(e) => handleKpiSelectionChange(e.target.value)}
                disabled={loading}
              >
                {kpiOptions.map((kpi) => (
                  <MenuItem key={kpi.id} value={kpi.id}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2">{kpi.name}</Typography>
                      {kpi.description && (
                        <Typography variant="caption" color="text.secondary">
                          {kpi.description}
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                ))}

                <MenuItem value={CREATE_KPI_VALUE}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    Create new KPI...
                  </Typography>
                </MenuItem>
              </Select>
              {errors.id_kpi && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {errors.id_kpi}
                </Typography>
              )}
            </FormControl>
          )}

          <FormControl fullWidth required error={!!errors.id_goal_type}>
            <InputLabel>Goal Type</InputLabel>
            <Select
              value={formData.id_goal_type}
              label="Goal Type"
              onChange={(e) => handleChange('id_goal_type', e.target.value)}
              disabled={loading}
            >
              {goalTypeOptions.map((goalType) => (
                <MenuItem key={goalType.id} value={goalType.id}>
                  {goalType.name}
                </MenuItem>
              ))}
            </Select>
            {errors.id_goal_type && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                {errors.id_goal_type}
              </Typography>
            )}
          </FormControl>

          <TextField
            label="Target Value"
            fullWidth
            required
            type="number"
            value={formData.goal_value}
            onChange={(e) => handleChange('goal_value', e.target.value)}
            error={!!errors.goal_value}
            helperText={errors.goal_value}
            disabled={loading}
          />

          <TextField
            label="Goal Date"
            fullWidth
            required
            type="datetime-local"
            value={formData.goal_date}
            onChange={(e) => handleChange('goal_date', e.target.value)}
            error={!!errors.goal_date}
            helperText={errors.goal_date}
            disabled={loading}
            InputLabelProps={{ shrink: true }}
          />
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
          {loading ? (isEditMode ? 'Saving...' : 'Assigning...') : (isEditMode ? 'Save Changes' : 'Assign KPI')}
        </Button>
      </DialogActions>

      {!isEditMode && (
        <AddKpiModal
          open={addKpiModalOpen}
          onClose={() => setAddKpiModalOpen(false)}
          onSuccess={async (createdPayload) => {
            try {
              const createdId = extractCreatedKpiId(createdPayload);
              const nextKpis = await refreshKpis();
              const idToSelect = createdId ?? nextKpis[nextKpis.length - 1]?.id ?? '';

              setFormData((prev) => ({ ...prev, id_kpi: idToSelect }));
              if (errors.id_kpi) {
                setErrors((prev) => ({ ...prev, id_kpi: '' }));
              }
            } catch (error) {
              console.error('Error refreshing KPI options after creation:', error);
              setErrors((prev) => ({
                ...prev,
                submit: 'KPI was created, but the KPI list could not be refreshed. Please try again.',
              }));
            } finally {
              setAddKpiModalOpen(false);
            }
          }}
        />
      )}
    </Dialog>
  );
}
