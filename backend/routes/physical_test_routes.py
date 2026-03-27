from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, date

from controllers.physical_test_controller import PhysicalTestController
from models.physical_test_models import PhysicalTestCreate, PhysicalTestScheduleCreate, PhysicalTestAddExercisesRequest


api_physical_tests = APIRouter(prefix="/physical-tests", tags=["Physical Tests"])


@api_physical_tests.get("/athlete/{athlete_id}")
def get_physical_tests_by_athlete(athlete_id: int):
    """Returns all physical tests of an athlete."""
    try:
        controller = PhysicalTestController()
        result = controller.get_physical_tests_by_athlete(athlete_id)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_physical_tests.get("/{physical_test_id}/exercises")
def get_physical_test_exercises(physical_test_id: int):
    """Returns all exercises in a physical test with their schedule."""
    try:
        controller = PhysicalTestController()
        result = controller.get_exercises_by_physical_test(physical_test_id)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_physical_tests.post("/schedule", status_code=201)
def schedule_physical_test(payload: PhysicalTestScheduleCreate, user: str = Query(...)):
    """Schedules a new physical test for an athlete.

    Note: DB schema doesn't store a test-level date. We persist the scheduled date as
    the same start_date in physical_test_has_exercise rows.
    """
    try:
        if not payload.exercise_ids:
            raise HTTPException(status_code=400, detail="exercise_ids must not be empty")

        # Normalize to midnight (local) as ISO string without timezone.
        scheduled_dt = datetime.fromisoformat(payload.scheduled_date)
        scheduled_start = datetime.combine(scheduled_dt.date(), datetime.min.time())

        controller = PhysicalTestController()

        test_create = PhysicalTestCreate(
            id_athlete=payload.id_athlete,
            name=payload.name,
            description=payload.description,
        )
        test_create.created_at = datetime.now().isoformat()
        test_create.created_by = user

        created = controller.create_physical_test(test_create)
        if not created.data:
            raise HTTPException(status_code=500, detail="Failed to create physical test")

        physical_test_id = created.data[0].get('id')

        try:
            controller.add_exercises_to_physical_test_bulk(
                physical_test_id=physical_test_id,
                exercise_ids=payload.exercise_ids,
                start_date_iso=scheduled_start.isoformat(),
                created_at_iso=datetime.now().isoformat(),
                created_by=user,
            )
        except Exception:
            # Best-effort rollback
            controller.delete_physical_test(physical_test_id)
            raise

        return created.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_physical_tests.post("/{physical_test_id}/exercises", status_code=201)
def add_exercises_to_physical_test(
    physical_test_id: int,
    payload: PhysicalTestAddExercisesRequest,
    user: str = Query(...),
):
    """Adds exercises to an existing physical test.

    Uses the scheduled date inferred from the earliest existing start_date.
    """
    try:
        if not payload.exercise_ids:
            raise HTTPException(status_code=400, detail="exercise_ids must not be empty")

        controller = PhysicalTestController()
        existing = controller.get_exercises_by_physical_test(physical_test_id)

        if not existing.data:
            raise HTTPException(
                status_code=400,
                detail="Physical test has no scheduled date yet (no exercises). Use /schedule instead.",
            )

        first_start = existing.data[0].get('start_date')
        if not first_start:
            raise HTTPException(status_code=500, detail="Could not infer scheduled date")

        controller.add_exercises_to_physical_test_bulk(
            physical_test_id=physical_test_id,
            exercise_ids=payload.exercise_ids,
            start_date_iso=first_start,
            created_at_iso=datetime.now().isoformat(),
            created_by=user,
        )

        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_physical_tests.delete("/{physical_test_id}", status_code=204)
def delete_physical_test(physical_test_id: int):
    """Deletes a physical test."""
    try:
        controller = PhysicalTestController()
        controller.delete_physical_test(physical_test_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
