import uvicorn
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

from routes.athlete_routes import api_athletes
from routes.team_routes import api_teams
from routes.coach_routes import api_coaches
from routes.sport_routes import api_sports
from routes.exercise_routes import api_exercises
from routes.enrollment_routes import api_enrollments
from routes.routine_routes import api_routines
from routes.type_exercise_routes import api_type_exercises
from routes.exercise_stats_routes import router as exercise_stats_router

app = FastAPI()
api = APIRouter(prefix="/api", tags=["API"])

# Attention: Adjust the origins list to match your frontend's URL
# For example, if your frontend is running on localhost:5173, you can set it
origins: List[str] = [
    "http://localhost:8080",
    VITE_CLIENT_URL if (VITE_CLIENT_URL := os.getenv("VITE_CLIENT_URL")) else "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
api.include_router(api_athletes)
api.include_router(api_teams)
api.include_router(api_coaches)
api.include_router(api_sports)
api.include_router(api_exercises)
api.include_router(api_enrollments)
api.include_router(api_routines)
api.include_router(api_type_exercises)
api.include_router(exercise_stats_router)

app.include_router(api)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)