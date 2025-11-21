from integrations.supabase_integration import SupabaseIntegration

class TypeExerciseController:
    def __init__(self):
        self.supabase_integration = SupabaseIntegration()
    
    def get_all_type_exercises(self):
        """Returns all exercise types"""
        return self.supabase_integration.get_all_type_exercises()
    
    def get_type_exercise_by_id(self, type_id: int):
        """Returns an exercise type by ID"""
        return self.supabase_integration.get_type_exercise_by_id(type_id)
