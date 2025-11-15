from pydantic import BaseModel
from typing import Optional
from datetime import date

class ExercicioModel(BaseModel):
    id: int
    nome: str
    id_turma: int
    id_atleta: int
    id_tipo: int
    id_esporte: int
    data: date
    numero_repeticoes_total: int
    numero_repeticoes_atual: int
    concluido: bool
    video_path: str
    foto_path: str

class ExercicioCreateModel(BaseModel):
    nome: str
    id_turma: int
    id_atleta: int
    id_tipo: int
    id_esporte: int
    data: date
    numero_repeticoes_total: int
    video_path: str
    foto_path: str

class ExercicioUpdateModel(BaseModel):
    nome: Optional[str] = None
    id_turma: Optional[int] = None
    id_atleta: Optional[int] = None
    id_tipo: Optional[int] = None
    id_esporte: Optional[int] = None
    data: Optional[date] = None
    numero_repeticoes_total: Optional[int] = None
    numero_repeticoes_atual: Optional[int] = None
    concluido: Optional[bool] = None
    video_path: Optional[str] = None
    foto_path: Optional[str] = None