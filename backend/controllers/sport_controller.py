from integrations.supabase_integration import SupabaseIntegration
from utils.s3 import S3Client
from models.sport_models import *

class SportController:
    def __init__(self):
        self.supabase_integration = SupabaseIntegration()
        self.s3 = S3Client()
    
    def get_all_sports(self):
        """Returns all sports"""
        return self.supabase_integration.get_all_sports()
    
    def get_sport_by_id(self, sport_id: int):
        """Returns a sport by ID"""
        return self.supabase_integration.get_sport_by_id(sport_id)
    
    def get_sport_photo(self, sport_id: int):
        """Returns the photo bytes of a sport by ID"""
        photo_path = self.supabase_integration.get_sport_photo_path_by_id(sport_id)
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
    
    def create_sport(self, payload: SportCreate):
        """Creates a new sport"""
        return self.supabase_integration.create_sport(payload)
    
    def update_sport(self, sport_id: int, payload: SportUpdate):
        """Updates a sport"""
        return self.supabase_integration.update_sport(sport_id, payload)
    
    def delete_sport(self, sport_id: int):
        """Deletes a sport"""
        return self.supabase_integration.delete_sport(sport_id)