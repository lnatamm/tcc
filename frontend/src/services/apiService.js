import api from '../api';

// Turmas
export const turmaService = {
  getAll: async () => {
    const response = await api.get('/turmas/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/turmas/${id}`);
    return response.data;
  },

  getByTreinador: async (treinadorId) => {
    const response = await api.get(`/turmas/treinador/${treinadorId}`);
    return response.data;
  },

  getAtletas: async (turmaId) => {
    const response = await api.get(`/turmas/${turmaId}/atletas`);
    return response.data;
  },

  create: async (turmaData) => {
    const response = await api.post('/turmas/', turmaData);
    return response.data;
  },

  update: async (id, turmaData) => {
    const response = await api.put(`/turmas/${id}`, turmaData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/turmas/${id}`);
    return response.data;
  },
};

// Atletas
export const atletaService = {
  getAll: async () => {
    const response = await api.get('/atletas/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/atletas/${id}`);
    return response.data;
  },

  getTurmas: async (atletaId) => {
    const response = await api.get(`/atletas/${atletaId}/turmas`);
    return response.data;
  },

  create: async (atletaData) => {
    const response = await api.post('/atletas/', atletaData);
    return response.data;
  },

  update: async (id, atletaData) => {
    const response = await api.put(`/atletas/${id}`, atletaData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/atletas/${id}`);
    return response.data;
  },
};

// Matrículas
export const matriculaService = {
  getAll: async () => {
    const response = await api.get('/matriculas/');
    return response.data;
  },

  getByTurma: async (turmaId) => {
    const response = await api.get(`/matriculas/turma/${turmaId}`);
    return response.data;
  },

  getByAtleta: async (atletaId) => {
    const response = await api.get(`/matriculas/atleta/${atletaId}`);
    return response.data;
  },

  create: async (matriculaData) => {
    const response = await api.post('/matriculas/', matriculaData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/matriculas/${id}`);
    return response.data;
  },
};
