from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from models.coach_models import CoachBase, CoachCreate, CoachUpdate
from controllers.coach_controller import CoachController

api_coaches = APIRouter(prefix="/coaches", tags=["Coaches"])

@api_coaches.get("/")
def get_all_coaches():
    """Return all coaches"""
    try:
        controller = CoachController()
        result = controller.get_all_coaches()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_coaches.get("/{coach_id}")
def get_coach(coach_id: int):
    """Returns a coach by ID"""
    try:
        controller = CoachController()
        result = controller.get_coach_by_id(coach_id)
        if not result.data:
            raise HTTPException(status_code=404, detail="Coach not found")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_coaches.get("/{coach_id}/photo")
def get_coach_photo(coach_id: int):
    """Returns the photo of a coach by ID"""
    try:
        controller = CoachController()
        file_bytes, content_type = controller.get_coach_photo(coach_id)
        if not file_bytes:
            raise HTTPException(status_code=404, detail="Photo not found")
        return Response(content=file_bytes, media_type=content_type)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_coaches.post("/", status_code=201)
def create_coach(coach: CoachCreate):
    """Creates a new coach"""
    try:
        controller = CoachController()
        result = controller.create_coach(coach)
        return result.data[0] if result.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_coaches.put("/{coach_id}")
def update_coach(coach_id: int, coach: CoachUpdate):
    """Updates a coach"""
    try:
        controller = CoachController()
        result = controller.update_coach(coach_id, coach)
        if not result.data:
            raise HTTPException(status_code=404, detail="Coach not found")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_coaches.delete("/{coach_id}", status_code=204)
def delete_coach(coach_id: int):
    """Deletes a coach"""
    try:
        controller = CoachController()
        controller.delete_coach(coach_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_coaches.get("/{coach_id}/teams")
def get_teams_by_coach(coach_id: int):
    """Returns all teams of the coach"""
    try:
        controller = CoachController()
        result = controller.get_teams_by_coach_id(coach_id)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))