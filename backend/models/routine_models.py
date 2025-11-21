from pydantic import BaseModel
from typing import Optional, List
from models.crud_models import Create, Update, Response

class RoutineBase(BaseModel):
    name: str
    id_athlete: int

class RoutineCreate(RoutineBase, Create):
    pass

class RoutineUpdate(RoutineBase, Update):
    pass

class Routine(RoutineBase, Response):
    pass

class TypeExerciseBase(BaseModel):
    name: str

class TypeExerciseCreate(TypeExerciseBase, Create):
    pass

class TypeExerciseUpdate(TypeExerciseBase,Update):
    pass

class TypeExercise(TypeExerciseBase, Response):
    pass

class RoutineHasExerciseBase(BaseModel):
    id_routine: int
    id_exercise: int
    days_of_week: str  # 'MONDAY', 'TUESDAY', etc.
    start_hour: str
    end_hour: str

class RoutineHasExerciseCreate(RoutineHasExerciseBase, Create):
    pass

class RoutineHasExercise(RoutineHasExerciseBase, Response):
    pass

class ExcludedDateBase(BaseModel):
    id_routine_has_exercise: int
    excluded_date: str
    reason: Optional[str] = None

class ExcludedDateCreate(ExcludedDateBase):
    pass

class ExcludedDateDelete(BaseModel):
    id: int

class ExcludedDate(ExcludedDateBase):
    id: int