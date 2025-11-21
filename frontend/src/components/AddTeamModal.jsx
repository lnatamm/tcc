import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useCreateTeam } from '../hooks/useApi';
import CoachSelector from './CoachSelector';
import SportSelector from './SportSelector';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const AddTeamModal = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    nome: '',
    id_treinador: '',
    id_esporte: '',
    foto_path: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const createTeam = useCreateTeam();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCoachChange = (value) => {
    setFormData(prev => ({
      ...prev,
      id_treinador: value
    }));
  };

  const handleSportChange = (value) => {
    setFormData(prev => ({
      ...prev,
      id_esporte: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Por enquanto, vamos apenas salvar o nome do arquivo
      // A implementação completa de upload será feita depois
      setFormData(prev => ({
        ...prev,
        foto_path: `/images/turmas/${file.name}`
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    createTeam.mutate({
      nome: formData.nome,
      id_treinador: parseInt(formData.id_treinador),
      id_esporte: parseInt(formData.id_esporte),
      foto_path: formData.foto_path || '/images/default-turma.jpg',
    }, {
      onSuccess: () => {
        // Resetar formulário
        setFormData({
          nome: '',
          id_treinador: '',
          id_esporte: '',
          foto_path: '',
        });
        setSelectedFile(null);
        onClose();
      },
    });
  };

  const handleClose = () => {
    if (!createTeam.isPending) {
      setFormData({
        nome: '',
        id_treinador: '',
        id_esporte: '',
        foto_path: '',
      });
      setSelectedFile(null);
      createTeam.reset();
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Add New Team</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {createTeam.isError && (
              <Alert severity="error">
                Error creating team: {createTeam.error?.message || 'Please try again'}
              </Alert>
            )}

            <TextField
              label="Team Name"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              fullWidth
              disabled={createTeam.isPending}
              autoFocus
            />

            <CoachSelector
              value={formData.id_treinador}
              onChange={handleCoachChange}
              disabled={createTeam.isPending}
            />

            <SportSelector
              value={formData.id_esporte}
              onChange={handleSportChange}
              disabled={createTeam.isPending}
            />

            <Box>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                disabled={createTeam.isPending}
                fullWidth
                sx={{ py: 1.5 }}
              >
                {selectedFile ? selectedFile.name : 'Select Team Photo (PNG)'}
                <input
                  type="file"
                  hidden
                  accept=".png"
                  onChange={handleFileChange}
                />
              </Button>
              {selectedFile && (
                <Box sx={{ mt: 1, textAlign: 'center' }}>
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleClose}
            disabled={createTeam.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="contained"
            disabled={createTeam.isPending}
            startIcon={createTeam.isPending && <CircularProgress size={20} />}
          >
            {createTeam.isPending ? 'Creating...' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddTeamModal;
