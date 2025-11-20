from integrations.supabase_integration import SupabaseIntegration
from models.enrollment_models import *

class EnrollmentController:
    def __init__(self):
        self.supabase_integration = SupabaseIntegration()
    
    def get_all_enrollments(self):
        """Returns all enrollments"""
        return self.supabase_integration.get_all_enrollments()
    
    def get_enrollment_by_id(self, enrollment_id: int):
        """Returns an enrollment by ID"""
        return self.supabase_integration.get_enrollment_by_id(enrollment_id)
    
    def get_enrollments_by_team(self, team_id: int):
        """Returns all enrollments of a team"""
        return self.supabase_integration.get_enrollments_by_team_id(team_id)
    
    def get_enrollments_by_athlete(self, athlete_id: int):
        """Returns all enrollments of an athlete"""
        return self.supabase_integration.get_enrollments_by_athlete_id(athlete_id)
    
    def create_enrollment(self, payload: EnrollmentCreate):
        """Creates a new enrollment"""
        return self.supabase_integration.create_enrollment(payload)
    
    def update_enrollment(self, enrollment_id: int, payload: EnrollmentUpdate):
        """Updates an enrollment"""
        return self.supabase_integration.update_enrollment(enrollment_id, payload)
    
    def delete_enrollment(self, enrollment_id: int):
        """Deletes an enrollment"""
        return self.supabase_integration.delete_enrollment(enrollment_id)