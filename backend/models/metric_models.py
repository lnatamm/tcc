from pydantic import BaseModel
from typing import Optional, List
from models.crud_models import Create, Update, Response

class MetricBase(BaseModel):
    id_formula: Optional[int] = None
    id_coach: int
    id_sport: int
    ids_metrics: Optional[str] = None
    name: str
    description: Optional[str] = None
    aggregated: bool

class MetricCreate(MetricBase, Create):
    pass

class MetricUpdate(MetricBase, Update):
    pass

class Metric(MetricBase, Response):
    pass

class FormulaBase(BaseModel):
    name: str
    description: Optional[str] = None

class FormulaCreate(FormulaBase, Create):
    pass

class FormulaUpdate(FormulaBase, Update):
    pass

class Formula(FormulaBase, Response):
    pass

class AthleteMetricBase(BaseModel):
    id_metric: int
    id_athlete: int
    value: Optional[float] = None

class AthleteMetricCreate(AthleteMetricBase, Create):
    pass

class AthleteMetricUpdate(AthleteMetricBase, Update):
    pass

class AthleteMetric(AthleteMetricBase, Response):
    pass

class MetricWithValue(BaseModel):
    id: int
    id_formula: Optional[int] = None
    id_coach: int
    id_sport: int
    ids_metrics: Optional[str] = None
    name: str
    description: Optional[str] = None
    aggregated: bool
    value: Optional[float] = None
    created_at: str
