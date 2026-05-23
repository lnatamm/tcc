from __future__ import annotations

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from controllers.kpi_controller import KpiController
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
)


router = APIRouter(tags=["KPI"])
controller = KpiController()


# ----------------------
# Goal types
# ----------------------


@router.get("/goal-types")
def list_goal_types():
    try:
        return controller.list_goal_types()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/goal-types/{goal_type_id}")
def get_goal_type(goal_type_id: int):
    try:
        result = controller.get_goal_type(goal_type_id)
        if not result:
            raise HTTPException(status_code=404, detail="Goal type not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/goal-types", status_code=201)
def create_goal_type(payload: GoalTypeParameterCreate):
    try:
        return controller.create_goal_type(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/goal-types/{goal_type_id}")
def update_goal_type(goal_type_id: int, payload: GoalTypeParameterUpdate):
    try:
        return controller.update_goal_type(goal_type_id, payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/goal-types/{goal_type_id}", status_code=204)
def delete_goal_type(goal_type_id: int):
    try:
        controller.delete_goal_type(goal_type_id, GoalTypeParameterDelete())
        return
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------
# KPI definitions
# ----------------------


@router.get("/kpis")
def list_kpis():
    try:
        return controller.list_kpis()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/kpis/{kpi_id}")
def get_kpi(kpi_id: int):
    try:
        result = controller.get_kpi(kpi_id)
        if not result:
            raise HTTPException(status_code=404, detail="KPI not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/kpis", status_code=201)
def create_kpi(payload: KpiParameterCreate):
    try:
        return controller.create_kpi(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/kpis/{kpi_id}")
def update_kpi(kpi_id: int, payload: KpiParameterUpdate):
    try:
        return controller.update_kpi(kpi_id, payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/kpis/{kpi_id}", status_code=204)
def delete_kpi(kpi_id: int):
    try:
        controller.delete_kpi(kpi_id, KpiParameterDelete())
        return
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------
# Athlete KPI assignments
# ----------------------


@router.get("/athlete-kpis")
def list_athlete_kpis():
    try:
        return controller.list_athlete_kpis()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/athlete-kpis/{athlete_kpi_id}")
def get_athlete_kpi(athlete_kpi_id: int):
    try:
        result = controller.get_athlete_kpi(athlete_kpi_id)
        if not result:
            raise HTTPException(status_code=404, detail="Athlete KPI not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/athlete-kpis", status_code=201)
def create_athlete_kpi(payload: AthleteHasKpiParameterCreate):
    try:
        return controller.create_athlete_kpi(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/athlete-kpis/{athlete_kpi_id}")
def update_athlete_kpi(athlete_kpi_id: int, payload: AthleteHasKpiParameterUpdate):
    try:
        return controller.update_athlete_kpi(athlete_kpi_id, payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/athlete-kpis/{athlete_kpi_id}", status_code=204)
def delete_athlete_kpi(athlete_kpi_id: int):
    try:
        controller.delete_athlete_kpi(athlete_kpi_id, AthleteHasKpiParameterDelete())
        return
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------
# Dashboard: KPI progress
# ----------------------


@router.get("/athletes/{athlete_id}/kpis")
def get_athlete_kpis_with_progress(athlete_id: int):
    try:
        return controller.get_athlete_kpis_with_progress(athlete_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/athletes/{athlete_id}/kpis/stream")
def stream_athlete_kpis_with_progress(athlete_id: int):
    try:
        return StreamingResponse(
            controller.sse_kpi_progress_stream(athlete_id),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
