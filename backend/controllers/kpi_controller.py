from __future__ import annotations

import asyncio
import json
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from integrations.supabase_integration import SupabaseIntegration
from controllers.metric_controller import MetricController
from models.kpi_models import (
    GoalTypeParameterCreate,
    GoalTypeParameterUpdate,
    GoalTypeParameterDelete,
    KpiParameterCreate,
    KpiParameterUpdate,
    KpiParameterDelete,
    AthleteHasKpiParameterCreate,
    AthleteHasKpiParameterUpdate,
    AthleteHasKpiParameterDelete,
    AthleteKpiProgressResponse,
)


def _to_float(value: Any) -> Optional[float]:
    if value is None:
        return None
    try:
        return float(value)
    except Exception:
        return None


def _epsilon_equal(a: float, b: float, eps: float = 1e-9) -> bool:
    return abs(a - b) <= eps


def _evaluate_goal(goal_type_id: int, current: Optional[float], target: float) -> bool:
    if current is None:
        return False

    if goal_type_id == 1:
        return current > target
    if goal_type_id == 2:
        return current >= target
    if goal_type_id == 3:
        return _epsilon_equal(current, target)
    if goal_type_id == 4:
        return current < target
    if goal_type_id == 5:
        return current <= target

    return False


def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def _compute_progress_percent(goal_type_id: int, current: Optional[float], target: float, achieved: bool) -> float:
    if current is None:
        return 0.0

    # Keep progress within [0..100] and handle edge cases safely.
    if goal_type_id in (1, 2):
        # Higher is better.
        if target == 0:
            return 100.0 if achieved else 0.0
        return _clamp(current / target) * 100.0

    if goal_type_id in (4, 5):
        # Lower is better.
        if current == 0:
            return 100.0 if achieved else 0.0
        return _clamp(target / current) * 100.0

    if goal_type_id == 3:
        # Closer to target is better.
        if target == 0:
            return 100.0 if achieved else 0.0
        closeness = 1.0 - (abs(current - target) / abs(target))
        return _clamp(closeness) * 100.0

    return 0.0


