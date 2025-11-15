from fastapi import APIRouter, HTTPException
from models.matricula_models import MatriculaModel, MatriculaCreateModel, MatriculaUpdateModel
from controllers.matricula_controller import MatriculaController

api_matriculas = APIRouter(prefix="/matriculas", tags=["Matriculas"])

@api_matriculas.get("/")
def get_all_matriculas():
    """Retorna todas as matrículas"""
    try:
        controller = MatriculaController()
        result = controller.get_all_matriculas()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_matriculas.get("/{matricula_id}")
def get_matricula(matricula_id: int):
    """Retorna uma matrícula por ID"""
    try:
        controller = MatriculaController()
        result = controller.get_matricula_by_id(matricula_id)
        if not result.data:
            raise HTTPException(status_code=404, detail="Matrícula não encontrada")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_matriculas.get("/turma/{turma_id}")
def get_matriculas_by_turma(turma_id: int):
    """Retorna todas as matrículas de uma turma"""
    try:
        controller = MatriculaController()
        result = controller.get_matriculas_by_turma(turma_id)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_matriculas.get("/atleta/{atleta_id}")
def get_matriculas_by_atleta(atleta_id: int):
    """Retorna todas as matrículas de um atleta"""
    try:
        controller = MatriculaController()
        result = controller.get_matriculas_by_atleta(atleta_id)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_matriculas.post("/", status_code=201)
def create_matricula(matricula: MatriculaCreateModel):
    """Cria uma nova matrícula"""
    try:
        controller = MatriculaController()
        result = controller.create_matricula(matricula)
        return result.data[0] if result.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_matriculas.put("/{matricula_id}")
def update_matricula(matricula_id: int, matricula: MatriculaUpdateModel):
    """Atualiza uma matrícula"""
    try:
        controller = MatriculaController()
        result = controller.update_matricula(matricula_id, matricula)
        if not result.data:
            raise HTTPException(status_code=404, detail="Matrícula não encontrada")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_matriculas.delete("/{matricula_id}", status_code=204)
def delete_matricula(matricula_id: int):
    """Deleta uma matrícula"""
    try:
        controller = MatriculaController()
        controller.delete_matricula(matricula_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))