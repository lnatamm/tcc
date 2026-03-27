from integrations.supabase_integration import SupabaseIntegration
from models.physical_test_models import PhysicalTestCreate, PhysicalTestUpdate


class PhysicalTestController:
    def __init__(self):
        self.supabase_integration = SupabaseIntegration()

    def get_physical_tests_by_athlete(self, athlete_id: int):
        return self.supabase_integration.get_physical_tests_by_athlete_id(athlete_id)

    def get_physical_test_by_id(self, physical_test_id: int):
        return self.supabase_integration.get_physical_test_by_id(physical_test_id)

    def create_physical_test(self, payload: PhysicalTestCreate):
        return self.supabase_integration.create_physical_test(payload)

    def update_physical_test(self, physical_test_id: int, payload: PhysicalTestUpdate):
        return self.supabase_integration.update_physical_test(physical_test_id, payload)

    def delete_physical_test(self, physical_test_id: int):
        return self.supabase_integration.delete_physical_test(physical_test_id)

    def get_exercises_by_physical_test(self, physical_test_id: int):
        return self.supabase_integration.get_exercises_by_physical_test_id(physical_test_id)

    def add_exercises_to_physical_test_bulk(
        self,
        physical_test_id: int,
        exercise_ids: list[int],
        start_date_iso: str,
        created_at_iso: str,
        created_by: str,
    ):
        return self.supabase_integration.add_exercises_to_physical_test_bulk(
            physical_test_id=physical_test_id,
            exercise_ids=exercise_ids,
            start_date_iso=start_date_iso,
            created_at_iso=created_at_iso,
            created_by=created_by,
        )
