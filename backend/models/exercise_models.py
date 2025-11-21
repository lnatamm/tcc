from pydantic import BaseModel
from typing import Optional
from models.crud_models import Create, Update, Response

class ExerciseBase(BaseModel):
    id_type: int
    id_sport: int
    name: str
    reps: Optional[int] = None
    sets: Optional[int] = None
    description: Optional[str] = None
    video_path: Optional[str] = None
    photo_path: Optional[str] = None

class ExerciseCreate(ExerciseBase, Create):
    pass

class ExerciseUpdate(ExerciseBase, Update):
    pass

class Exercise(ExerciseBase, Response):
    pass