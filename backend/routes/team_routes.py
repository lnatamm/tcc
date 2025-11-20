from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from models.team_models import TeamBase, TeamCreate, TeamUpdate
from controllers.team_controller import TeamController

api_teams = APIRouter(prefix="/teams", tags=["Teams"])

@api_teams.get("/")
def get_all_teams():
    """Return all teams"""
    try:
        controller = TeamController()
        result = controller.get_all_teams()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_teams.get("/{team_id}")
def get_team(team_id: int):
    """Returns a team by ID"""
    try:
        controller = TeamController()
        result = controller.get_team_by_id(team_id)
        if not result.data:
            raise HTTPException(status_code=404, detail="Team not found")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_teams.get("/coach/{coach_id}")
def get_teams_by_coach(coach_id: int):
    """Returns all teams of a coach"""
    try:
        controller = TeamController()
        result = controller.get_teams_by_coach(coach_id)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_teams.get("/{team_id}/photo")
def get_team_photo(team_id: int):
    """Returns the photo of a team by ID"""
    try:
        controller = TeamController()
        file_bytes, content_type = controller.get_team_photo(team_id)
        if not file_bytes:
            raise HTTPException(status_code=404, detail="Photo not found")
        return Response(content=file_bytes, media_type=content_type)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_teams.post("/", status_code=201)
def create_team(team: TeamCreate):
    """Creates a new team"""
    try:
        controller = TeamController()
        result = controller.create_team(team)
        return result.data[0] if result.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_teams.put("/{team_id}")
def update_team(team_id: int, team: TeamUpdate):
    """Updates a team"""
    try:
        controller = TeamController()
        result = controller.update_team(team_id, team)
        if not result.data:
            raise HTTPException(status_code=404, detail="Team not found")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_teams.delete("/{team_id}", status_code=204)
def delete_team(team_id: int):
    """Deletes a team"""
    try:
        controller = TeamController()
        controller.delete_team(team_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_teams.get("/{team_id}/athletes")
def get_athletes_by_team(team_id: int):
    """Returns all athletes of a team"""
    try:
        controller = TeamController()
        result = controller.get_athletes_by_team_id(team_id)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
