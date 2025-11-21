from fastapi import APIRouter, HTTPException
from controllers.type_exercise_controller import TypeExerciseController

api_type_exercises = APIRouter(prefix="/type-exercises", tags=["Type Exercises"])

@api_type_exercises.get("/")
def get_all_type_exercises():
    """Return all exercise types"""
    try:
        controller = TypeExerciseController()
        result = controller.get_all_type_exercises()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_type_exercises.get("/{type_id}")
def get_type_exercise(type_id: int):
    """Returns an exercise type by ID"""
    try:
        controller = TypeExerciseController()
        result = controller.get_type_exercise_by_id(type_id)
        if not result.data:
            raise HTTPException(status_code=404, detail="Exercise type not found")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
