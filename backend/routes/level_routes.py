from fastapi import APIRouter, HTTPException
from controllers.level_controller import LevelController


router = APIRouter(prefix="/levels", tags=["Levels"])


@router.get("/")
def get_all_levels():
    """Returns all levels."""
    try:
        controller = LevelController()
        result = controller.get_all_levels()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
