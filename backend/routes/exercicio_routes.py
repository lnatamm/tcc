from fastapi import APIRouter, HTTPException
from models.exercicio_models import ExercicioModel, ExercicioCreateModel, ExercicioUpdateModel
from controllers.exercicio_controller import ExercicioController

api_exercicios = APIRouter(prefix="/exercicios", tags=["Exercicios"])

@api_exercicios.get("/")
def get_all_exercicios():
    """Retorna todos os exercícios"""
    try:
        controller = ExercicioController()
        result = controller.get_all_exercicios()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_exercicios.get("/{exercicio_id}")
def get_exercicio(exercicio_id: int):
    """Retorna um exercício por ID"""
    try:
        controller = ExercicioController()
        result = controller.get_exercicio_by_id(exercicio_id)
        if not result.data:
            raise HTTPException(status_code=404, detail="Exercício não encontrado")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_exercicios.get("/turma/{turma_id}")
def get_exercicios_by_turma(turma_id: int):
    """Retorna todos os exercícios de uma turma"""
    try:
        controller = ExercicioController()
        result = controller.get_exercicios_by_turma(turma_id)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_exercicios.get("/atleta/{atleta_id}")
def get_exercicios_by_atleta(atleta_id: int):
    """Retorna todos os exercícios de um atleta"""
    try:
        controller = ExercicioController()
        result = controller.get_exercicios_by_atleta(atleta_id)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_exercicios.post("/", status_code=201)
def create_exercicio(exercicio: ExercicioCreateModel, criado_por: str = "sistema"):
    """Cria um novo exercício"""
    try:
        controller = ExercicioController()
        result = controller.create_exercicio(exercicio, criado_por)
        return result.data[0] if result.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_exercicios.put("/{exercicio_id}")
def update_exercicio(exercicio_id: int, exercicio: ExercicioUpdateModel, atualizado_por: str = "sistema"):
    """Atualiza um exercício"""
    try:
        controller = ExercicioController()
        result = controller.update_exercicio(exercicio_id, exercicio, atualizado_por)
        if not result.data:
            raise HTTPException(status_code=404, detail="Exercício não encontrado")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_exercicios.delete("/{exercicio_id}", status_code=204)
def delete_exercicio(exercicio_id: int, deletado_por: str = "sistema"):
    """Marca um exercício como deletado"""
    try:
        controller = ExercicioController()
        controller.delete_exercicio(exercicio_id, deletado_por)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))