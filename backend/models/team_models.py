from pydantic import BaseModel
from typing import Optional
from models.crud_models import Create, Update, Response

class TeamBase(BaseModel):
    id_coach: int
    id_sport: int
    name: str
    photo_path: Optional[str] = None

class TeamCreate(TeamBase, Create):
    pass

class TeamUpdate(TeamBase, Update):
    pass

class Team(TeamBase, Response):
    pass