class KpiController:
    def __init__(self):
        self.supabase_integration = SupabaseIntegration()
        self.metric_controller = MetricController()

    # ----------------------
    # Goal types CRUD
    # ----------------------

    def list_goal_types(self) -> List[Dict[str, Any]]:
        return self.supabase_integration.get_all('goal_type')

    def get_goal_type(self, goal_type_id: int) -> Optional[Dict[str, Any]]:
        return self.supabase_integration.get_by_id('goal_type', goal_type_id)

    def create_goal_type(self, params: GoalTypeParameterCreate) -> Dict[str, Any]:
        data = params.model_dump()
        data['created_at'] = data.get('created_at') or datetime.utcnow().isoformat()
        data['created_by'] = data.get('created_by') or 'system'
        return self.supabase_integration.create('goal_type', data)

    def update_goal_type(self, goal_type_id: int, params: GoalTypeParameterUpdate) -> Dict[str, Any]:
        data = params.model_dump()
        data['updated_at'] = data.get('updated_at') or datetime.utcnow().isoformat()
        data['updated_by'] = data.get('updated_by') or 'system'
        return self.supabase_integration.update('goal_type', goal_type_id, data)

    def delete_goal_type(self, goal_type_id: int, params: GoalTypeParameterDelete) -> None:
        # Soft delete uses generic method; ignore params for now to match existing integration behavior.
        self.supabase_integration.delete('goal_type', goal_type_id)

    # ----------------------
    # KPI definitions CRUD
    # ----------------------

    def list_kpis(self) -> List[Dict[str, Any]]:
        return self.supabase_integration.get_all('kpi')

    def get_kpi(self, kpi_id: int) -> Optional[Dict[str, Any]]:
        return self.supabase_integration.get_by_id('kpi', kpi_id)

    def create_kpi(self, params: KpiParameterCreate) -> Dict[str, Any]:
        data = params.model_dump()
        data['created_at'] = data.get('created_at') or datetime.utcnow().isoformat()
        data['created_by'] = data.get('created_by') or 'system'
        return self.supabase_integration.create('kpi', data)

    def update_kpi(self, kpi_id: int, params: KpiParameterUpdate) -> Dict[str, Any]:
        data = params.model_dump()
        data['updated_at'] = data.get('updated_at') or datetime.utcnow().isoformat()
        data['updated_by'] = data.get('updated_by') or 'system'
        return self.supabase_integration.update('kpi', kpi_id, data)

    def delete_kpi(self, kpi_id: int, params: KpiParameterDelete) -> None:
        self.supabase_integration.delete('kpi', kpi_id)

    # ----------------------
    # Athlete KPI assignment CRUD
    # ----------------------

    def list_athlete_kpis(self) -> List[Dict[str, Any]]:
        return self.supabase_integration.get_all('athlete_has_kpi')

    def get_athlete_kpi(self, athlete_kpi_id: int) -> Optional[Dict[str, Any]]:
        return self.supabase_integration.get_by_id('athlete_has_kpi', athlete_kpi_id)

    def create_athlete_kpi(self, params: AthleteHasKpiParameterCreate) -> Dict[str, Any]:
        data = params.model_dump()
        data['created_at'] = data.get('created_at') or datetime.utcnow().isoformat()
        data['created_by'] = data.get('created_by') or 'system'
        return self.supabase_integration.create('athlete_has_kpi', data)

    def update_athlete_kpi(self, athlete_kpi_id: int, params: AthleteHasKpiParameterUpdate) -> Dict[str, Any]:
        data = params.model_dump()
        data['updated_at'] = data.get('updated_at') or datetime.utcnow().isoformat()
        data['updated_by'] = data.get('updated_by') or 'system'
        return self.supabase_integration.update('athlete_has_kpi', athlete_kpi_id, data)

    def delete_athlete_kpi(self, athlete_kpi_id: int, params: AthleteHasKpiParameterDelete) -> None:
        self.supabase_integration.delete('athlete_has_kpi', athlete_kpi_id)

    # ----------------------
    # Dashboard: computed KPI progress
    # ----------------------

    def get_athlete_kpis_with_progress(self, athlete_id: int) -> List[Dict[str, Any]]:
        # 1) Load KPI assignments for the athlete (excluding soft-deleted).
        try:
            response = (
                self.supabase_integration.client.table('athlete_has_kpi')
                .select('*, kpi(*), goal_type(*)')
                .eq('id_athlete', athlete_id)
                .is_('deleted_at', 'null')
                .execute()
            )
            athlete_kpis = response.data or []
        except Exception as e:
            # Degrade gracefully on transient Supabase/network errors.
            print(f"Error loading athlete KPIs for athlete_id={athlete_id}: {e}")
            athlete_kpis = []

        # 2) Load current metric values for the athlete.
        try:
            metrics = self.metric_controller.get_athlete_metrics(athlete_id)
        except Exception as e:
            # Degrade gracefully: keep KPIs but mark current_value as None.
            print(f"Error loading athlete metrics for KPI progress athlete_id={athlete_id}: {e}")
            metrics = []
        metric_by_id: Dict[int, Dict[str, Any]] = {int(m['id']): m for m in metrics}

        result: List[Dict[str, Any]] = []
        for ak in athlete_kpis:
            kpi = ak.get('kpi') or {}
            goal_type = ak.get('goal_type') or {}

            metric_id = int(kpi.get('id_metric')) if kpi.get('id_metric') is not None else None
            metric = metric_by_id.get(metric_id) if metric_id is not None else None

            current_value = _to_float(metric.get('value')) if metric else None
            target_value = _to_float(ak.get('goal_value'))
            if target_value is None:
                # If goal_value is somehow missing, treat as 0 (schema says NOT NULL).
                target_value = 0.0

            goal_type_id = int(ak.get('id_goal_type')) if ak.get('id_goal_type') is not None else 0
            achieved = _evaluate_goal(goal_type_id, current_value, target_value)
            progress_percent = _compute_progress_percent(goal_type_id, current_value, target_value, achieved)

            item = AthleteKpiProgressResponse(
                athlete_kpi_id=int(ak['id']),
                kpi_id=int(ak['id_kpi']),
                kpi_name=str(kpi.get('name') or ''),
                kpi_description=kpi.get('description'),
                metric_id=int(metric_id) if metric_id is not None else 0,
                metric_name=metric.get('name') if metric else None,
                id_goal_type=goal_type_id,
                goal_type_name=goal_type.get('name'),
                goal_value=float(target_value),
                goal_date=str(ak.get('goal_date')),
                current_value=current_value,
                achieved=achieved,
                progress_percent=round(float(progress_percent), 2),
            )
            result.append(item.model_dump())

        return result

    async def sse_kpi_progress_stream(self, athlete_id: int, interval_seconds: float = 2.0):
        last_payload: Optional[str] = None

        while True:
            try:
                payload_obj = self.get_athlete_kpis_with_progress(athlete_id)
                payload = json.dumps(payload_obj, ensure_ascii=False)

                if payload != last_payload:
                    last_payload = payload
                    yield f"data: {payload}\n\n"
            except Exception as e:
                # Never crash the SSE connection on transient errors.
                error_payload = json.dumps(
                    {"error": "KPI stream temporarily unavailable", "detail": str(e)},
                    ensure_ascii=False,
                )
                yield f"event: error\ndata: {error_payload}\n\n"
                last_payload = None

            await asyncio.sleep(interval_seconds)
