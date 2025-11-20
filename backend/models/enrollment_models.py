from pydantic import BaseModel
from models.crud_models import Create, Update

class EnrollmentBase(BaseModel):
    id: int
    id_team: int
    id_athlete: int

class EnrollmentCreate(EnrollmentBase, Create):
    pass

class EnrollmentUpdate(EnrollmentBase, Update):
    pass