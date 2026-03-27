import React, { useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';

const ExerciseVideoPlayer = ({ exerciseId }) => {
  const [loadError, setLoadError] = useState(false);

  const src = useMemo(() => {
    if (!exerciseId) return null;
    return `/api/exercises/${exerciseId}/video`;
  }, [exerciseId]);

  if (!src) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>
        Video
      </Typography>

      <Box
        component="video"
        controls
        preload="metadata"
        src={src}
        onError={() => setLoadError(true)}
        sx={{
          width: '100%',
          borderRadius: 1,
          backgroundColor: 'common.black',
        }}
      />

      {loadError && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.75 }}>
          Unable to load this video.
        </Typography>
      )}
    </Box>
  );
};

export default ExerciseVideoPlayer;
