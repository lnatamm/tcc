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
import { useCreateTurma } from '../hooks/useApi';
import TreinadorSelector from './TreinadorSelector';
import EsporteSelector from './EsporteSelector';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const AdicionarTurmaModal = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    nome: '',
    id_treinador: '',
    id_esporte: '',
    foto_path: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const createTurma = useCreateTurma();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTreinadorChange = (value) => {
    setFormData(prev => ({
      ...prev,
      id_treinador: value
    }));
  };

  const handleEsporteChange = (value) => {
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
    
    createTurma.mutate({
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
    if (!createTurma.isPending) {
      setFormData({
        nome: '',
        id_treinador: '',
        id_esporte: '',
        foto_path: '',
      });
      setSelectedFile(null);
      createTurma.reset();
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
      <DialogTitle>Adicionar Nova Turma</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {createTurma.isError && (
              <Alert severity="error">
                Erro ao criar turma: {createTurma.error?.message || 'Tente novamente'}
              </Alert>
            )}

            <TextField
              label="Nome da Turma"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              fullWidth
              disabled={createTurma.isPending}
              autoFocus
            />

            <TreinadorSelector
              value={formData.id_treinador}
              onChange={handleTreinadorChange}
              disabled={createTurma.isPending}
            />

            <EsporteSelector
              value={formData.id_esporte}
              onChange={handleEsporteChange}
              disabled={createTurma.isPending}
            />

            <Box>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                disabled={createTurma.isPending}
                fullWidth
                sx={{ py: 1.5 }}
              >
                {selectedFile ? selectedFile.name : 'Selecionar Foto da Turma (PNG)'}
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
            disabled={createTurma.isPending}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            variant="contained"
            disabled={createTurma.isPending}
            startIcon={createTurma.isPending && <CircularProgress size={20} />}
          >
            {createTurma.isPending ? 'Criando...' : 'Adicionar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AdicionarTurmaModal;
