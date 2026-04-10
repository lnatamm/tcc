from integrations.supabase_integration import SupabaseIntegration


class UserTypeController:
    def __init__(self):
        self.supabase_integration = SupabaseIntegration()

    def get_all_user_types(self):
        return self.supabase_integration.get_all_user_types()

    def get_user_type_by_id(self, type_id: int):
        return self.supabase_integration.get_user_type_by_id(type_id)
