from utils.sql.db_conn import DbConnSupabase
from models.esporte_models import EsporteModel, EsporteCreateModel, EsporteUpdateModel

class EsporteController:
    def __init__(self):
        self.client = DbConnSupabase().get_client()
    
    def get_all_esportes(self):
        """Retorna todos os esportes"""
        return self.client.table('esporte').select('*').order('nome').execute()
    
    def get_esporte_by_id(self, esporte_id: int):
        """Retorna um esporte por ID"""
        return self.client.table('esporte').select('*').eq('id', esporte_id).execute()
    
    def create_esporte(self, payload: EsporteCreateModel):
        """Cria um novo esporte"""
        data = {
            "nome": payload.nome
        }
        return self.client.table('esporte').insert(data).execute()
    
    def update_esporte(self, esporte_id: int, payload: EsporteUpdateModel):
        """Atualiza um esporte"""
        data = {}
        if payload.nome is not None:
            data["nome"] = payload.nome
        
        if not data:
            return self.get_esporte_by_id(esporte_id)
        
        return self.client.table('esporte').update(data).eq('id', esporte_id).execute()
    
    def delete_esporte(self, esporte_id: int):
        """Deleta um esporte"""
        return self.client.table('esporte').delete().eq('id', esporte_id).execute()