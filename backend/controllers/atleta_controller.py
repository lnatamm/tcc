from utils.sql.db_conn import DbConnSupabase
from utils.s3 import S3Client
from models.atleta_models import AtletaModel, AtletaCreateModel, AtletaUpdateModel

class AtletaController:
    def __init__(self):
        self.client = DbConnSupabase().get_client()
        self.s3 = S3Client()
    
    def get_all_atletas(self):
        """Retorna todos os atletas"""
        return self.client.table('atleta').select('*').order('nome').execute()
    
    def get_atleta_by_id(self, atleta_id: int):
        """Retorna um atleta por ID"""
        return self.client.table('atleta').select('*').eq('id', atleta_id).execute()
    
    def get_foto_atleta(self, atleta_id: int):
        """Retorna os bytes da foto de um atleta por ID"""
        atleta = self.client.table('atleta').select('foto_path').eq('id', atleta_id).execute()
        if not atleta.data or not atleta.data[0].get('foto_path'):
            return None, None
        
        foto_path = atleta.data[0]['foto_path']
        # Retorna bytes da imagem
        file_bytes = self.s3.get_file('fotos', foto_path)
        
        # Determinar content type baseado na extensão
        if foto_path.lower().endswith('.png'):
            content_type = 'image/png'
        elif foto_path.lower().endswith(('.jpg', '.jpeg')):
            content_type = 'image/jpeg'
        elif foto_path.lower().endswith('.gif'):
            content_type = 'image/gif'
        elif foto_path.lower().endswith('.webp'):
            content_type = 'image/webp'
        else:
            content_type = 'application/octet-stream'
        
        return file_bytes, content_type
    
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