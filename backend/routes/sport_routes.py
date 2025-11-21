from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from models.sport_models import SportBase, SportCreate, SportUpdate
from controllers.sport_controller import SportController

api_sports = APIRouter(prefix="/sports", tags=["Sports"])

@api_sports.get("/")
def get_all_sports():
    """Return all sports"""
    try:
        controller = SportController()
        result = controller.get_all_sports()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_sports.get("/{sport_id}")
def get_sport(sport_id: int):
    """Returns a sport by ID"""
    try:
        controller = SportController()
        result = controller.get_sport_by_id(sport_id)
        if not result.data:
            raise HTTPException(status_code=404, detail="Sport not found")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_sports.get("/{sport_id}/photo")
def get_sport_photo(sport_id: int):
    """Returns the photo of a sport by ID"""
    try:
        controller = SportController()
        file_bytes, content_type = controller.get_sport_photo(sport_id)
        if not file_bytes:
            raise HTTPException(status_code=404, detail="Photo not found")
        return Response(content=file_bytes, media_type=content_type)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_sports.post("/", status_code=201)
def create_sport(sport: SportCreate):
    """Creates a new sport"""
    try:
        controller = SportController()
        result = controller.create_sport(sport)
        return result.data[0] if result.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_sports.put("/{sport_id}")
def update_sport(sport_id: int, sport: SportUpdate):
    """Updates a sport"""
    try:
        controller = SportController()
        result = controller.update_sport(sport_id, sport)
        if not result.data:
            raise HTTPException(status_code=404, detail="Sport not found")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_sports.delete("/{sport_id}", status_code=204)
def delete_sport(sport_id: int):
    """Deletes a sport"""
    try:
        controller = SportController()
        controller.delete_sport(sport_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))