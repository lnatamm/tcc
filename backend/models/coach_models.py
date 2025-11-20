from pydantic import BaseModel
from typing import Optional
from models.crud_models import Create, Update

class CoachBase(BaseModel):
    name: str
    id_level: int
    photo_path: Optional[str] = None

class CoachCreate(CoachBase, Create):
    pass

class CoachUpdate(CoachBase, Update):
    pass