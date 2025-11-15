import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { turmaService, atletaService, matriculaService } from '../services/apiService';

// ============= TURMAS =============

export const useTurmas = () => {
  return useQuery({
    queryKey: ['turmas'],
    queryFn: turmaService.getAll,
  });
};

export const useTurma = (id) => {
  return useQuery({
    queryKey: ['turma', id],
    queryFn: () => turmaService.getById(id),
    enabled: !!id,
  });
};

export const useTurmasByTreinador = (treinadorId) => {
  return useQuery({
    queryKey: ['turmas', 'treinador', treinadorId],
    queryFn: () => turmaService.getByTreinador(treinadorId),
    enabled: !!treinadorId,
  });
};

export const useTurmasComAtletas = () => {
  const { data: turmas, ...queryInfo } = useTurmas();
  
  return useQuery({
    queryKey: ['turmas-com-atletas'],
    queryFn: async () => {
      if (!turmas) return [];
      
      const turmasComAtletas = await Promise.all(
        turmas.map(async (turma) => {
          try {
            const matriculas = await matriculaService.getByTurma(turma.id);
            const atletas = matriculas.map(m => m.atleta).filter(Boolean);
            return { ...turma, atletas };
          } catch (err) {
            console.error(`Erro ao carregar atletas da turma ${turma.id}:`, err);
            return { ...turma, atletas: [] };
          }
        })
      );
      
      return turmasComAtletas;
    },
    enabled: !!turmas,
    ...queryInfo,
  });
};

export const useCreateTurma = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: turmaService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
    },
  });
};

export const useUpdateTurma = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => turmaService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      queryClient.invalidateQueries({ queryKey: ['turma', variables.id] });
    },
  });
};

export const useDeleteTurma = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: turmaService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
    },
  });
};

// ============= ATLETAS =============

export const useAtletas = () => {
  return useQuery({
    queryKey: ['atletas'],
    queryFn: atletaService.getAll,
  });
};

export const useAtleta = (id) => {
  return useQuery({
    queryKey: ['atleta', id],
    queryFn: () => atletaService.getById(id),
    enabled: !!id,
  });
};

export const useCreateAtleta = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: atletaService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atletas'] });
    },
  });
};

export const useUpdateAtleta = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => atletaService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['atletas'] });
      queryClient.invalidateQueries({ queryKey: ['atleta', variables.id] });
    },
  });
};

export const useDeleteAtleta = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: atletaService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atletas'] });
    },
  });
};

// ============= MATRÍCULAS =============

export const useMatriculas = () => {
  return useQuery({
    queryKey: ['matriculas'],
    queryFn: matriculaService.getAll,
  });
};

export const useMatriculasByTurma = (turmaId) => {
  return useQuery({
    queryKey: ['matriculas', 'turma', turmaId],
    queryFn: () => matriculaService.getByTurma(turmaId),
    enabled: !!turmaId,
  });
};

export const useMatriculasByAtleta = (atletaId) => {
  return useQuery({
    queryKey: ['matriculas', 'atleta', atletaId],
    queryFn: () => matriculaService.getByAtleta(atletaId),
    enabled: !!atletaId,
  });
};

export const useCreateMatricula = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: matriculaService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      queryClient.invalidateQueries({ queryKey: ['turmas-com-atletas'] });
    },
  });
};

export const useDeleteMatricula = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: matriculaService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      queryClient.invalidateQueries({ queryKey: ['turmas-com-atletas'] });
    },
  });
};
