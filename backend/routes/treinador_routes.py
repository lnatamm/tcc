from fastapi import APIRouter, HTTPException
from models.treinador_models import TreinadorModel, TreinadorCreateModel, TreinadorUpdateModel
from controllers.treinador_controller import TreinadorController

api_treinadores = APIRouter(prefix="/treinadores", tags=["Treinadores"])

@api_treinadores.get("/")
def get_all_treinadores():
    """Retorna todos os treinadores"""
    try:
        controller = TreinadorController()
        result = controller.get_all_treinadores()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_treinadores.get("/{treinador_id}")
def get_treinador(treinador_id: int):
    """Retorna um treinador por ID"""
    try:
        controller = TreinadorController()
        result = controller.get_treinador_by_id(treinador_id)
        if not result.data:
            raise HTTPException(status_code=404, detail="Treinador não encontrado")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_treinadores.post("/", status_code=201)
def create_treinador(treinador: TreinadorCreateModel):
    """Cria um novo treinador"""
    try:
        controller = TreinadorController()
        result = controller.create_treinador(treinador)
        return result.data[0] if result.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_treinadores.put("/{treinador_id}")
def update_treinador(treinador_id: int, treinador: TreinadorUpdateModel):
    """Atualiza um treinador"""
    try:
        controller = TreinadorController()
        result = controller.update_treinador(treinador_id, treinador)
        if not result.data:
            raise HTTPException(status_code=404, detail="Treinador não encontrado")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_treinadores.delete("/{treinador_id}", status_code=204)
def delete_treinador(treinador_id: int):
    """Deleta um treinador"""
    try:
        controller = TreinadorController()
        controller.delete_treinador(treinador_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_treinadores.get("/{treinador_id}/turmas")
def get_turmas_by_treinador(treinador_id: int):
    """Retorna todas as turmas do treinador"""
    try:
        controller = TreinadorController()
        result = controller.get_turmas_by_treinador(treinador_id)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))