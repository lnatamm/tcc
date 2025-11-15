from utils.sql.db_conn import DbConnSupabase
from models.matricula_models import MatriculaModel, MatriculaCreateModel, MatriculaUpdateModel

class MatriculaController:
    def __init__(self):
        self.client = DbConnSupabase().get_client()
    
    def get_all_matriculas(self):
        """Retorna todas as matrículas"""
        return self.client.table('matricula').select('*').execute()
    
    def get_matricula_by_id(self, matricula_id: int):
        """Retorna uma matrícula por ID"""
        return self.client.table('matricula').select('*').eq('id', matricula_id).execute()
    
    def get_matriculas_by_turma(self, turma_id: int):
        """Retorna todas as matrículas de uma turma"""
        return self.client.table('matricula').select('*, atleta(*)').eq('id_turma', turma_id).execute()
    
    def get_matriculas_by_atleta(self, atleta_id: int):
        """Retorna todas as matrículas de um atleta"""
        return self.client.table('matricula').select('*, turma(*)').eq('id_atleta', atleta_id).execute()
    
    def create_matricula(self, payload: MatriculaCreateModel):
        """Cria uma nova matrícula"""
        data = {
            "id_turma": payload.id_turma,
            "id_atleta": payload.id_atleta
        }
        return self.client.table('matricula').insert(data).execute()
    
    def update_matricula(self, matricula_id: int, payload: MatriculaUpdateModel):
        """Atualiza uma matrícula"""
        data = {}
        if payload.id_turma is not None:
            data["id_turma"] = payload.id_turma
        if payload.id_atleta is not None:
            data["id_atleta"] = payload.id_atleta
        
        if not data:
            return self.get_matricula_by_id(matricula_id)
        
        return self.client.table('matricula').update(data).eq('id', matricula_id).execute()
    
    def delete_matricula(self, matricula_id: int):
        """Deleta uma matrícula"""
        return self.client.table('matricula').delete().eq('id', matricula_id).execute()