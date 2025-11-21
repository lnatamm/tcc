from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from models.routine_models import RoutineCreate, RoutineUpdate, RoutineHasExerciseCreate, ExcludedDateCreate
from controllers.routine_controller import RoutineController

api_routines = APIRouter(prefix="/routines", tags=["Routines"])

@api_routines.get("/")
def get_all_routines():
    """Return all routines"""
    try:
        controller = RoutineController()
        result = controller.get_all_routines()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_routines.get("/{routine_id}")
def get_routine(routine_id: int):
    """Returns a routine by ID"""
    try:
        controller = RoutineController()
        result = controller.get_routine_by_id(routine_id)
        if not result.data:
            raise HTTPException(status_code=404, detail="Routine not found")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_routines.get("/athlete/{athlete_id}")
def get_routines_by_athlete(athlete_id: int):
    """Returns all routines of an athlete"""
    try:
        controller = RoutineController()
        result = controller.get_routines_by_athlete(athlete_id)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_routines.get("/{routine_id}/exercises")
def get_exercises_by_routine(routine_id: int):
    """Returns all exercises in a routine with their schedule"""
    try:
        controller = RoutineController()
        result = controller.get_exercises_by_routine(routine_id)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_routines.post("/", status_code=201)
def create_routine(routine: RoutineCreate, user: str):
    """Creates a new routine"""
    try:
        controller = RoutineController()
        routine.created_at = datetime.now().isoformat()
        routine.created_by = user
        result = controller.create_routine(routine)
        return result.data[0] if result.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_routines.put("/{routine_id}")
def update_routine(routine_id: int, routine: RoutineUpdate):
    """Updates a routine"""
    try:
        controller = RoutineController()
        result = controller.update_routine(routine_id, routine)
        if not result.data:
            raise HTTPException(status_code=404, detail="Routine not found")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_routines.delete("/{routine_id}", status_code=204)
def delete_routine(routine_id: int):
    """Deletes a routine"""
    try:
        controller = RoutineController()
        controller.delete_routine(routine_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_routines.post("/{routine_id}/exercises", status_code=201)
def add_exercise_to_routine(routine_exercise: RoutineHasExerciseCreate, user: str = Query(...)):
    """Adds an exercise to a routine"""
    try:
        routine_exercise.created_at = datetime.now().isoformat()
        routine_exercise.created_by = user
        controller = RoutineController()
        result = controller.add_exercise_to_routine(routine_exercise)
        return result.data[0] if result.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_routines.delete("/exercises/{routine_exercise_id}", status_code=204)
def remove_exercise_from_routine(routine_exercise_id: int):
    """Removes an exercise from a routine"""
    try:
        controller = RoutineController()
        controller.remove_exercise_from_routine(routine_exercise_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_routines.get("/exercises/{routine_exercise_id}/excluded-dates")
def get_excluded_dates(routine_exercise_id: int):
    """Returns all excluded dates for a routine exercise"""
    try:
        controller = RoutineController()
        result = controller.get_excluded_dates(routine_exercise_id)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_routines.post("/exercises/{routine_exercise_id}/excluded-dates", status_code=201)
def add_excluded_date(excluded_date: ExcludedDateCreate):
    """Adds an excluded date to a routine exercise"""
    try:
        controller = RoutineController()
        result = controller.add_excluded_date(excluded_date)
        return result.data[0] if result.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_routines.delete("/excluded-dates/{excluded_date_id}", status_code=204)
def delete_excluded_date(excluded_date_id: int):
    """Deletes an excluded date"""
    try:
        controller = RoutineController()
        controller.delete_excluded_date(excluded_date_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
