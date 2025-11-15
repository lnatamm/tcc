import os
import psycopg2
from dotenv import load_dotenv
from supabase import create_client
class DbConnSupabase:
    def __init__(self):
        # Load environment variables from .env (if present)
        load_dotenv()
        self.client = create_client(
            os.getenv('SUPABASE_URL'),
            os.getenv('SUPABASE_KEY')
        )
        
    def get_client(self):
        return self.client