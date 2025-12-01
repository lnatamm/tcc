import os
from dotenv import load_dotenv
from supabase import create_client
from models.athlete_models import *
from models.coach_models import *
from models.enrollment_models import *
from models.exercise_models import *
from models.sport_models import *
from models.team_models import *
from models.routine_models import *

class SupabaseIntegration:
    def __init__(self):
        # Load environment variables from .env (if present)
        load_dotenv()
        try:
            self.client = create_client(
                os.getenv('SUPABASE_URL'),
                os.getenv('SUPABASE_KEY')
            )
        except Exception as e:
            print("Error creating Supabase client:", e)
            raise e

    def get_client(self):
        return self.client
    
    def get_all_athletes(self):
        """Returns all athletes"""
        return self.client.table('athlete').select('*').order('name').execute()

    def get_athlete_by_id(self, athlete_id: int):
        """Returns an athlete by ID"""
        return self.client.table('athlete').select('*').eq('id', athlete_id).execute()
    
    def get_athlete_photo_path_by_id(self, athlete_id: int):
        """Returns athlete photo bytes by ID"""
        athlete = self.client.table('athlete').select('photo_path').eq('id', athlete_id).execute()
        if not athlete.data or not athlete.data[0].get('photo_path'):
            return None, None
        
        photo_path = athlete.data[0]['photo_path']
        
        return photo_path
    
    def get_teams_by_athlete_id(self, athlete_id: int):
        """Returns all teams of the athlete"""
        return self.client.table('enrollment').select('team(*)').eq('id_athlete', athlete_id).execute()

    def create_athlete(self, athlete: AthleteCreate):
        """Creates a new athlete"""
        data = {
            "name": athlete.name,
            "email": athlete.email,
            "birth_date": athlete.birth_date
        }
        return self.client.table('athlete').insert(data).execute()
    
    def update_athlete(self, athlete_id: int, athlete_update: AthleteUpdate):
        """Updates an athlete"""
        data = {}
        if athlete_update.name is not None:
            data["name"] = athlete_update.name
        if athlete_update.photo_path is not None:
            data["photo_path"] = athlete_update.photo_path
        
        if not data:
            return self.client.table('athlete').select('*').eq('id', athlete_id).execute()
        
        return self.client.table('athlete').update(data).eq('id', athlete_id).execute()
    
    def delete_athlete(self, athlete_id: int):
        """Deletes an athlete"""
        return self.client.table('athlete').delete().eq('id', athlete_id).execute()

    def get_all_coaches(self):
        """Returns all coaches"""
        return self.client.table('coach').select('*').order('name').execute()
    
    def get_coach_by_id(self, coach_id: int):
        """Returns a coach by ID"""
        return self.client.table('coach').select('*').eq('id', coach_id).execute()
    
    def get_coach_photo_path_by_id(self, coach_id: int):
        """Returns coach photo path by ID"""
        coach = self.client.table('coach').select('photo_path').eq('id', coach_id).execute()
        if not coach.data or not coach.data[0].get('photo_path'):
            return None
        
        return coach.data[0]['photo_path']

    def create_coach(self, coach: CoachCreate):
        """Creates a new coach"""
        data = {
            "name": coach.name,
            "id_level": coach.id_level,
            "photo_path": coach.photo_path
        }
        return self.client.table('coach').insert(data).execute()

    def update_coach(self, coach_id: int, coach_update: CoachUpdate):
        """Updates a coach"""
        data = {}
        if coach_update.name is not None:
            data["name"] = coach_update.name
        if coach_update.id_level is not None:
            data["id_level"] = coach_update.id_level
        if coach_update.photo_path is not None:
            data["photo_path"] = coach_update.photo_path
        
        if not data:
            return self.client.table('coach').select('*').eq('id', coach_id).execute()
        
        return self.client.table('coach').update(data).eq('id', coach_id).execute()
    
    def delete_coach(self, coach_id: int):
        """Deletes a coach"""
        return self.client.table('coach').delete().eq('id', coach_id).execute()
    
    def get_teams_by_coach_id(self, coach_id: int):
        """Returns all teams of the coach"""
        return self.client.table('team').select('*').eq('id_coach', coach_id).order('name').execute()

    def get_all_enrollments(self):
        """Returns all enrollments"""
        return self.client.table('enrollment').select('*').execute()
    
    def get_enrollment_by_id(self, enrollment_id: int):
        """Returns an enrollment by ID"""
        return self.client.table('enrollment').select('*').eq('id', enrollment_id).execute()
    
    def get_enrollments_by_team_id(self, team_id: int):
        """Returns all enrollments of a team"""
        return self.client.table('enrollment').select('*, athlete(*)').eq('id_team', team_id).execute()
    
    def get_enrollments_by_athlete_id(self, athlete_id: int):
        """Returns all enrollments of an athlete"""
        return self.client.table('enrollment').select('*, team(*)').eq('id_athlete', athlete_id).execute()

    def create_enrollment(self, enrollment: EnrollmentCreate):
        """Creates a new enrollment"""
        data = {
            "id_team": enrollment.id_team,
            "id_athlete": enrollment.id_athlete
        }
        return self.client.table('enrollment').insert(data).execute()
    
    def update_enrollment(self, enrollment_id: int, enrollment_update: EnrollmentUpdate):
        """Updates an enrollment"""
        data = {}
        if enrollment_update.id_team is not None:
            data["id_team"] = enrollment_update.id_team
        if enrollment_update.id_athlete is not None:
            data["id_athlete"] = enrollment_update.id_athlete
        
        if not data:
            return self.client.table('enrollment').select('*').eq('id', enrollment_id).execute()
        
        return self.client.table('enrollment').update(data).eq('id', enrollment_id).execute()
    
    def delete_enrollment(self, enrollment_id: int):
        """Deletes an enrollment"""
        return self.client.table('enrollment').delete().eq('id', enrollment_id).execute()
    
    def get_all_exercises(self):
        """Returns all exercises"""
        return self.client.table('exercise').select('*').order('name').execute()
    
    def get_exercise_by_id(self, exercise_id: int):
        """Returns an exercise by ID"""
        return self.client.table('exercise').select('*').eq('id', exercise_id).execute()
    
    def get_exercises_by_team_id(self, team_id: int):
        """Returns all exercises of a team"""
        return self.client.table('exercise').select('*').eq('id_team', team_id).order('name').execute()
    
    def get_exercises_by_athlete_id(self, athlete_id: int):
        """Returns all exercises of an athlete"""
        return self.client.table('exercise').select('*').eq('id_athlete', athlete_id).order('name').execute()
    
    def get_exercise_photo_path_by_id(self, exercise_id: int):
        """Returns exercise photo path by ID"""
        exercise = self.client.table('exercise').select('photo_path').eq('id', exercise_id).execute()
        if not exercise.data or not exercise.data[0].get('photo_path'):
            return None
        
        return exercise.data[0]['photo_path']
    
    def get_exercise_video_path_by_id(self, exercise_id: int):
        """Returns exercise video path by ID"""
        exercise = self.client.table('exercise').select('video_path').eq('id', exercise_id).execute()
        if not exercise.data or not exercise.data[0].get('video_path'):
            return None
        
        return exercise.data[0]['video_path']

    def create_exercise(self, exercise: ExerciseCreate):
        """Creates a new exercise"""
        data = {
            "id_type": exercise.id_type,
            "id_sport": exercise.id_sport,
            "name": exercise.name,
            "reps": exercise.reps,
            "sets": exercise.sets,
            "description": exercise.description,
            "video_path": exercise.video_path,
            "photo_path": exercise.photo_path,
            "created_by": exercise.created_by,
            "created_at": exercise.created_at
        }
        return self.client.table('exercise').insert(data).execute()
    
    def update_exercise(self, exercise_id: int, exercise_update: ExerciseUpdate):
        """Updates an exercise"""
        data = {}
        if exercise_update.id_type is not None:
            data["id_type"] = exercise_update.id_type
        if exercise_update.id_sport is not None:
            data["id_sport"] = exercise_update.id_sport
        if exercise_update.name is not None:
            data["name"] = exercise_update.name
        if exercise_update.reps is not None:
            data["reps"] = exercise_update.reps
        if exercise_update.sets is not None:
            data["sets"] = exercise_update.sets
        if exercise_update.description is not None:
            data["description"] = exercise_update.description
        if exercise_update.video_path is not None:
            data["video_path"] = exercise_update.video_path
        if exercise_update.photo_path is not None:
            data["photo_path"] = exercise_update.photo_path

        if not data:
            return self.client.table('exercise').select('*').eq('id', exercise_id).execute()
        
        return self.client.table('exercise').update(data).eq('id', exercise_id).execute()
    
    def delete_exercise(self, exercise_id: int):
        """Deletes an exercise"""
        return self.client.table('exercise').delete().eq('id', exercise_id).execute()

    def get_all_type_exercises(self):
        """Returns all exercise types"""
        return self.client.table('type_exercise').select('*').order('name').execute()
    
    def get_type_exercise_by_id(self, type_id: int):
        """Returns an exercise type by ID"""
        return self.client.table('type_exercise').select('*').eq('id', type_id).execute()

    def get_all_sports(self):
        """Returns all sports"""
        return self.client.table('sport').select('*').order('name').execute()
    
    def get_sport_by_id(self, sport_id: int):
        """Returns a sport by ID"""
        return self.client.table('sport').select('*').eq('id', sport_id).execute()
    
    def get_sport_photo_path_by_id(self, sport_id: int):
        """Returns sport photo path by ID"""
        sport = self.client.table('sport').select('photo_path').eq('id', sport_id).execute()
        if not sport.data or not sport.data[0].get('photo_path'):
            return None
        
        return sport.data[0]['photo_path']

    def create_sport(self, sport: SportCreate):
        """Creates a new sport"""
        data = {
            "name": sport.name,
            "description": sport.description,
            "photo_path": sport.photo_path
        }
        return self.client.table('sport').insert(data).execute()
    
    def update_sport(self, sport_id: int, sport_update: SportUpdate):
        """Updates a sport"""
        data = {}
        if sport_update.name is not None:
            data["name"] = sport_update.name
        if sport_update.description is not None:
            data["description"] = sport_update.description
        if sport_update.photo_path is not None:
            data["photo_path"] = sport_update.photo_path

        if not data:
            return self.client.table('sport').select('*').eq('id', sport_id).execute()
        
        return self.client.table('sport').update(data).eq('id', sport_id).execute()
    
    def delete_sport(self, sport_id: int):
        """Deletes a sport"""
        return self.client.table('sport').delete().eq('id', sport_id).execute()

    def get_all_teams(self):
        """Returns all teams"""
        return self.client.table('team').select('*').order('name').execute()
    
    def get_team_by_id(self, team_id: int):
        """Returns a team by ID"""
        return self.client.table('team').select('*').eq('id', team_id).execute()
    
    def get_team_photo_path_by_id(self, team_id: int):
        """Returns team photo path by ID"""
        team = self.client.table('team').select('photo_path').eq('id', team_id).execute()
        if not team.data or not team.data[0].get('photo_path'):
            return None
        
        return team.data[0]['photo_path']
    
    def get_athletes_by_team_id(self, team_id: int):
        """Returns all athletes enrolled in a team"""
        return self.client.table('enrollment').select('athlete(*)').eq('id_team', team_id).execute()

    def create_team(self, team: TeamCreate):
        """Creates a new team"""
        data = {
            "id_coach": team.id_coach,
            "id_sport": team.id_sport,
            "name": team.name,
            "photo_path": team.photo_path
        }
        return self.client.table('team').insert(data).execute()
    
    def update_team(self, team_id: int, team_update: TeamUpdate):
        """Updates a team"""
        data = {}
        if team_update.id_coach is not None:
            data["id_coach"] = team_update.id_coach
        if team_update.id_sport is not None:
            data["id_sport"] = team_update.id_sport
        if team_update.name is not None:
            data["name"] = team_update.name
        if team_update.photo_path is not None:
            data["photo_path"] = team_update.photo_path

        if not data:
            return self.client.table('team').select('*').eq('id', team_id).execute()
        
        return self.client.table('team').update(data).eq('id', team_id).execute()
    
    def delete_team(self, team_id: int):
        """Deletes a team"""
        return self.client.table('team').delete().eq('id', team_id).execute()
    
    def get_all_routines(self):
        """Returns all routines"""
        return self.client.table('routine').select('*').order('name').execute()
    
    def get_routine_by_id(self, routine_id: int):
        """Returns a routine by ID"""
        return self.client.table('routine').select('*').eq('id', routine_id).execute()
    
    def get_routines_by_athlete_id(self, athlete_id: int):
        """Returns all routines of an athlete"""
        return self.client.table('routine').select('*').eq('id_athlete', athlete_id).order('name').execute()
    
    def get_exercises_by_routine_id(self, routine_id: int):
        """Returns all exercises in a routine with their schedule"""
        return self.client.table('routine_has_exercise').select('*, exercise(*)').eq('id_routine', routine_id).order('start_hour').execute()
    
    def create_routine(self, routine: RoutineCreate):
        """Creates a new routine"""
        data = {
            "id_athlete": routine.id_athlete,
            "name": routine.name,
            "created_at": routine.created_at,
            "created_by": routine.created_by
        }
        return self.client.table('routine').insert(data).execute()
    
    def update_routine(self, routine_id: int, routine_update: RoutineUpdate):
        """Updates a routine"""
        data = {}
        if routine_update.name is not None:
            data["name"] = routine_update.name
            data["updated_by"] = routine_update.updated_by

        if not data:
            return self.client.table('routine').select('*').eq('id', routine_id).execute()
        
        return self.client.table('routine').update(data).eq('id', routine_id).execute()
    
    def delete_routine(self, routine_id: int):
        """Deletes a routine"""
        return self.client.table('routine').delete().eq('id', routine_id).execute()
    
    def add_exercise_to_routine(self, routine_exercise: RoutineHasExerciseCreate):
        """Adds an exercise to a routine"""
        data = {
            "id_routine": routine_exercise.id_routine,
            "id_exercise": routine_exercise.id_exercise,
            "days_of_week": routine_exercise.days_of_week,
            "start_hour": routine_exercise.start_hour,
            "end_hour": routine_exercise.end_hour,
            "created_at": routine_exercise.created_at,
            "created_by": routine_exercise.created_by
        }
        return self.client.table('routine_has_exercise').insert(data).execute()
    
    def remove_exercise_from_routine(self, routine_exercise_id: int):
        """Removes an exercise from a routine"""
        return self.client.table('routine_has_exercise').delete().eq('id', routine_exercise_id).execute()
    
    def add_excluded_date(self, excluded_date: ExcludedDateCreate):
        """Adds an excluded date to a routine exercise"""
        data = {
            "id_routine_has_exercise": excluded_date.id_routine_has_exercise,
            "excluded_date": excluded_date.excluded_date.isoformat(),
            "reason": excluded_date.reason
        }
        return self.client.table('routine_exercise_excluded_dates').insert(data).execute()
    
    def get_excluded_dates(self, routine_exercise_id: int):
        """Returns all excluded dates for a routine exercise"""
        return self.client.table('routine_exercise_excluded_dates').select('*').eq('id_routine_has_exercise', routine_exercise_id).order('excluded_date').execute()
    
    def delete_excluded_date(self, excluded_date_id: int):
        """Deletes an excluded date"""
        return self.client.table('routine_exercise_excluded_dates').delete().eq('id', excluded_date_id).execute()
    
    # ============= GENERIC METHODS =============
    
    def get_all(self, table_name: str):
        """Generic method to get all records from a table"""
        return self.client.table(table_name).select('*').is_('deleted_at', 'null').execute().data
    
    def get_by_id(self, table_name: str, record_id: int):
        """Generic method to get a record by ID"""
        result = self.client.table(table_name).select('*').eq('id', record_id).is_('deleted_at', 'null').execute()
        return result.data[0] if result.data else None
    
    def create(self, table_name: str, data: dict):
        """Generic method to create a record"""
        return self.client.table(table_name).insert(data).execute().data[0]
    
    def update(self, table_name: str, record_id: int, data: dict):
        """Generic method to update a record"""
        return self.client.table(table_name).update(data).eq('id', record_id).execute().data[0]
    
    def delete(self, table_name: str, record_id: int):
        """Generic method to soft delete a record"""
        from datetime import datetime
        data = {
            "deleted_at": datetime.now().isoformat(),
            "deleted_by": "system"  # TODO: Get from auth context
        }
        return self.client.table(table_name).update(data).eq('id', record_id).execute().data[0]