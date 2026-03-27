from integrations.supabase_integration import SupabaseIntegration
from utils.s3 import S3Client
from models.exercise_models import *
from fastapi import UploadFile

class ExerciseController:
    def __init__(self):
        self.supabase_integration = SupabaseIntegration()
        self.s3 = S3Client()
    
    def get_all_exercises(self):
        """Returns all exercises"""
        return self.supabase_integration.get_all_exercises()
    
    def get_exercise_by_id(self, exercise_id: int):
        """Returns an exercise by ID"""
        return self.supabase_integration.get_exercise_by_id(exercise_id)
    
    def get_exercises_by_team(self, team_id: int):
        """Returns all exercises of a team"""
        return self.supabase_integration.get_exercises_by_team_id(team_id)
    
    def get_exercises_by_athlete(self, athlete_id: int):
        """Returns all exercises of an athlete"""
        return self.supabase_integration.get_exercises_by_athlete_id(athlete_id)
    
    def get_exercise_photo(self, exercise_id: int):
        """Returns the photo bytes of an exercise by ID"""
        photo_path = self.supabase_integration.get_exercise_photo_path_by_id(exercise_id)
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
    
    def get_exercise_video(self, exercise_id: int):
        """Returns the video bytes of an exercise by ID"""
        video_path = self.supabase_integration.get_exercise_video_path_by_id(exercise_id)
        if not video_path:
            return None, None
    
        # Return bytes of the video
        file_bytes = self.s3.get_file('videos', video_path)
        
        # Determine content type based on extension
        if video_path.lower().endswith('.mp4'):
            content_type = 'video/mp4'
        elif video_path.lower().endswith('.webm'):
            content_type = 'video/webm'
        elif video_path.lower().endswith('.ogg'):
            content_type = 'video/ogg'
        else:
            content_type = 'application/octet-stream'
        
        return file_bytes, content_type

    def upload_exercise_video(self, exercise_id: int, file: UploadFile):
        """Uploads an exercise MP4 video to S3 and updates exercise.video_path."""
        # Keep a predictable key so re-upload replaces the previous file.
        key = f"exercises/{exercise_id}/video.mp4"

        # Ensure stream pointer is at start
        try:
            file.file.seek(0)
        except Exception:
            pass

        ok = self.s3.upload_file('videos', key, file.file, content_type='video/mp4')
        if not ok:
            raise Exception("Failed to upload video to S3")

        return self.supabase_integration.update_exercise_video_path(exercise_id, key)
    
    def create_exercise(self, payload: ExerciseCreate):
        """Creates a new exercise"""
        return self.supabase_integration.create_exercise(payload)
    
    def update_exercise(self, exercise_id: int, payload: ExerciseUpdate):
        """Updates an exercise"""
        return self.supabase_integration.update_exercise(exercise_id, payload)
    
    def delete_exercise(self, exercise_id: int):
        """Deletes an exercise"""
        return self.supabase_integration.delete_exercise(exercise_id)