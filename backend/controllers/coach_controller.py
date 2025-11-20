from integrations.supabase_integration import SupabaseIntegration
from utils.s3 import S3Client
from models.coach_models import *

class CoachController:
    def __init__(self):
        self.supabase_integration = SupabaseIntegration()
        self.s3 = S3Client()
    
    def get_all_coaches(self):
        """Returns all coaches"""
        return self.supabase_integration.get_all_coaches()
    
    def get_coach_by_id(self, coach_id: int):
        """Returns a coach by ID"""
        return self.supabase_integration.get_coach_by_id(coach_id)
    
    def get_coach_photo(self, coach_id: int):
        """Returns the photo bytes of a coach by ID"""
        photo_path = self.supabase_integration.get_coach_photo_path_by_id(coach_id)
        if not photo_path:
            return None, None
    
        # Return bytes of the image
        file_bytes = self.s3.get_file('photos', photo_path)
        
        # Determine content type based on extension
        if photo_path.lower().endswith('.png'):
            content_type = 'image/png'
        elif photo_path.lower().endswith(('.jpg', '.jpeg')):
            content_type = 'image/jpeg'
        elif photo_path.lower().endswith('.gif'):
            content_type = 'image/gif'
        elif photo_path.lower().endswith('.webp'):
            content_type = 'image/webp'
        else:
            content_type = 'application/octet-stream'
        
        return file_bytes, content_type
    
    def create_coach(self, payload: CoachCreate):
        """Creates a new coach"""
        return self.supabase_integration.create_coach(payload)
    
    def update_coach(self, coach_id: int, payload: CoachUpdate):
        """Updates a coach"""
        return self.supabase_integration.update_coach(coach_id, payload)
    
    def delete_coach(self, coach_id: int):
        """Deletes a coach"""
        return self.supabase_integration.delete_coach(coach_id)
    
    def get_teams_by_coach_id(self, coach_id: int):
        """Returns all teams of the coach by coach ID"""
        return self.supabase_integration.get_teams_by_coach_id(coach_id)