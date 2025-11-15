from pydantic import BaseModel
from typing import Optional

class AtletaModel(BaseModel):
    id: int
    nome: str
    foto_path: str

class AtletaCreateModel(BaseModel):
    nome: str
    foto_path: str

class AtletaUpdateModel(BaseModel):
    nome: Optional[str] = None
    foto_path: Optional[str] = None