from pydantic import BaseModel
from typing import Optional, List

from models.crud_models import Create, Update, Response


class PhysicalTestBase(BaseModel):
    name: str
    id_athlete: int
    description: Optional[str] = None


class PhysicalTestCreate(PhysicalTestBase, Create):
    pass


class PhysicalTestUpdate(PhysicalTestBase, Update):
    pass


class PhysicalTest(PhysicalTestBase, Response):
    pass


class PhysicalTestScheduleCreate(BaseModel):
    id_athlete: int
    name: str
    description: Optional[str] = None
    scheduled_date: str  # YYYY-MM-DD
    exercise_ids: List[int]


class PhysicalTestAddExercisesRequest(BaseModel):
    exercise_ids: List[int]
