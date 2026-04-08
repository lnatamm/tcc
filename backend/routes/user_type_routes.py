from fastapi import APIRouter, HTTPException
from controllers.user_type_controller import UserTypeController


router = APIRouter(prefix="/user-types", tags=["User Types"])


@router.get("/")
def get_all_user_types():
    """Returns all user types (e.g., athlete, coach)."""
    try:
        controller = UserTypeController()
        result = controller.get_all_user_types()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
