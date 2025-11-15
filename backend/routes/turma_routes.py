from fastapi import APIRouter, HTTPException
from models.turma_models import TurmaModel, TurmaCreateModel, TurmaUpdateModel
from controllers.turma_controller import TurmaController

api_turmas = APIRouter(prefix="/turmas", tags=["Turmas"])

@api_turmas.get("/")
def get_all_turmas():
    """Retorna todas as turmas"""
    try:
        controller = TurmaController()
        result = controller.get_all_turmas()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_turmas.get("/{turma_id}")
def get_turma(turma_id: int):
    """Retorna uma turma por ID"""
    try:
        controller = TurmaController()
        result = controller.get_turma_by_id(turma_id)
        if not result.data:
            raise HTTPException(status_code=404, detail="Turma não encontrada")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_turmas.get("/treinador/{treinador_id}")
def get_turmas_by_treinador(treinador_id: int):
    """Retorna todas as turmas de um treinador"""
    try:
        controller = TurmaController()
        result = controller.get_turmas_by_treinador(treinador_id)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_turmas.post("/", status_code=201)
def create_turma(turma: TurmaCreateModel):
    """Cria uma nova turma"""
    try:
        controller = TurmaController()
        result = controller.create_turma(turma)
        return result.data[0] if result.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_turmas.put("/{turma_id}")
def update_turma(turma_id: int, turma: TurmaUpdateModel):
    """Atualiza uma turma"""
    try:
        controller = TurmaController()
        result = controller.update_turma(turma_id, turma)
        if not result.data:
            raise HTTPException(status_code=404, detail="Turma não encontrada")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_turmas.delete("/{turma_id}", status_code=204)
def delete_turma(turma_id: int):
    """Deleta uma turma"""
    try:
        controller = TurmaController()
        controller.delete_turma(turma_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_turmas.get("/{turma_id}/atletas")
def get_atletas_by_turma(turma_id: int):
    """Retorna todos os atletas de uma turma"""
    try:
        controller = TurmaController()
        result = controller.get_atletas_by_turma(turma_id)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
