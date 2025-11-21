from pydantic import BaseModel
from typing import Optional
from models.crud_models import Create, Update, Response

class SportBase(BaseModel):
    name: str
    description: Optional[str] = None
    photo_path: Optional[str] = None

class SportCreate(SportBase, Create):
    pass

class SportUpdate(SportBase, Update):
    pass

class Sport(SportBase, Response):
    pass