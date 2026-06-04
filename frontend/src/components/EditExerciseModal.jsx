import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';
import { useSports, useTypeExercises, useUpdateExercise } from '../hooks/useApi';
import { exerciseService } from '../services/apiService';
import VideoFileInput from './VideoFileInput';

const buildFormData = (exercise) => ({
  name: exercise?.name || '',
  description: exercise?.description || '',
  reps: exercise?.reps ?? '',
  sets: exercise?.sets ?? '',
  id_sport: exercise?.id_sport ? String(exercise.id_sport) : '',
  id_type: exercise?.id_type ? String(exercise.id_type) : '',
});

const EditExerciseModal = ({ open, onClose, exercise, onSuccess }) => {
  const [formData, setFormData] = useState(buildFormData(exercise));
  const [errors, setErrors] = useState({});
  const [videoFile, setVideoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: sports = [], isLoading: loadingSports } = useSports();
  const { data: typeExercises = [], isLoading: loadingTypes } = useTypeExercises();
  const updateExercise = useUpdateExercise();

  useEffect(() => {
    if (open) {
      setFormData(buildFormData(exercise));
      setErrors({});
      setVideoFile(null);
    }
  }, [exercise, open]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required';
    }
    if (!formData.id_sport) {
      nextErrors.id_sport = 'Sport is required';
    }
    if (!formData.id_type) {
      nextErrors.id_type = 'Exercise type is required';
    }

    return nextErrors;
  };

  const handleCancel = () => {
    setFormData(buildFormData(exercise));
    setErrors({});
    setVideoFile(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!exercise?.id) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        reps: formData.reps ? parseInt(formData.reps, 10) : null,
        sets: formData.sets ? parseInt(formData.sets, 10) : null,
        id_sport: parseInt(formData.id_sport, 10),
        id_type: parseInt(formData.id_type, 10),
        photo_path: exercise.photo_path || null,
        video_path: exercise.video_path || null,
      };

      const updated = await updateExercise.mutateAsync({
        id: exercise.id,
        data: payload,
      });

      let result = updated;
      if (videoFile) {
        result = await exerciseService.uploadVideo(exercise.id, videoFile);
      }

      if (onSuccess) {
        onSuccess(result);
      }
      handleCancel();
    } catch (err) {
      console.error('Failed to update exercise:', err);
      setErrors({ submit: 'Failed to update exercise. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Exercise</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {errors.submit && <Alert severity="error">{errors.submit}</Alert>}

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

          <VideoFileInput value={videoFile} onChange={setVideoFile} maxBytes={200 * 1024 * 1024} />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} disabled={updateExercise.isPending || submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={updateExercise.isPending || submitting || loadingSports || loadingTypes}
        >
          {(updateExercise.isPending || submitting) ? 'Saving...' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditExerciseModal;
