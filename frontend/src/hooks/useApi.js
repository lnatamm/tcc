import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  teamService, 
  athleteService, 
  enrollmentService,
  coachService,
  sportService,
  routineService,
  exerciseService,
  typeExerciseService,
  physicalTestService,
  eventService
} from '../services/apiService';

import { useAuth } from '../context/AuthContext';

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

export const useAthletes = (enabled = true) => {
  return useQuery({
    queryKey: ['athletes'],
    queryFn: athleteService.getAll,
    enabled,
  });
};

export const useAthleteByUserId = (userId) => {
  return useQuery({
    queryKey: ['athlete', 'by-user', userId],
    queryFn: () => athleteService.getByUserId(userId),
    enabled: !!userId,
    retry: false,
  });
};

export const useMyAthlete = () => {
  const { user } = useAuth();
  const isAthlete = String(user?.user_type_name || '').trim().toLowerCase() === 'athlete';
  return useAthleteByUserId(isAthlete ? user?.id : null);
};

export const useAthlete = (id) => {
  return useQuery({
    queryKey: ['athlete', id],
    queryFn: () => athleteService.getById(id),
    enabled: !!id,
  });
};

export const useAthleteTeams = (athleteId) => {
  return useQuery({
    queryKey: ['athlete', athleteId, 'teams'],
    queryFn: () => athleteService.getTeams(athleteId),
    enabled: !!athleteId,
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

// ============= EXERCISES =============

export const useExercises = () => {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: exerciseService.getAll,
  });
};

export const useExercise = (id) => {
  return useQuery({
    queryKey: ['exercise', id],
    queryFn: () => exerciseService.getById(id),
    enabled: !!id,
  });
};

export const useExercisesByTeam = (teamId) => {
  return useQuery({
    queryKey: ['exercises', 'team', teamId],
    queryFn: () => exerciseService.getByTeam(teamId),
    enabled: !!teamId,
  });
};

export const useExercisesByAthlete = (athleteId) => {
  return useQuery({
    queryKey: ['exercises', 'athlete', athleteId],
    queryFn: () => exerciseService.getByAthlete(athleteId),
    enabled: !!athleteId,
  });
};

export const useCreateExercise = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: exerciseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
};

export const useUpdateExercise = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => exerciseService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      queryClient.invalidateQueries({ queryKey: ['exercise', variables.id] });
    },
  });
};

export const useDeleteExercise = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: exerciseService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
};

// ============= ROUTINES =============

export const useRoutines = () => {
  return useQuery({
    queryKey: ['routines'],
    queryFn: routineService.getAll,
  });
};

export const useRoutine = (id) => {
  return useQuery({
    queryKey: ['routine', id],
    queryFn: () => routineService.getById(id),
    enabled: !!id,
  });
};

export const useRoutinesByAthlete = (athleteId) => {
  return useQuery({
    queryKey: ['routines', 'athlete', athleteId],
    queryFn: () => routineService.getByAthlete(athleteId),
    enabled: !!athleteId,
  });
};

export const useRoutineExercisesByAthlete = (athleteId) => {
  const routinesQuery = useRoutinesByAthlete(athleteId);
  const routines = routinesQuery.data || [];

  const routineExercisesQueries = useQueries({
    queries: routines.map((routine) => ({
      queryKey: ['routine-exercises', routine.id],
      queryFn: () => routineService.getExercises(routine.id),
      enabled: !!routine?.id,
    })),
  });

  const isLoading = routinesQuery.isLoading || routineExercisesQueries.some((q) => q.isLoading);
  const error = routinesQuery.error || routineExercisesQueries.find((q) => q.error)?.error;

  const routineExercises = routineExercisesQueries.flatMap((q) => q.data || []);

  return {
    routines: routinesQuery.data || [],
    routineExercises,
    isLoading,
    error,
  };
};

