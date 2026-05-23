from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional


# ----------------------
# Goal Type (goal_type)
# ----------------------


class GoalTypeParameterCreate(BaseModel):
    name: str
    description: Optional[str] = None
    created_at: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())
    created_by: Optional[str] = None


class GoalTypeParameterUpdate(BaseModel):
    name: str
    description: Optional[str] = None
    updated_at: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_by: Optional[str] = None


class GoalTypeParameterResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_at: str
    created_by: str
    updated_at: Optional[str] = None
    updated_by: Optional[str] = None
    deleted_at: Optional[str] = None
    deleted_by: Optional[str] = None


class GoalTypeParameterDelete(BaseModel):
    deleted_at: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())
    deleted_by: Optional[str] = None


# ---------
# KPI (kpi)
# ---------


class KpiParameterCreate(BaseModel):
    id_metric: int
    name: str
    description: Optional[str] = None
    created_at: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())
    created_by: Optional[str] = None


class KpiParameterUpdate(BaseModel):
    id_metric: int
    name: str
    description: Optional[str] = None
    updated_at: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_by: Optional[str] = None


class KpiParameterResponse(BaseModel):
    id: int
    id_metric: int
    name: str
    description: Optional[str] = None
    created_at: str
    created_by: str
    updated_at: Optional[str] = None
    updated_by: Optional[str] = None
    deleted_at: Optional[str] = None
    deleted_by: Optional[str] = None


class KpiParameterDelete(BaseModel):
    deleted_at: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())
    deleted_by: Optional[str] = None


# ---------------------------
# Athlete KPI (athlete_has_kpi)
# ---------------------------


class AthleteHasKpiParameterCreate(BaseModel):
    id_kpi: int
    id_athlete: int
    id_goal_type: int
    goal_value: float
    goal_date: str
    created_at: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())
    created_by: Optional[str] = None


class AthleteHasKpiParameterUpdate(BaseModel):
    id_kpi: int
    id_athlete: int
    id_goal_type: int
    goal_value: float
    goal_date: str
    updated_at: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_by: Optional[str] = None


class AthleteHasKpiParameterResponse(BaseModel):
    id: int
    id_kpi: int
    id_athlete: int
    id_goal_type: int
    goal_value: float
    goal_date: str
    created_at: str
    created_by: str
    updated_at: Optional[str] = None
    updated_by: Optional[str] = None
    deleted_at: Optional[str] = None
    deleted_by: Optional[str] = None


class AthleteHasKpiParameterDelete(BaseModel):
    deleted_at: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())
    deleted_by: Optional[str] = None


# ----------------------------------
# Dashboard-specific computed response
# ----------------------------------


class AthleteKpiProgressResponse(BaseModel):
    athlete_kpi_id: int
    kpi_id: int
    kpi_name: str
    kpi_description: Optional[str] = None

    metric_id: int
    metric_name: Optional[str] = None

    id_goal_type: int
    goal_type_name: Optional[str] = None

    goal_value: float
    goal_date: str

    current_value: Optional[float] = None
    achieved: bool
    progress_percent: float
