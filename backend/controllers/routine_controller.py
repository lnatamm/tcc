from integrations.supabase_integration import SupabaseIntegration
from models.routine_models import *

class RoutineController:
    def __init__(self):
        self.supabase_integration = SupabaseIntegration()
    
    def get_all_routines(self):
        """Returns all routines"""
        return self.supabase_integration.get_all_routines()
    
    def get_routine_by_id(self, routine_id: int):
        """Returns a routine by ID"""
        return self.supabase_integration.get_routine_by_id(routine_id)
    
    def get_routines_by_athlete(self, athlete_id: int):
        """Returns all routines of an athlete"""
        return self.supabase_integration.get_routines_by_athlete_id(athlete_id)
    
    def get_exercises_by_routine(self, routine_id: int):
        """Returns all exercises in a routine with their schedule"""
        return self.supabase_integration.get_exercises_by_routine_id(routine_id)
    
    def create_routine(self, payload: RoutineCreate):
        """Creates a new routine"""
        return self.supabase_integration.create_routine(payload)
    
    def update_routine(self, routine_id: int, payload: RoutineUpdate):
        """Updates a routine"""
        return self.supabase_integration.update_routine(routine_id, payload)
    
    def delete_routine(self, routine_id: int):
        """Deletes a routine"""
        return self.supabase_integration.delete_routine(routine_id)
    
    def add_exercise_to_routine(self, payload: RoutineHasExerciseCreate):
        """Adds an exercise to a routine"""
        return self.supabase_integration.add_exercise_to_routine(payload)
    
    def remove_exercise_from_routine(self, routine_exercise_id: int):
        """Removes an exercise from a routine"""
        return self.supabase_integration.remove_exercise_from_routine(routine_exercise_id)
    
    def add_excluded_date(self, payload: ExcludedDateCreate):
        """Adds an excluded date to a routine exercise"""
        return self.supabase_integration.add_excluded_date(payload)
    
    def get_excluded_dates(self, routine_exercise_id: int):
        """Returns all excluded dates for a routine exercise"""
        return self.supabase_integration.get_excluded_dates(routine_exercise_id)
    
    def delete_excluded_date(self, excluded_date_id: int):
        """Deletes an excluded date"""
        return self.supabase_integration.delete_excluded_date(excluded_date_id)
