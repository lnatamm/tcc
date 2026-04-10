from fastapi import APIRouter, HTTPException
from controllers.metric_controller import MetricController
from models.metric_models import *

router = APIRouter()
metric_controller = MetricController()

@router.get("/metrics")
def get_all_metrics():
    """Get all metrics"""
    try:
        return metric_controller.get_all_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/{metric_id}")
def get_metric_by_id(metric_id: int):
    """Get a metric by ID"""
    try:
        return metric_controller.get_metric_by_id(metric_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/metrics")
def create_metric(payload: MetricCreate):
    """Create a new metric"""
    try:
        return metric_controller.create_metric(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/metrics/{metric_id}")
def update_metric(metric_id: int, payload: MetricUpdate):
    """Update a metric"""
    try:
        return metric_controller.update_metric(metric_id, payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/metrics/{metric_id}")
def delete_metric(metric_id: int):
    """Delete a metric"""
    try:
        return metric_controller.delete_metric(metric_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/athletes/{athlete_id}/metrics")
def get_athlete_metrics(athlete_id: int):
    """Get all metrics for an athlete with calculated aggregated values"""
    try:
        return metric_controller.get_athlete_metrics(athlete_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/formulas")
def get_all_formulas():
    """Get all formulas"""
    try:
        return metric_controller.get_all_formulas()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/athlete-metrics")
def get_all_athlete_metrics():
    """Get all athlete metrics"""
    try:
        return metric_controller.get_all_athlete_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/athlete-metrics")
def create_athlete_metric(payload: AthleteMetricCreate):
    """Create a new athlete metric"""
    try:
        return metric_controller.create_athlete_metric(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/athlete-metrics/{athlete_metric_id}")
def update_athlete_metric(athlete_metric_id: int, payload: AthleteMetricUpdate):
    """Update an athlete metric"""
    try:
        return metric_controller.update_athlete_metric(athlete_metric_id, payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
