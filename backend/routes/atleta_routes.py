from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from models.atleta_models import AtletaModel, AtletaCreateModel, AtletaUpdateModel
from controllers.atleta_controller import AtletaController

api_atletas = APIRouter(prefix="/atletas", tags=["Atletas"])

@api_atletas.get("/")
def get_all_atletas():
    """Retorna todos os atletas"""
    try:
        controller = AtletaController()
        result = controller.get_all_atletas()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_atletas.get("/{atleta_id}")
def get_atleta(atleta_id: int):
    """Retorna um atleta por ID"""
    try:
        controller = AtletaController()
        result = controller.get_atleta_by_id(atleta_id)
        if not result.data:
            raise HTTPException(status_code=404, detail="Atleta não encontrado")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@api_atletas.get("/{atleta_id}/foto")
def get_foto_atleta(atleta_id: int):
    """Retorna a foto de um atleta por ID"""
    try:
        controller = AtletaController()
        file_bytes, content_type = controller.get_foto_atleta(atleta_id)
        if not file_bytes:
            raise HTTPException(status_code=404, detail="Foto não encontrada")
        return Response(content=file_bytes, media_type=content_type)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_atletas.post("/", status_code=201)
def create_atleta(atleta: AtletaCreateModel):
    """Cria um novo atleta"""
    try:
        controller = AtletaController()
        result = controller.create_atleta(atleta)
        return result.data[0] if result.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_atletas.put("/{atleta_id}")
def update_atleta(atleta_id: int, atleta: AtletaUpdateModel):
    """Atualiza um atleta"""
    try:
        controller = AtletaController()
        result = controller.update_atleta(atleta_id, atleta)
        if not result.data:
            raise HTTPException(status_code=404, detail="Atleta não encontrado")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_atletas.delete("/{atleta_id}", status_code=204)
def delete_atleta(atleta_id: int):
    """Deleta um atleta"""
    try:
        controller = AtletaController()
        controller.delete_atleta(atleta_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_atletas.get("/{atleta_id}/turmas")
def get_turmas_by_atleta(atleta_id: int):
    """Retorna todas as turmas do atleta"""
    try:
        controller = AtletaController()
        result = controller.get_turmas_by_atleta(atleta_id)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

