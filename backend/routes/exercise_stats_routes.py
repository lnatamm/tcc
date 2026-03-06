from fastapi import APIRouter

# Placeholder router for exercise statistics. You can expand this with actual
# endpoints later as the application requirements evolve.

router = APIRouter(prefix="/exercise-stats", tags=["exercise_stats"])

@router.get("/")
async def read_exercise_stats():
    return {"message": "exercise stats route placeholder"}
