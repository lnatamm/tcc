from fastapi import APIRouter, HTTPException
from controllers.exercise_stats_controller import ExerciseStatsController
from models.exercise_stats_models import (
    StartExerciseRequest,
    StartExerciseResponse,
    UpdateExerciseProgressRequest,
    EndExerciseRequest,
    TodayExerciseResponse
)
from typing import List

router = APIRouter(prefix="/exercise-stats", tags=["Exercise Stats"])


@router.post("/start", response_model=StartExerciseResponse)
def start_exercise(request: StartExerciseRequest):
    """Start an exercise session"""
    try:
        controller = ExerciseStatsController()
        return controller.start_exercise(request)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{exercise_stats_id}/progress")
def update_exercise_progress(
    exercise_stats_id: int,
    request: UpdateExerciseProgressRequest
):
    """Update exercise progress (sets, reps, or goal)"""
    try:
        controller = ExerciseStatsController()
        return controller.update_exercise_progress(exercise_stats_id, request)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/history/{exercise_history_id}/end")
def end_exercise(
    exercise_history_id: int,
    request: EndExerciseRequest
):
    """End an exercise session"""
    try:
        controller = ExerciseStatsController()
        return controller.end_exercise(exercise_history_id, request)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/today/{athlete_id}", response_model=List[TodayExerciseResponse])
def get_today_exercises(athlete_id: int):
    """Get all exercises scheduled for today for an athlete"""
    try:
        controller = ExerciseStatsController()
        return controller.get_today_exercises(athlete_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
