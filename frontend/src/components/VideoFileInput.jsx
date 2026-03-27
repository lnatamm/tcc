import React, { useId, useMemo, useRef, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
};

const VideoFileInput = ({
  value,
  onChange,
  maxBytes = 200 * 1024 * 1024,
  label = 'Exercise Video (MP4)',
}) => {
  const inputId = useId();
  const inputRef = useRef(null);
  const [error, setError] = useState(null);

  const infoText = useMemo(() => {
    if (!value) return null;
    return `${value.name} • ${formatBytes(value.size)}`;
  }, [value]);

  const validateFile = (file) => {
    if (!file) return 'Video file is required';

    const nameOk = (file.name || '').toLowerCase().endsWith('.mp4');
    const typeOk = !file.type || file.type === 'video/mp4';

    if (!nameOk || !typeOk) {
      return 'Only MP4 videos are supported';
    }

    if (file.size > maxBytes) {
      return `Video too large (max ${formatBytes(maxBytes)})`;
    }

    return null;
  };

  const handleSelectClick = () => {
    if (inputRef.current) inputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    const validationError = file ? validateFile(file) : null;

    if (validationError) {
      setError(validationError);
      onChange?.(null);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setError(null);
    onChange?.(file);
  };

  const handleRemove = () => {
    setError(null);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        {label}
      </Typography>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="video/mp4"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={handleSelectClick}>
          {value ? 'Change video' : 'Select MP4'}
        </Button>

        {value && (
          <Button variant="text" color="error" onClick={handleRemove}>
            Remove
          </Button>
        )}

        <Typography variant="body2" color="text.secondary">
          {infoText || `Max ${formatBytes(maxBytes)}`}
        </Typography>
      </Box>

      {error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.75 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default VideoFileInput;
