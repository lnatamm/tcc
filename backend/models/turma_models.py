from pydantic import BaseModel
from typing import Optional

class TurmaModel(BaseModel):
    id: int
    id_treinador: int
    id_esporte: int
    nome: str
    foto_path: str

class TurmaCreateModel(BaseModel):
    id_treinador: int
    id_esporte: int
    nome: str
    foto_path: str

class TurmaUpdateModel(BaseModel):
    id_treinador: Optional[int] = None
    id_esporte: Optional[int] = None
    nome: Optional[str] = None
    foto_path: Optional[str] = None