from pydantic import BaseModel
from typing import Optional

class Create(BaseModel):
    created_at: Optional[str] = None
    created_by: Optional[str] = None

class Update(BaseModel):
    id: int
    updated_at: Optional[str] = None
    updated_by: Optional[str] = None

class Delete(BaseModel):
    id: int
    deleted_at: Optional[str] = None
    deleted_by: Optional[str] = None

class Response(BaseModel):
    id: int
    created_at: str
    created_by: str
    updated_at: Optional[str] = None
    updated_by: Optional[str] = None
    deleted_at: Optional[str] = None
    deleted_by: Optional[str] = None