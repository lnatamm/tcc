from utils.sql.db_conn import DbConnSupabase
from models.turma_models import TurmaModel, TurmaCreateModel, TurmaUpdateModel

class TurmaController:
    def __init__(self):
        self.client = DbConnSupabase().get_client()
    
    def get_all_turmas(self):
        """Retorna todas as turmas"""
        return self.client.table('turma').select('*').order('nome').execute()
    
    def get_turma_by_id(self, turma_id: int):
        """Retorna uma turma por ID"""
        return self.client.table('turma').select('*').eq('id', turma_id).execute()
    
    def get_turmas_by_treinador(self, treinador_id: int):
        """Retorna todas as turmas de um treinador"""
        return self.client.table('turma').select('*').eq('id_treinador', treinador_id).order('nome').execute()
    
    def create_turma(self, payload: TurmaCreateModel):
        """Cria uma nova turma"""
        data = {
            "id_treinador": payload.id_treinador,
            "id_esporte": payload.id_esporte,
            "nome": payload.nome,
            "foto_path": payload.foto_path
        }
        return self.client.table('turma').insert(data).execute()
    
    def update_turma(self, turma_id: int, payload: TurmaUpdateModel):
        """Atualiza uma turma"""
        # Monta o dicionário apenas com os campos fornecidos
        data = {}
        if payload.id_treinador is not None:
            data["id_treinador"] = payload.id_treinador
        if payload.id_esporte is not None:
            data["id_esporte"] = payload.id_esporte
        if payload.nome is not None:
            data["nome"] = payload.nome
        if payload.foto_path is not None:
            data["foto_path"] = payload.foto_path
        
        if not data:
            return self.get_turma_by_id(turma_id)
        
        return self.client.table('turma').update(data).eq('id', turma_id).execute()
    
    def delete_turma(self, turma_id: int):
        """Deleta uma turma"""
        return self.client.table('turma').delete().eq('id', turma_id).execute()
    
    def get_atletas_by_turma(self, turma_id: int):
        """Retorna todos os atletas matriculados em uma turma"""
        return self.client.table('matricula').select('atleta(*)').eq('id_turma', turma_id).execute()
