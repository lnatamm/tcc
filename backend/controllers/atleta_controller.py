from utils.sql.db_conn import DbConnSupabase
from models.atleta_models import AtletaModel, AtletaCreateModel, AtletaUpdateModel

class AtletaController:
    def __init__(self):
        self.client = DbConnSupabase().get_client()
    
    def get_all_atletas(self):
        """Retorna todos os atletas"""
        return self.client.table('atleta').select('*').order('nome').execute()
    
    def get_atleta_by_id(self, atleta_id: int):
        """Retorna um atleta por ID"""
        return self.client.table('atleta').select('*').eq('id', atleta_id).execute()
    
    def create_atleta(self, payload: AtletaCreateModel):
        """Cria um novo atleta"""
        data = {
            "nome": payload.nome,
            "foto_path": payload.foto_path
        }
        return self.client.table('atleta').insert(data).execute()
    
    def update_atleta(self, atleta_id: int, payload: AtletaUpdateModel):
        """Atualiza um atleta"""
        data = {}
        if payload.nome is not None:
            data["nome"] = payload.nome
        if payload.foto_path is not None:
            data["foto_path"] = payload.foto_path
        
        if not data:
            return self.get_atleta_by_id(atleta_id)
        
        return self.client.table('atleta').update(data).eq('id', atleta_id).execute()
    
    def delete_atleta(self, atleta_id: int):
        """Deleta um atleta"""
        return self.client.table('atleta').delete().eq('id', atleta_id).execute()
    
    def get_turmas_by_atleta(self, atleta_id: int):
        """Retorna todas as turmas do atleta"""
        return self.client.table('matricula').select('turma(*)').eq('id_atleta', atleta_id).execute()