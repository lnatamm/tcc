from pydantic import BaseModel
from typing import Optional

class EsporteModel(BaseModel):
    id: int
    nome: str

class EsporteCreateModel(BaseModel):
    nome: str

class EsporteUpdateModel(BaseModel):
    nome: Optional[str] = None
