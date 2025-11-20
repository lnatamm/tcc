from pydantic import BaseModel
from typing import Optional
from models.crud_models import Create, Update

class AthleteBase(BaseModel):
    name: str
    photo_path: Optional[str] = None

class AthleteCreate(AthleteBase, Create):
    pass

class AthleteUpdate(AthleteBase, Update):
    pass