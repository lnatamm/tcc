from pydantic import BaseModel
from typing import Optional

class MatriculaModel(BaseModel):
    id: int
    id_turma: int
    id_atleta: int

class MatriculaCreateModel(BaseModel):
    id_turma: int
    id_atleta: int

class MatriculaUpdateModel(BaseModel):
    id_turma: Optional[int] = None
    id_atleta: Optional[int] = None