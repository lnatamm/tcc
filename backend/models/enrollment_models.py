from pydantic import BaseModel
from models.crud_models import Create, Update, Response

class EnrollmentBase(BaseModel):
    id: int
    id_team: int
    id_athlete: int

class EnrollmentCreate(EnrollmentBase, Create):
    pass

class EnrollmentUpdate(EnrollmentBase, Update):
    pass

class Enrollment(EnrollmentBase, Response):
    pass