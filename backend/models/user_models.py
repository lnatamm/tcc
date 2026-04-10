from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    usuario: str
    email: EmailStr
    nome: str
    # FK to user_type.id
    id_user_type: int


class UserCreate(UserBase):
    senha: str


class UserRegister(UserCreate):
    # Required only when id_user_type resolves to "coach"
    id_level: Optional[int] = None


class UserLogin(BaseModel):
    identifier: str
    senha: str


class UserResponse(UserBase):
    id: int
    user_type_name: Optional[str] = None
    ultimo_acesso: Optional[str] = None
