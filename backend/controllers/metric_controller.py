from integrations.supabase_integration import SupabaseIntegration
from models.metric_models import *
from typing import List, Dict, Callable
from datetime import datetime

# Definir as fórmulas predefinidas
def metric_sum(metrics: List[Dict]) -> float:
    """Soma os valores das métricas"""
    return sum(float(m.get('value', 0) or 0) for m in metrics)

def metric_division(metrics: List[Dict]) -> float:
    """Divisão: primeiro métrica dividido pelo segundo (proporção)"""
    if len(metrics) < 2:
        return None
    numerator = float(metrics[0].get('value', 0) or 0)
    denominator = float(metrics[1].get('value', 0) or 0)
    # Return None if denominator is zero to avoid division by zero
    if denominator == 0:
        return None
    return numerator / denominator

def metric_average(metrics: List[Dict]) -> float:
    """Média das métricas"""
    if not metrics:
        return 0
    total = sum(float(m.get('value', 0) or 0) for m in metrics)
    return total / len(metrics)

def metric_multiplication(metrics: List[Dict]) -> float:
    """Multiplicação das métricas"""
    if not metrics:
        return 0
    result = 1
    for m in metrics:
        result *= float(m.get('value', 0) or 0)
    return result

# Mapeamento de fórmulas por ID
FORMULAS: Dict[str, Callable] = {
    '1': metric_division,  # Proporção
    '2': metric_sum,
    '3': metric_average,
    '4': metric_multiplication
}

class MetricController:
    def __init__(self):
        self.supabase_integration = SupabaseIntegration()
    
    def get_all_metrics(self):
        """Returns all metrics"""
        return self.supabase_integration.get_all('metric')
    
    def get_metric_by_id(self, metric_id: int):
        """Returns a metric by ID"""
        return self.supabase_integration.get_by_id('metric', metric_id)
    
    def create_metric(self, payload: MetricCreate):
        """Creates a new metric"""
        data = payload.model_dump()
        data['created_at'] = datetime.now().isoformat()
        return self.supabase_integration.create('metric', data)
    
    def update_metric(self, metric_id: int, payload: MetricUpdate):
        """Updates a metric"""
        data = payload.model_dump()
        data['updated_at'] = datetime.now().isoformat()
        return self.supabase_integration.update('metric', metric_id, data)
    
    def delete_metric(self, metric_id: int):
        """Deletes a metric"""
        return self.supabase_integration.delete('metric', metric_id)
    
    def get_athlete_metrics(self, athlete_id: int):
        """Returns all metrics for an athlete with calculated values"""
        # Buscar todas as métricas do atleta
        query = self.supabase_integration.client.table('athlete_has_metric') \
            .select('*, metric(*)')  \
            .eq('id_athlete', athlete_id) \
            .is_('deleted_at', 'null')
        
        response = query.execute()
        athlete_metrics = response.data
        
        # Organizar métricas por ID, agrupando múltiplos valores
        metrics_dict = {}
        metric_values = {}  # Para armazenar múltiplos valores da mesma métrica
        
        for am in athlete_metrics:
            metric_data = am['metric']
            metric_id = metric_data['id']
            
            # Se ainda não existe no dicionário, criar entrada
            if metric_id not in metrics_dict:
                metrics_dict[metric_id] = {
                    'id': metric_id,
                    'id_formula': metric_data.get('id_formula'),
                    'id_coach': metric_data.get('id_coach'),
                    'id_sport': metric_data.get('id_sport'),
                    'ids_metrics': metric_data.get('ids_metrics'),
                    'name': metric_data['name'],
                    'description': metric_data.get('description'),
                    'aggregated': metric_data['aggregated'],
                    'value': None,
                    'created_at': metric_data['created_at']
                }
                metric_values[metric_id] = []
            
            # Adicionar valor à lista
            value = am.get('value')
            if value is not None:
                metric_values[metric_id].append(float(value))
        
        # Somar valores para métricas não agregadas
        for metric_id, metric in metrics_dict.items():
            if not metric['aggregated']:
                # Somar todos os valores da métrica
                if metric_values[metric_id]:
                    metric['value'] = sum(metric_values[metric_id])
        
        # Calcular valores agregados
        for metric_id, metric in metrics_dict.items():
            if metric['aggregated'] and metric['id_formula']:
                # Pegar IDs das métricas que compõem a agregação
                ids_metrics = metric.get('ids_metrics', '')
                if ids_metrics:
                    component_ids = [int(mid.strip()) for mid in ids_metrics.split(',')]
                    component_metrics = [metrics_dict.get(mid) for mid in component_ids if mid in metrics_dict]
                    
                    # Verificar se todas as métricas componentes existem e têm valores válidos
                    if len(component_metrics) == len(component_ids):
                        all_valid = all(
                            m is not None and m.get('value') is not None 
                            for m in component_metrics
                        )
                        
                        if all_valid:
                            # Aplicar fórmula aos valores somados
                            formula_id = str(metric['id_formula'])
                            if formula_id in FORMULAS:
                                try:
                                    calculated_value = FORMULAS[formula_id](component_metrics)
                                    # Only set value if calculation returned a valid number (not None)
                                    if calculated_value is not None:
                                        metric['value'] = round(calculated_value, 2)
                                    else:
                                        # Keep value as None if calculation failed (e.g., division by zero)
                                        metric['value'] = None
                                except Exception as e:
                                    # Handle any unexpected errors gracefully
                                    print(f"Error calculating metric {metric_id}: {e}")
                                    metric['value'] = None
                        else:
                            # If any component metric is missing or has no value, result is None
                            metric['value'] = None
                    else:
                        # If not all component metrics are available, result is None
                        metric['value'] = None
        
        result = list(metrics_dict.values())
        return result
    
    def get_all_formulas(self):
        """Returns all formulas"""
        return self.supabase_integration.get_all('formula')
    
    def get_all_athlete_metrics(self):
        """Returns all athlete metrics"""
        return self.supabase_integration.get_all('athlete_has_metric')
    
    def create_athlete_metric(self, payload: AthleteMetricCreate):
        """Creates a new athlete metric"""
        data = payload.model_dump()
        data['created_at'] = datetime.now().isoformat()
        # TODO: Remove this conversion when database column type is changed from BIGINT to FLOAT/NUMERIC
        if data.get('value') is not None:
            data['value'] = int(data['value'])
        return self.supabase_integration.create('athlete_has_metric', data)
    
    def update_athlete_metric(self, athlete_metric_id: int, payload: AthleteMetricUpdate):
        """Updates an athlete metric"""
        data = payload.model_dump()
        data['updated_at'] = datetime.now().isoformat()
        # TODO: Remove this conversion when database column type is changed from BIGINT to FLOAT/NUMERIC
        if data.get('value') is not None:
            data['value'] = int(data['value'])
        return self.supabase_integration.update('athlete_has_metric', athlete_metric_id, data)
