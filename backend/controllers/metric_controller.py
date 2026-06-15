from integrations.supabase_integration import SupabaseIntegration
from models.metric_models import *
from typing import List, Dict, Callable, Any, Optional, Tuple
from datetime import datetime
import time

try:
    import httpx
except Exception:  # pragma: no cover
    httpx = None

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
        self._aggregated_defs_cache: Optional[List[Dict[str, Any]]] = None
        self._aggregated_defs_cache_at: float = 0.0

    @staticmethod
    def _row_recency_key(row: Dict[str, Any]) -> Tuple[str, str, int]:
        """Best-effort sort key to pick the most recent row."""
        updated_at = row.get('updated_at') or ''
        created_at = row.get('created_at') or ''
        row_id = int(row.get('id') or 0)
        return (str(updated_at), str(created_at), row_id)

    @staticmethod
    def _parse_metric_ids(raw: Any) -> List[int]:
        if raw is None:
            return []
        if isinstance(raw, str):
            parts = [p.strip() for p in raw.split(',')]
            ids: List[int] = []
            for p in parts:
                if not p:
                    continue
                try:
                    ids.append(int(p))
                except Exception:
                    continue
            return ids
        return []

    def _execute_with_retry(self, query_builder, retries: int = 1, delay_seconds: float = 0.05):
        """Executes a Supabase query with a small retry for transient socket/read errors."""
        last_exc: Optional[Exception] = None
        for attempt in range(retries + 1):
            try:
                return query_builder.execute()
            except Exception as exc:  # Supabase client uses httpx/httpcore under the hood.
                last_exc = exc
                is_httpx_read_error = httpx is not None and isinstance(exc, getattr(httpx, 'ReadError', ()))
                if attempt >= retries or not is_httpx_read_error:
                    raise
                time.sleep(delay_seconds)

        raise last_exc  # type: ignore[misc]
    
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
        """Returns all metrics for an athlete with calculated values.

        Semantics:
        - Base (non-aggregated) metrics are a single current value per (athlete, metric).
        - Aggregated metrics are computed only after the athlete has attached the metric.
        """

        # 1) Load athlete metric rows (current value per metric).
        response = self._execute_with_retry(
            self.supabase_integration.client.table('athlete_has_metric')
            .select('*, metric(*)')
            .eq('id_athlete', athlete_id)
            .is_('deleted_at', 'null'),
            retries=1,
        )
        athlete_metric_rows: List[Dict[str, Any]] = response.data or []

        latest_row_by_metric_id: Dict[int, Dict[str, Any]] = {}
        for row in athlete_metric_rows:
            metric_data = row.get('metric') or {}
            if metric_data.get('id') is None:
                continue
            metric_id = int(metric_data['id'])

            existing = latest_row_by_metric_id.get(metric_id)
            if existing is None or self._row_recency_key(row) > self._row_recency_key(existing):
                latest_row_by_metric_id[metric_id] = row

        metrics_by_id: Dict[int, Dict[str, Any]] = {}

        # 2) Materialize base metrics from the latest row for each metric.
        for metric_id, row in latest_row_by_metric_id.items():
            metric_data = row.get('metric') or {}

            metric_obj: Dict[str, Any] = {
                'id': int(metric_data.get('id')),
                'id_formula': metric_data.get('id_formula'),
                'id_coach': metric_data.get('id_coach'),
                'id_sport': metric_data.get('id_sport'),
                'ids_metrics': metric_data.get('ids_metrics'),
                'name': metric_data.get('name'),
                'description': metric_data.get('description'),
                'aggregated': bool(metric_data.get('aggregated')),
                'value': None,
                'created_at': metric_data.get('created_at'),
            }

            if not metric_obj['aggregated']:
                value = row.get('value')
                metric_obj['value'] = float(value) if value is not None else None

            metrics_by_id[metric_id] = metric_obj

        # Iteratively compute aggregated metrics (supports chains).
        max_iterations = max(1, len(metrics_by_id) + 1)
        for _ in range(max_iterations):
            changed = False

            for metric_id, metric in metrics_by_id.items():
                if not metric.get('aggregated'):
                    continue
                if metric.get('value') is not None:
                    continue
                if not metric.get('id_formula'):
                    continue

                component_ids = self._parse_metric_ids(metric.get('ids_metrics'))
                if not component_ids:
                    continue

                component_metrics: List[Dict[str, Any]] = []
                all_present = True
                for cid in component_ids:
                    component = metrics_by_id.get(cid)
                    if component is None or component.get('value') is None:
                        all_present = False
                        break
                    component_metrics.append(component)

                if not all_present:
                    continue

                formula_id = str(metric.get('id_formula'))
                formula = FORMULAS.get(formula_id)
                if formula is None:
                    continue

                try:
                    calculated_value = formula(component_metrics)
                except Exception as e:
                    print(f"Error calculating metric {metric_id}: {e}")
                    calculated_value = None

                if calculated_value is not None:
                    metric['value'] = round(float(calculated_value), 2)
                    changed = True

            if not changed:
                break

        # 3) Return only metrics attached to the athlete.
        result: List[Dict[str, Any]] = []
        base_metric_ids = set(latest_row_by_metric_id.keys())

        for metric_id in sorted(base_metric_ids):
            result.append(metrics_by_id[metric_id])

        return result
    
    def get_all_formulas(self):
        """Returns all formulas"""
        return self.supabase_integration.get_all('formula')
    
    def get_all_athlete_metrics(self):
        """Returns all athlete metrics"""
        return self.supabase_integration.get_all('athlete_has_metric')
    
    def create_athlete_metric(self, payload: AthleteMetricCreate):
        """Creates or updates an athlete metric (single current value per athlete+metric)."""
        data = payload.model_dump()

        metric_response = self.supabase_integration.client.table('metric').select('*').eq('id', data['id_metric']).is_('deleted_at', 'null').execute()
        metric_rows: List[Dict[str, Any]] = metric_response.data or []
        metric_def = metric_rows[0] if metric_rows else {}
        is_aggregated_metric = bool(metric_def.get('aggregated'))

        if is_aggregated_metric:
            data['value'] = None

        # TODO: Remove this conversion when database column type is changed from BIGINT to FLOAT/NUMERIC
        if data.get('value') is not None:
            data['value'] = int(data['value'])

        # Find an existing active row for this athlete+metric.
        existing_response = (
            self.supabase_integration.client.table('athlete_has_metric')
            .select('*')
            .eq('id_athlete', data['id_athlete'])
            .eq('id_metric', data['id_metric'])
            .is_('deleted_at', 'null')
            .execute()
        )
        existing_rows: List[Dict[str, Any]] = existing_response.data or []

        existing_row: Optional[Dict[str, Any]] = None
        for row in existing_rows:
            if existing_row is None or self._row_recency_key(row) > self._row_recency_key(existing_row):
                existing_row = row

        now = datetime.now().isoformat()
        if existing_row is not None:
            update_data: Dict[str, Any] = {
                'value': None if is_aggregated_metric else data.get('value'),
                'updated_at': now,
                'updated_by': data.get('created_by') or 'system',
            }
            return self.supabase_integration.update('athlete_has_metric', int(existing_row['id']), update_data)

        data['created_at'] = now
        data['created_by'] = data.get('created_by') or 'system'
        return self.supabase_integration.create('athlete_has_metric', data)
    
    def update_athlete_metric(self, athlete_metric_id: int, payload: AthleteMetricUpdate):
        """Updates an athlete metric"""
        data = payload.model_dump()
        data['updated_at'] = datetime.now().isoformat()
        # TODO: Remove this conversion when database column type is changed from BIGINT to FLOAT/NUMERIC
        if data.get('value') is not None:
            data['value'] = int(data['value'])
        return self.supabase_integration.update('athlete_has_metric', athlete_metric_id, data)

    def delete_athlete_metric(self, athlete_id: int, metric_id: int):
        """Detaches a metric from an athlete by soft deleting the athlete-metric row."""
        existing_response = (
            self.supabase_integration.client.table('athlete_has_metric')
            .select('*')
            .eq('id_athlete', athlete_id)
            .eq('id_metric', metric_id)
            .is_('deleted_at', 'null')
            .execute()
        )
        existing_rows: List[Dict[str, Any]] = existing_response.data or []

        if not existing_rows:
            return None

        existing_row = None
        for row in existing_rows:
            if existing_row is None or self._row_recency_key(row) > self._row_recency_key(existing_row):
                existing_row = row

        return self.supabase_integration.delete('athlete_has_metric', int(existing_row['id']))
