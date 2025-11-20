import uvicorn
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

from routes.atleta_routes import api_atletas
from routes.turma_routes import api_turmas
from routes.treinador_routes import api_treinadores
from routes.esporte_routes import api_esportes
from routes.exercicio_routes import api_exercicios
from routes.matricula_routes import api_matriculas

app = FastAPI()
api = APIRouter(prefix="/api", tags=["API"])

# Atention: Adjust the origins list to match your frontend's URL
# For example, if your frontend is running on localhost:5173, you can set it
origins: List[str] = [
    "http://localhost:8080",
    "http://localhost:5173",
    "http://136.114.150.90:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
api.include_router(api_atletas)
api.include_router(api_turmas)
api.include_router(api_treinadores)
api.include_router(api_esportes)
api.include_router(api_exercicios)
api.include_router(api_matriculas)

app.include_router(api)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)