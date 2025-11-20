from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from models.athlete_models import AthleteBase, AthleteCreate, AthleteUpdate
from controllers.athlete_controller import AthleteController

api_athletes = APIRouter(prefix="/athletes", tags=["Athletes"])

@api_athletes.get("/")
def get_all_athletes():
    """Return all athletes"""
    try:
        controller = AthleteController()
        result = controller.get_all_athletes()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_athletes.get("/{athlete_id}")
def get_athlete(athlete_id: int):
    """Returns an athlete by ID"""
    try:
        controller = AthleteController()
        result = controller.get_athlete_by_id(athlete_id)
        if not result.data:
            raise HTTPException(status_code=404, detail="Athlete not found")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@api_athletes.get("/{athlete_id}/photo")
def get_athlete_photo(athlete_id: int):
    """Returns the photo of an athlete by ID"""
    try:
        controller = AthleteController()
        file_bytes, content_type = controller.get_athlete_photo(athlete_id)
        if not file_bytes:
            raise HTTPException(status_code=404, detail="Photo not found")
        return Response(content=file_bytes, media_type=content_type)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_athletes.post("/", status_code=201)
def create_athlete(athlete: AthleteCreate):
    """Creates a new athlete"""
    try:
        controller = AthleteController()
        result = controller.create_athlete(athlete)
        return result.data[0] if result.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_athletes.put("/{athlete_id}")
def update_athlete(athlete_id: int, athlete: AthleteUpdate):
    """Updates an athlete"""
    try:
        controller = AthleteController()
        result = controller.update_athlete(athlete_id, athlete)
        if not result.data:
            raise HTTPException(status_code=404, detail="Athlete not found")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_athletes.delete("/{athlete_id}", status_code=204)
def delete_athlete(athlete_id: int):
    """Deletes an athlete"""
    try:
        controller = AthleteController()
        controller.delete_athlete(athlete_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_athletes.get("/{athlete_id}/teams")
def get_teams_by_athlete(athlete_id: int):
    """Returns all teams of the athlete"""
    try:
        controller = AthleteController()
        result = controller.get_teams_by_athlete(athlete_id)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

