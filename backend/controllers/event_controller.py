from datetime import datetime
from typing import Optional

from integrations.supabase_integration import SupabaseIntegration
from models.event_models import EventCreate, EventUpdate


class EventController:
    def __init__(self):
        self.supabase_integration = SupabaseIntegration()

    def get_all_events(self):
        events_result = self.supabase_integration.get_all_events()
        events = events_result.data or []

        if not events:
            return []

        event_ids = [event["id"] for event in events]
        links_result = self.supabase_integration.get_team_links_by_event_ids(event_ids)
        links = links_result.data or []

        teams_by_event_id = {}
        for link in links:
            event_id = link.get("id_event")
            team = link.get("team") or {}
            team_data = {
                "id": link.get("id_team"),
                "name": team.get("name", "Turma sem nome"),
            }
            teams_by_event_id.setdefault(event_id, []).append(team_data)

        for event in events:
            event["teams"] = teams_by_event_id.get(event["id"], [])

        return events

    def create_event_with_teams(
        self,
        name: str,
        description: Optional[str],
        start_date_iso: str,
        team_ids: list[int],
        created_by: str,
    ):
        created_at = datetime.now().isoformat()
        event_payload = EventCreate(
            name=name,
            description=description,
            start_date=start_date_iso,
            created_at=created_at,
            created_by=created_by,
        )

        created_event = self.supabase_integration.create_event(event_payload)
        if not created_event.data:
            raise ValueError("Failed to create event")

        event_data = created_event.data[0]
        event_id = event_data.get("id")

        try:
            self.supabase_integration.add_teams_to_event_bulk(
                event_id=event_id,
                team_ids=team_ids,
                created_at_iso=created_at,
                created_by=created_by,
            )
        except Exception:
            self.supabase_integration.delete_event(event_id)
            raise

        links_result = self.supabase_integration.get_team_links_by_event_ids([event_id])
        links = links_result.data or []
        event_data["teams"] = [
            {
                "id": link.get("id_team"),
                "name": (link.get("team") or {}).get("name", "Turma sem nome"),
            }
            for link in links
        ]
        return event_data

    def update_event_with_teams(
        self,
        event_id: int,
        name: str,
        description: Optional[str],
        start_date_iso: str,
        team_ids: list[int],
        updated_by: str,
    ):
        """Updates an event and its linked teams."""
        updated_at = datetime.now().isoformat()

        event_update = EventUpdate(
            id=event_id,
            name=name,
            description=description,
            start_date=start_date_iso,
            updated_at=updated_at,
            updated_by=updated_by,
        )

        updated_result = self.supabase_integration.update_event(event_id, event_update)
        if not updated_result.data:
            raise ValueError("Failed to update event")

        # Reset team links for this event and add the new set
        self.supabase_integration.delete_teams_from_event(event_id)
        if team_ids:
            self.supabase_integration.add_teams_to_event_bulk(
                event_id=event_id,
                team_ids=team_ids,
                created_at_iso=updated_at,
                created_by=updated_by,
            )

        event_data = updated_result.data[0]
        links_result = self.supabase_integration.get_team_links_by_event_ids([event_id])
        links = links_result.data or []
        event_data["teams"] = [
            {
                "id": link.get("id_team"),
                "name": (link.get("team") or {}).get("name", "Turma sem nome"),
            }
            for link in links
        ]
        return event_data