export const useRoutineWithExercises = (routineId) => {
  const { data: routine, ...routineQuery } = useRoutine(routineId);
  
  return useQuery({
    queryKey: ['routine-with-exercises', routineId],
    queryFn: async () => {
      if (!routine) return null;
      
      const exercises = await routineService.getExercises(routineId);
      return { ...routine, exercises };
    },
    enabled: !!routine,
    ...routineQuery,
  });
};

export const useRoutineExercises = (routineId) => {
  return useQuery({
    queryKey: ['routine-exercises', routineId],
    queryFn: () => routineService.getExercises(routineId),
    enabled: !!routineId,
  });
};

export const useCreateRoutine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: routineService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });
};

export const useUpdateRoutine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => routineService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      queryClient.invalidateQueries({ queryKey: ['routine', variables.id] });
    },
  });
};

export const useDeleteRoutine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: routineService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });
};

// ============= PHYSICAL TESTS =============

export const usePhysicalTestsByAthlete = (athleteId) => {
  return useQuery({
    queryKey: ['physical-tests', 'athlete', athleteId],
    queryFn: () => physicalTestService.getByAthlete(athleteId),
    enabled: !!athleteId,
  });
};

export const usePhysicalTestExercises = (physicalTestId) => {
  return useQuery({
    queryKey: ['physical-tests', physicalTestId, 'exercises'],
    queryFn: () => physicalTestService.getExercises(physicalTestId),
    enabled: !!physicalTestId,
  });
};

export const useSchedulePhysicalTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: physicalTestService.schedule,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['physical-tests', 'athlete', variables.id_athlete] });
    },
  });
};

export const useAddExercisesToPhysicalTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ physicalTestId, payload }) => physicalTestService.addExercises(physicalTestId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['physical-tests', variables.physicalTestId, 'exercises'] });
    },
  });
};

export const useDeletePhysicalTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ physicalTestId, athleteId }) => physicalTestService.delete(physicalTestId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['physical-tests', 'athlete', variables.athleteId] });
    },
  });
};

// ============= EVENTS =============

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: eventService.getAll,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => eventService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useAddExerciseToRoutine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: routineService.addExercise,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routine-exercises', variables.id_routine] });
      queryClient.invalidateQueries({ queryKey: ['routine-with-exercises', variables.id_routine] });
    },
  });
};

export const useRemoveExerciseFromRoutine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: routineService.removeExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routine-exercises'] });
      queryClient.invalidateQueries({ queryKey: ['routine-with-exercises'] });
    },
  });
};

// ============= TYPE EXERCISES =============

export const useTypeExercises = () => {
  return useQuery({
    queryKey: ['type-exercises'],
    queryFn: typeExerciseService.getAll,
  });
};

export const useTypeExercise = (id) => {
  return useQuery({
    queryKey: ['type-exercise', id],
    queryFn: () => typeExerciseService.getById(id),
    enabled: !!id,
  });
};

// ============= EXERCISE STATS =============

export const useTodayExercises = (athleteId) => {
  return useQuery({
    queryKey: ['today-exercises', athleteId],
    queryFn: async () => {
      const response = await fetch(`/api/exercise-stats/today/${athleteId}`);
      if (!response.ok) throw new Error('Failed to fetch today exercises');
      return response.json();
    },
    enabled: !!athleteId,
    refetchInterval: 2000, // Refetch every 2 seconds for real-time updates
  });
};

export const useStartExercise = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const response = await fetch('/api/exercise-stats/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to start exercise');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-exercises'] });
      queryClient.refetchQueries({ queryKey: ['today-exercises'] });
    },
  });
};

export const useUpdateExerciseProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ exerciseStatsId, data }) => {
      const response = await fetch(`/api/exercise-stats/${exerciseStatsId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update exercise progress');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-exercises'] });
    },
  });
};

export const useEndExercise = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ exerciseHistoryId, data }) => {
      const response = await fetch(`/api/exercise-stats/history/${exerciseHistoryId}/end`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to end exercise');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-exercises'] });
      queryClient.refetchQueries({ queryKey: ['today-exercises'] });
    },
  });
};
