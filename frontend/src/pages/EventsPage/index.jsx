import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Typography,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';

import { useEvents } from '../../hooks/useApi';
import AddEventModal from '../../components/AddEventModal';

const formatDate = (dateIso) => {
  if (!dateIso) return 'Sem data';
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return 'Sem data';
  return d.toLocaleDateString('pt-BR');
};

const EventsPage = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: events = [], isLoading, error } = useEvents();

  return (
    <Container maxWidth="md" sx={{ py: 4, pt: 12 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EventIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="700">
                Eventos
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Crie eventos e vincule turmas
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
          >
            Criar Evento
          </Button>
        </Box>
      </Paper>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro ao carregar eventos: {error.message}
        </Alert>
      )}

      {!isLoading && !error && events.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            border: '2px dashed',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" color="text.secondary" fontWeight="500">
            Nenhum evento criado
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Clique em "Criar Evento" para cadastrar o primeiro.
          </Typography>
        </Paper>
      )}

      {!isLoading && !error && events.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent>
                <Typography variant="h6" fontWeight="700">
                  {event.name}
                </Typography>

                {event.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {event.description}
                  </Typography>
                )}

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                  Data: {formatDate(event.start_date)}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                  {(event.teams || []).map((team) => (
                    <Chip key={`${event.id}-${team.id}`} size="small" label={team.name} />
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <AddEventModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </Container>
  );
};

export default EventsPage;
