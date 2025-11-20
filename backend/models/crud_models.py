from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class Create(BaseModel):
    created_at: Optional[datetime] = None
    created_by: Optional[int] = None

class Update(BaseModel):
    id: int
    updated_at: Optional[datetime] = None
    updated_by: Optional[int] = None

class Delete(BaseModel):
    id: int
    deleted_at: Optional[datetime] = None
    deleted_by: Optional[int] = None