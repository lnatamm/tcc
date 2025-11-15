from utils.sql.db_conn import DbConnSupabase
from models.exercicio_models import ExercicioModel, ExercicioCreateModel, ExercicioUpdateModel
from datetime import datetime

class ExercicioController:
    def __init__(self):
        self.client = DbConnSupabase().get_client()
    
    def get_all_exercicios(self):
        """Retorna todos os exercícios"""
        return self.client.table('exercicio').select('*').order('data', desc=True).execute()
    
    def get_exercicio_by_id(self, exercicio_id: int):
        """Retorna um exercício por ID"""
        return self.client.table('exercicio').select('*').eq('id', exercicio_id).execute()
    
    def get_exercicios_by_turma(self, turma_id: int):
        """Retorna todos os exercícios de uma turma"""
        return self.client.table('exercicio').select('*').eq('id_turma', turma_id).order('data', desc=True).execute()
    
    def get_exercicios_by_atleta(self, atleta_id: int):
        """Retorna todos os exercícios de um atleta"""
        return self.client.table('exercicio').select('*').eq('id_atleta', atleta_id).order('data', desc=True).execute()
    
    def create_exercicio(self, payload: ExercicioCreateModel, criado_por: str):
        """Cria um novo exercício"""
        now = datetime.now().date()
        data = {
            "nome": payload.nome,
            "id_turma": payload.id_turma,
            "id_atleta": payload.id_atleta,
            "id_tipo": payload.id_tipo,
            "id_esporte": payload.id_esporte,
            "data": payload.data.isoformat(),
            "numero_repeticoes_total": payload.numero_repeticoes_total,
            "numero_repeticoes_atual": 0,
            "concluido": False,
            "video_path": payload.video_path,
            "foto_path": payload.foto_path,
            "criado_por": criado_por,
            "criado_em": now.isoformat(),
            "atualizado_por": criado_por,
            "atualizado_em": now.isoformat()
        }
        return self.client.table('exercicio').insert(data).execute()
    
    def update_exercicio(self, exercicio_id: int, payload: ExercicioUpdateModel, atualizado_por: str):
        """Atualiza um exercício"""
        data = {}
        if payload.nome is not None:
            data["nome"] = payload.nome
        if payload.id_turma is not None:
            data["id_turma"] = payload.id_turma
        if payload.id_atleta is not None:
            data["id_atleta"] = payload.id_atleta
        if payload.id_tipo is not None:
            data["id_tipo"] = payload.id_tipo
        if payload.id_esporte is not None:
            data["id_esporte"] = payload.id_esporte
        if payload.data is not None:
            data["data"] = payload.data.isoformat()
        if payload.numero_repeticoes_total is not None:
            data["numero_repeticoes_total"] = payload.numero_repeticoes_total
        if payload.numero_repeticoes_atual is not None:
            data["numero_repeticoes_atual"] = payload.numero_repeticoes_atual
        if payload.concluido is not None:
            data["concluido"] = payload.concluido
        if payload.video_path is not None:
            data["video_path"] = payload.video_path
        if payload.foto_path is not None:
            data["foto_path"] = payload.foto_path
        
        if not data:
            return self.get_exercicio_by_id(exercicio_id)
        
        data["atualizado_por"] = atualizado_por
        data["atualizado_em"] = datetime.now().date().isoformat()
        
        return self.client.table('exercicio').update(data).eq('id', exercicio_id).execute()
    
    def delete_exercicio(self, exercicio_id: int, deletado_por: str):
        """Marca um exercício como deletado (soft delete)"""
        data = {
            "deletado_por": deletado_por,
            "deletado_em": datetime.now().date().isoformat()
        }
        return self.client.table('exercicio').update(data).eq('id', exercicio_id).execute()