from fastapi import APIRouter, HTTPException
from models.esporte_models import EsporteModel, EsporteCreateModel, EsporteUpdateModel
from controllers.esporte_controller import EsporteController

api_esportes = APIRouter(prefix="/esportes", tags=["Esportes"])

@api_esportes.get("/")
def get_all_esportes():
    """Retorna todos os esportes"""
    try:
        controller = EsporteController()
        result = controller.get_all_esportes()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_esportes.get("/{esporte_id}")
def get_esporte(esporte_id: int):
    """Retorna um esporte por ID"""
    try:
        controller = EsporteController()
        result = controller.get_esporte_by_id(esporte_id)
        if not result.data:
            raise HTTPException(status_code=404, detail="Esporte não encontrado")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_esportes.post("/", status_code=201)
def create_esporte(esporte: EsporteCreateModel):
    """Cria um novo esporte"""
    try:
        controller = EsporteController()
        result = controller.create_esporte(esporte)
        return result.data[0] if result.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_esportes.put("/{esporte_id}")
def update_esporte(esporte_id: int, esporte: EsporteUpdateModel):
    """Atualiza um esporte"""
    try:
        controller = EsporteController()
        result = controller.update_esporte(esporte_id, esporte)
        if not result.data:
            raise HTTPException(status_code=404, detail="Esporte não encontrado")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_esportes.delete("/{esporte_id}", status_code=204)
def delete_esporte(esporte_id: int):
    """Deleta um esporte"""
    try:
        controller = EsporteController()
        controller.delete_esporte(esporte_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))