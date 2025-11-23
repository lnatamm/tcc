from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ExerciseStatsBase(BaseModel):
    sets: Optional[int] = None
    reps: Optional[int] = None
    goal: Optional[int] = None
    concluded_reps: Optional[int] = None
    concluded_sets: Optional[int] = None
    concluded_goal: Optional[int] = None


class ExerciseStatsCreate(ExerciseStatsBase):
    start_date: datetime = Field(default_factory=datetime.now)


class ExerciseStatsUpdate(BaseModel):
    concluded_reps: Optional[int] = None
    concluded_sets: Optional[int] = None
    concluded_goal: Optional[int] = None
    end_date: Optional[datetime] = None


class ExerciseStatsResponse(ExerciseStatsBase):
    id: int
    start_date: datetime
    end_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class ExerciseHistoryBase(BaseModel):
    id_exercise_stats: int
    id_routine_has_exercise: int
    status: str  # 'IN PROGRESS' or 'COMPLETED'
    created_by: str


class ExerciseHistoryCreate(ExerciseHistoryBase):
    created_at: datetime = Field(default_factory=datetime.now)


class ExerciseHistoryUpdate(BaseModel):
    status: Optional[str] = None
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None


class ExerciseHistoryResponse(ExerciseHistoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None
    deleted_at: Optional[datetime] = None
    deleted_by: Optional[str] = None

    class Config:
        from_attributes = True


class StartExerciseRequest(BaseModel):
    id_routine_has_exercise: int
    created_by: str = "system"


class StartExerciseResponse(BaseModel):
    exercise_stats: ExerciseStatsResponse
    exercise_history: ExerciseHistoryResponse


class UpdateExerciseProgressRequest(BaseModel):
    concluded_reps: Optional[int] = None
    concluded_sets: Optional[int] = None
    concluded_goal: Optional[int] = None
    updated_by: str = "system"


class EndExerciseRequest(BaseModel):
    concluded_reps: Optional[int] = None
    concluded_sets: Optional[int] = None
    concluded_goal: Optional[int] = None
    updated_by: str = "system"


class TodayExerciseResponse(BaseModel):
    id: int
    routine_has_exercise_id: int
    exercise: dict
    days_of_week: str
    start_hour: str
    end_hour: str
    status: Optional[str] = None  # 'NOT STARTED', 'IN PROGRESS', 'COMPLETED'
    exercise_history_id: Optional[int] = None
    exercise_stats_id: Optional[int] = None
    sets: Optional[int] = None
    reps: Optional[int] = None
    goal: Optional[int] = None
    concluded_sets: Optional[int] = None
    concluded_reps: Optional[int] = None
    concluded_goal: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
