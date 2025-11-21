import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useSports, useTypeExercises, useCreateExercise } from '../hooks/useApi';

const CreateExerciseModal = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    reps: '',
    sets: '',
    id_sport: '',
    id_type: '',
  });
  const [errors, setErrors] = useState({});

  const { data: sports = [], isLoading: loadingSports } = useSports();
  const { data: typeExercises = [], isLoading: loadingTypes } = useTypeExercises();
  const createExercise = useCreateExercise();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.id_sport) {
      newErrors.id_sport = 'Sport is required';
    }
    if (!formData.id_type) {
      newErrors.id_type = 'Exercise type is required';
    }
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        reps: formData.reps ? parseInt(formData.reps) : null,
        sets: formData.sets ? parseInt(formData.sets) : null,
        id_sport: parseInt(formData.id_sport),
        id_type: formData.id_type,
        photo_path: null,
        video_path: null,
        created_by: 'system',
      };

      const result = await createExercise.mutateAsync(payload);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        reps: '',
        sets: '',
        id_sport: '',
        id_type: '',
      });
      setErrors({});
      
      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to create exercise' });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      reps: '',
      sets: '',
      id_sport: '',
      id_type: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Exercise</DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {errors.submit && (
            <Alert severity="error">{errors.submit}</Alert>
          )}

          <TextField
            label="Exercise Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            required
            fullWidth
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            multiline
            rows={3}
            fullWidth
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Sets"
              type="number"
              value={formData.sets}
              onChange={(e) => handleChange('sets', e.target.value)}
              InputProps={{ inputProps: { min: 0 } }}
              fullWidth
            />

            <TextField
              label="Reps"
              type="number"
              value={formData.reps}
              onChange={(e) => handleChange('reps', e.target.value)}
              InputProps={{ inputProps: { min: 0 } }}
              fullWidth
            />
          </Box>

          <TextField
            select
            label="Sport"
            value={formData.id_sport}
            onChange={(e) => handleChange('id_sport', e.target.value)}
            error={!!errors.id_sport}
            helperText={errors.id_sport}
            required
            fullWidth
            disabled={loadingSports}
          >
            {loadingSports ? (
              <MenuItem disabled>Loading sports...</MenuItem>
            ) : (
              sports.map((sport) => (
                <MenuItem key={sport.id} value={sport.id}>
                  {sport.name}
                </MenuItem>
              ))
            )}
          </TextField>

          <TextField
            select
            label="Exercise Type"
            value={formData.id_type}
            onChange={(e) => handleChange('id_type', e.target.value)}
            error={!!errors.id_type}
            helperText={errors.id_type}
            required
            fullWidth
            disabled={loadingTypes}
          >
            {loadingTypes ? (
              <MenuItem disabled>Loading types...</MenuItem>
            ) : (
              typeExercises.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))
            )}
          </TextField>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleCancel} disabled={createExercise.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={createExercise.isPending || loadingSports || loadingTypes}
        >
          {createExercise.isPending ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateExerciseModal;
