from integrations.supabase_integration import SupabaseIntegration
from utils.s3 import S3Client
from models.athlete_models import *

class AthleteController:
    def __init__(self):
        self.supabase_integration = SupabaseIntegration()
        self.s3 = S3Client()
    
    def get_all_athletes(self):
        """Returns all athletes"""
        return self.supabase_integration.get_all_athletes()
    
    def get_athlete_by_id(self, athlete_id: int):
        """Returns an athlete by ID"""
        return self.supabase_integration.get_athlete_by_id(athlete_id)
    
    def get_athlete_photo(self, athlete_id: int):
        """Returns the photo bytes of an athlete by ID"""
        photo_path = self.supabase_integration.get_athlete_photo_path_by_id(athlete_id)
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
    
    def create_athlete(self, payload: AthleteCreate):
        """Creates a new athlete"""
        return self.supabase_integration.create_athlete(payload)
    
    def update_athlete(self, athlete_id: int, payload: AthleteUpdate):
        """Updates an athlete"""
        return self.supabase_integration.update_athlete(athlete_id, payload)
    
    def delete_athlete(self, athlete_id: int):
        """Deletes an athlete"""
        return self.supabase_integration.delete_athlete(athlete_id)
    
    def get_teams_by_athlete_id(self, athlete_id: int):
        """Returns all teams of the athlete by athlete ID"""
        return self.supabase_integration.get_teams_by_athlete_id(athlete_id)