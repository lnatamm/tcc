from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from models.example_model import ExampleModel
from controllers.example_controll import ExampleController
from datetime import datetime
from io import BytesIO
from utils.sql.db_conn import DbConnSupabase

api_example = APIRouter(prefix="/example", tags=["Example"])

@api_example.get("/", response_model=ExampleModel)
def get_example_data():
    """
    Example endpoint that uses ExampleController to get data.
    """
    client = DbConnSupabase().get_client()
    print(client.table('matricula').select('*').execute())