from integrations.supabase_integration import SupabaseIntegration
from utils.s3 import S3Client
from models.team_models import *

class TeamController:
    def __init__(self):
        self.supabase_integration = SupabaseIntegration()
        self.s3 = S3Client()
    
    def get_all_teams(self):
        """Returns all teams"""
        return self.supabase_integration.get_all_teams()
    
    def get_team_by_id(self, team_id: int):
        """Returns a team by ID"""
        return self.supabase_integration.get_team_by_id(team_id)
    
    def get_teams_by_coach(self, coach_id: int):
        """Returns all teams of a coach"""
        return self.supabase_integration.get_teams_by_coach_id(coach_id)
    
    def get_team_photo(self, team_id: int):
        """Returns the photo bytes of a team by ID"""
        photo_path = self.supabase_integration.get_team_photo_path_by_id(team_id)
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
    
    def create_team(self, payload: TeamCreate):
        """Creates a new team"""
        return self.supabase_integration.create_team(payload)
    
    def update_team(self, team_id: int, payload: TeamUpdate):
        """Updates a team"""
        return self.supabase_integration.update_team(team_id, payload)
    
    def delete_team(self, team_id: int):
        """Deletes a team"""
        return self.supabase_integration.delete_team(team_id)
    
    def get_athletes_by_team_id(self, team_id: int):
        """Returns all athletes enrolled in a team"""
        return self.supabase_integration.get_athletes_by_team_id(team_id)
