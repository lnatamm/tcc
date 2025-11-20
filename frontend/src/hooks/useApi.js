import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  teamService, 
  athleteService, 
  enrollmentService,
  coachService,
  sportService
} from '../services/apiService';

// ============= TEAMS ============

export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: teamService.getAll,
  });
};

export const useTeam = (id) => {
  return useQuery({
    queryKey: ['team', id],
    queryFn: () => teamService.getById(id),
    enabled: !!id,
  });
};

export const useTeamsByCoach = (coachId) => {
  return useQuery({
    queryKey: ['teams', 'coach', coachId],
    queryFn: () => teamService.getByCoach(coachId),
    enabled: !!coachId,
  });
};

export const useTeamsWithAthletes = () => {
  const { data: teams, ...queryInfo } = useTeams();
  
  return useQuery({
    queryKey: ['teams-with-athletes'],
    queryFn: async () => {
      if (!teams) return [];
      
      const teamsWithAthletes = await Promise.all(
        teams.map(async (team) => {
          try {
            const enrollments = await enrollmentService.getByTeam(team.id);
            const athletes = enrollments.map(m => m.athlete).filter(Boolean);
            return { ...team, athletes };
          } catch (err) {
            console.error(`Error to load athletes of team ${team.id}:`, err);
            return { ...team, athletes: [] };
          }
        })
      );
      
      return teamsWithAthletes;
    },
    enabled: !!teams,
    ...queryInfo,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: teamService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => teamService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team', variables.id] });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: teamService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

// ============= ATHLETES =============

export const useAthletes = () => {
  return useQuery({
    queryKey: ['athletes'],
    queryFn: athleteService.getAll,
  });
};

export const useAthlete = (id) => {
  return useQuery({
    queryKey: ['athlete', id],
    queryFn: () => athleteService.getById(id),
    enabled: !!id,
  });
};

export const useCreateAthlete = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: athleteService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
    },
  });
};

export const useUpdateAthlete = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => athleteService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      queryClient.invalidateQueries({ queryKey: ['athlete', variables.id] });
    },
  });
};

export const useDeleteAthlete = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: athleteService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
    },
  });
};

// ============= ENROLLMENTS =============

export const useEnrollments = () => {
  return useQuery({
    queryKey: ['enrollments'],
    queryFn: enrollmentService.getAll,
  });
};

export const useEnrollmentsByTeam = (teamId) => {
  return useQuery({
    queryKey: ['enrollments', 'team', teamId],
    queryFn: () => enrollmentService.getByTeam(teamId),
    enabled: !!teamId,
  });
};

export const useEnrollmentsByAthlete = (athleteId) => {
  return useQuery({
    queryKey: ['enrollments', 'athlete', athleteId],
    queryFn: () => enrollmentService.getByAthlete(athleteId),
    enabled: !!athleteId,
  });
};

export const useCreateEnrollment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: enrollmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['teams-with-athletes'] });
    },
  });
};

export const useDeleteEnrollment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: enrollmentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['teams-with-athletes'] });
    },
  });
};

// ============= COACHES =============

export const useCoaches = () => {
  return useQuery({
    queryKey: ['coaches'],
    queryFn: coachService.getAll,
  });
};

export const useCoach = (id) => {
  return useQuery({
    queryKey: ['coach', id],
    queryFn: () => coachService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCoach = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: coachService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaches'] });
    },
  });
};

export const useUpdateCoach = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => coachService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['coaches'] });
      queryClient.invalidateQueries({ queryKey: ['coach', variables.id] });
    },
  });
};

export const useDeleteCoach = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: coachService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaches'] });
    },
  });
};

// ============= SPORTS =============

export const useSports = () => {
  return useQuery({
    queryKey: ['sports'],
    queryFn: sportService.getAll,
  });
};

export const useSport = (id) => {
  return useQuery({
    queryKey: ['sport', id],
    queryFn: () => sportService.getById(id),
    enabled: !!id,
  });
};

export const useCreateSport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sportService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports'] });
    },
  });
};

export const useUpdateSport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => sportService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sports'] });
      queryClient.invalidateQueries({ queryKey: ['sport', variables.id] });
    },
  });
};

export const useDeleteSport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sportService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports'] });
    },
  });
};
