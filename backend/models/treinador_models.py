from pydantic import BaseModel
from typing import Optional

class TreinadorModel(BaseModel):
    id: int
    nome: str
    foto_path: str

class TreinadorCreateModel(BaseModel):
    nome: str
    foto_path: str

class TreinadorUpdateModel(BaseModel):
    nome: Optional[str] = None
    foto_path: Optional[str] = None