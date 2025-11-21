import api from '../api';

// Teams
export const teamService = {
  getAll: async () => {
    const response = await api.get('/teams/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  getByCoach: async (coachId) => {
    const response = await api.get(`/teams/coach/${coachId}`);
    return response.data;
  },

  getPhoto: async (id) => {
    const response = await api.get(`/teams/${id}/photo`);
    return response.data;
  },

  getAthletes: async (teamId) => {
    const response = await api.get(`/teams/${teamId}/athletes`);
    return response.data;
  },

  create: async (teamData) => {
    const response = await api.post('/teams/', teamData);
    return response.data;
  },

  update: async (id, teamData) => {
    const response = await api.put(`/teams/${id}`, teamData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/teams/${id}`);
    return response.data;
  },
};

// Athletes
export const athleteService = {
  getAll: async () => {
    const response = await api.get('/athletes/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/athletes/${id}`);
    return response.data;
  },

  getPhoto: async (id) => {
    const response = await api.get(`/athletes/${id}/photo`);
    return response.data;
  },

  getTeams: async (athleteId) => {
    const response = await api.get(`/athletes/${athleteId}/teams`);
    return response.data;
  },

  create: async (athleteData) => {
    const response = await api.post('/athletes/', athleteData);
    return response.data;
  },

  update: async (id, athleteData) => {
    const response = await api.put(`/athletes/${id}`, athleteData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/athletes/${id}`);
    return response.data;
  },
};

// Enrollments
export const enrollmentService = {
  getAll: async () => {
    const response = await api.get('/enrollments/');
    return response.data;
  },

  getByTeam: async (teamId) => {
    const response = await api.get(`/enrollments/team/${teamId}`);
    return response.data;
  },

  getByAthlete: async (athleteId) => {
    const response = await api.get(`/enrollments/athlete/${athleteId}`);
    return response.data;
  },

  create: async (enrollmentData) => {
    const response = await api.post('/enrollments/', enrollmentData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/enrollments/${id}`);
    return response.data;
  },
};

// Coaches
export const coachService = {
  getAll: async () => {
    const response = await api.get('/coaches/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/coaches/${id}`);
    return response.data;
  },

  getPhoto: async (id) => {
    const response = await api.get(`/coaches/${id}/photo`);
    return response.data;
  },

  getTeams: async (coachId) => {
    const response = await api.get(`/coaches/${coachId}/teams`);
    return response.data;
  },

  create: async (coachData) => {
    const response = await api.post('/coaches/', coachData);
    return response.data;
  },

  update: async (id, coachData) => {
    const response = await api.put(`/coaches/${id}`, coachData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/coaches/${id}`);
    return response.data;
  },
};

// Sports
export const sportService = {
  getAll: async () => {
    const response = await api.get('/sports/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/sports/${id}`);
    return response.data;
  },

  getPhoto: async (id) => {
    const response = await api.get(`/sports/${id}/photo`);
    return response.data;
  },

  create: async (sportData) => {
    const response = await api.post('/sports/', sportData);
    return response.data;
  },

  update: async (id, sportData) => {
    const response = await api.put(`/sports/${id}`, sportData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/sports/${id}`);
    return response.data;
  },
};

// Exercises
export const exerciseService = {
  getAll: async () => {
    const response = await api.get('/exercises/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/exercises/${id}`);
    return response.data;
  },

  getByTeam: async (teamId) => {
    const response = await api.get(`/exercises/team/${teamId}`);
    return response.data;
  },

  getByAthlete: async (athleteId) => {
    const response = await api.get(`/exercises/athlete/${athleteId}`);
    return response.data;
  },

  getPhoto: async (id) => {
    const response = await api.get(`/exercises/${id}/photo`);
    return response.data;
  },

  getVideo: async (id) => {
    const response = await api.get(`/exercises/${id}/video`);
    return response.data;
  },

  create: async (exerciseData) => {
    const { created_by, ...data } = exerciseData;
    const response = await api.post('/exercises/', data, {
      params: { user: created_by }
    });
    return response.data;
  },

  update: async (id, exerciseData) => {
    const response = await api.put(`/exercises/${id}`, exerciseData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/exercises/${id}`);
    return response.data;
  },
};

// Routines
export const routineService = {
  getAll: async () => {
    const response = await api.get('/routines/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/routines/${id}`);
    return response.data;
  },

  getByAthlete: async (athleteId) => {
    const response = await api.get(`/routines/athlete/${athleteId}`);
    return response.data;
  },

  getExercises: async (routineId) => {
    const response = await api.get(`/routines/${routineId}/exercises`);
    return response.data;
  },

  create: async (routineData) => {
    const { created_by, ...data } = routineData;
    const response = await api.post('/routines/', data, {
      params: { user: created_by }
    });
    return response.data;
  },

  update: async (id, routineData) => {
    const response = await api.put(`/routines/${id}`, routineData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/routines/${id}`);
    return response.data;
  },

  addExercise: async (routineExerciseData) => {
    const { created_by, ...data } = routineExerciseData;
    const response = await api.post(`/routines/${data.id_routine}/exercises`, data, {
      params: { user: created_by }
    });
    return response.data;
  },

  removeExercise: async (routineExerciseId) => {
    const response = await api.delete(`/routines/exercises/${routineExerciseId}`);
    return response.data;
  },
};

// Type Exercises
export const typeExerciseService = {
  getAll: async () => {
    const response = await api.get('/type-exercises/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/type-exercises/${id}`);
    return response.data;
  },
};
