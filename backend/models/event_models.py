from pydantic import BaseModel
from typing import Optional, List

from models.crud_models import Create, Update, Response


class EventBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: str


class EventCreate(EventBase, Create):
    pass


class EventUpdate(EventBase, Update):
    pass


class Event(EventBase, Response):
    pass


class EventCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: str
    team_ids: List[int]
