from pydantic import BaseModel
from typing import Optional


class LevelBase(BaseModel):
    name: str
    description: Optional[str] = None
    photo_path: Optional[str] = None


class Level(LevelBase):
    id: int
