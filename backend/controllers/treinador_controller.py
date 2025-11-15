from utils.sql.db_conn import DbConnSupabase
from models.treinador_models import TreinadorModel, TreinadorCreateModel, TreinadorUpdateModel

class TreinadorController:
    def __init__(self):
        self.client = DbConnSupabase().get_client()
    
    def get_all_treinadores(self):
        """Retorna todos os treinadores"""
        return self.client.table('treinador').select('*').order('nome').execute()
    
    def get_treinador_by_id(self, treinador_id: int):
        """Retorna um treinador por ID"""
        return self.client.table('treinador').select('*').eq('id', treinador_id).execute()
    
    def create_treinador(self, payload: TreinadorCreateModel):
        """Cria um novo treinador"""
        data = {
            "nome": payload.nome,
            "foto_path": payload.foto_path
        }
        return self.client.table('treinador').insert(data).execute()
    
    def update_treinador(self, treinador_id: int, payload: TreinadorUpdateModel):
        """Atualiza um treinador"""
        data = {}
        if payload.nome is not None:
            data["nome"] = payload.nome
        if payload.foto_path is not None:
            data["foto_path"] = payload.foto_path
        
        if not data:
            return self.get_treinador_by_id(treinador_id)
        
        return self.client.table('treinador').update(data).eq('id', treinador_id).execute()
    
    def delete_treinador(self, treinador_id: int):
        """Deleta um treinador"""
        return self.client.table('treinador').delete().eq('id', treinador_id).execute()
    
    def get_turmas_by_treinador(self, treinador_id: int):
        """Retorna todas as turmas do treinador"""
        return self.client.table('turma').select('*').eq('id_treinador', treinador_id).order('nome').execute()