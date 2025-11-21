from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from models.exercise_models import ExerciseBase, ExerciseCreate, ExerciseUpdate
from controllers.exercise_controller import ExerciseController
from datetime import datetime

api_exercises = APIRouter(prefix="/exercises", tags=["Exercises"])

@api_exercises.get("/")
def get_all_exercises():
    """Return all exercises"""
    try:
        controller = ExerciseController()
        result = controller.get_all_exercises()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_exercises.get("/{exercise_id}")
def get_exercise(exercise_id: int):
    """Returns an exercise by ID"""
    try:
        controller = ExerciseController()
        result = controller.get_exercise_by_id(exercise_id)
        if not result.data:
            raise HTTPException(status_code=404, detail="Exercise not found")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_exercises.get("/team/{team_id}")
def get_exercises_by_team(team_id: int):
    """Returns all exercises of a team"""
    try:
        controller = ExerciseController()
        result = controller.get_exercises_by_team(team_id)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_exercises.get("/athlete/{athlete_id}")
def get_exercises_by_athlete(athlete_id: int):
    """Returns all exercises of an athlete"""
    try:
        controller = ExerciseController()
        result = controller.get_exercises_by_athlete(athlete_id)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_exercises.get("/{exercise_id}/photo")
def get_exercise_photo(exercise_id: int):
    """Returns the photo of an exercise by ID"""
    try:
        controller = ExerciseController()
        file_bytes, content_type = controller.get_exercise_photo(exercise_id)
        if not file_bytes:
            raise HTTPException(status_code=404, detail="Photo not found")
        return Response(content=file_bytes, media_type=content_type)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_exercises.get("/{exercise_id}/video")
def get_exercise_video(exercise_id: int):
    """Returns the video of an exercise by ID"""
    try:
        controller = ExerciseController()
        file_bytes, content_type = controller.get_exercise_video(exercise_id)
        if not file_bytes:
            raise HTTPException(status_code=404, detail="Video not found")
        return Response(content=file_bytes, media_type=content_type)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_exercises.post("/", status_code=201)
def create_exercise(exercise: ExerciseCreate, user: str = Query(...)):
    """Creates a new exercise"""
    try:
        controller = ExerciseController()
        exercise.created_at = datetime.now().isoformat()
        exercise.created_by = user
        result = controller.create_exercise(exercise)
        return result.data[0] if result.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_exercises.put("/{exercise_id}")
def update_exercise(exercise_id: int, exercise: ExerciseUpdate):
    """Updates an exercise"""
    try:
        controller = ExerciseController()
        result = controller.update_exercise(exercise_id, exercise)
        if not result.data:
            raise HTTPException(status_code=404, detail="Exercise not found")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_exercises.delete("/{exercise_id}", status_code=204)
def delete_exercise(exercise_id: int):
    """Deletes an exercise"""
    try:
        controller = ExerciseController()
        controller.delete_exercise(exercise_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))