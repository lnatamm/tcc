from datetime import datetime

from fastapi import APIRouter, HTTPException, Query

from controllers.event_controller import EventController
from models.event_models import EventCreateRequest


api_events = APIRouter(prefix="/events", tags=["Events"])


@api_events.get("/")
def get_all_events():
    """Returns all events with linked teams."""
    try:
        controller = EventController()
        return controller.get_all_events()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_events.post("/", status_code=201)
def create_event(payload: EventCreateRequest, user: str = Query(...)):
    """Creates a new event and links the selected teams."""
    try:
        if not payload.team_ids:
            raise HTTPException(status_code=400, detail="team_ids must not be empty")

        parsed = datetime.fromisoformat(payload.start_date)
        start_date_iso = datetime.combine(parsed.date(), datetime.min.time()).isoformat()

        controller = EventController()
        return controller.create_event_with_teams(
            name=payload.name,
            description=payload.description,
            start_date_iso=start_date_iso,
            team_ids=payload.team_ids,
            created_by=user,
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_events.put("/{event_id}")
def update_event(event_id: int, payload: EventCreateRequest, user: str = Query(...)):
    """Updates an existing event and its linked teams."""
    try:
        if not payload.team_ids:
            raise HTTPException(status_code=400, detail="team_ids must not be empty")

        parsed = datetime.fromisoformat(payload.start_date)
        start_date_iso = datetime.combine(parsed.date(), datetime.min.time()).isoformat()

        controller = EventController()
        updated_event = controller.update_event_with_teams(
            event_id=event_id,
            name=payload.name,
            description=payload.description,
            start_date_iso=start_date_iso,
            team_ids=payload.team_ids,
            updated_by=user,
        )
        return updated_event
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_events.delete("/{event_id}", status_code=204)
def delete_event(event_id: int):
    """Deletes an event and its linked teams."""
    try:
        controller = EventController()
        controller.delete_event(event_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
