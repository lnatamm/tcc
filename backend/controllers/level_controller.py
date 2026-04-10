from integrations.supabase_integration import SupabaseIntegration


class LevelController:
    def __init__(self):
        self.supabase_integration = SupabaseIntegration()

    def get_all_levels(self):
        return self.supabase_integration.get_all_levels()
