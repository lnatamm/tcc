from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    usuario: str
    email: EmailStr
    nome: str
    tipo: Optional[str] = "user"


class UserCreate(UserBase):
    senha: str


class UserLogin(BaseModel):
    identifier: str
    senha: str


class UserResponse(UserBase):
    id: int
    ultimo_acesso: Optional[str] = None
