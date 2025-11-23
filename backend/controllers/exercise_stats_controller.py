from fastapi import HTTPException, status
from integrations.supabase_integration import SupabaseIntegration
from datetime import datetime, date
from typing import List, Optional
from models.exercise_stats_models import (
    ExerciseStatsCreate,
    ExerciseStatsUpdate,
    ExerciseHistoryCreate,
    ExerciseHistoryUpdate,
    StartExerciseRequest,
    StartExerciseResponse,
    UpdateExerciseProgressRequest,
    EndExerciseRequest,
    TodayExerciseResponse
)


class ExerciseStatsController:
    def __init__(self):
        self.supabase_integration = SupabaseIntegration()
        self.supabase = self.supabase_integration.client

    def start_exercise(self, request: StartExerciseRequest) -> StartExerciseResponse:
        """
        Start an exercise by creating exercise_stats and exercise_history records.
        """
        try:
            # Get routine_has_exercise details
            routine_exercise_response = self.supabase.table("routine_has_exercise")\
                .select("*, exercise(*)")\
                .eq("id", request.id_routine_has_exercise)\
                .is_("deleted_at", "null")\
                .single()\
                .execute()

            if not routine_exercise_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Routine exercise not found"
                )

            routine_exercise = routine_exercise_response.data
            exercise = routine_exercise["exercise"]

            # Check if there's already an active exercise session
            existing_history = self.supabase.table("exercise_history")\
                .select("*, exercise_stats(*)")\
                .eq("id_routine_has_exercise", request.id_routine_has_exercise)\
                .eq("status", "IN PROGRESS")\
                .is_("deleted_at", "null")\
                .execute()

            if existing_history.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Exercise already in progress"
                )

            # Determine metrics based on exercise type
            exercise_type_id = exercise["id_type"]
            
            # Create exercise_stats
            stats_data = {
                "start_date": datetime.now().isoformat()
            }

            # Type 1: sets and reps, Type 2: goal
            if exercise_type_id == 1:
                stats_data["sets"] = exercise.get("sets")
                stats_data["reps"] = exercise.get("reps")
                stats_data["concluded_sets"] = 0
                stats_data["concluded_reps"] = 0
            elif exercise_type_id == 2:
                stats_data["goal"] = exercise.get("goal")
                stats_data["concluded_goal"] = 0

            stats_response = self.supabase.table("exercise_stats")\
                .insert(stats_data)\
                .execute()

            if not stats_response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create exercise stats"
                )

            exercise_stats = stats_response.data[0]

            # Create exercise_history
            history_data = {
                "id_exercise_stats": exercise_stats["id"],
                "id_routine_has_exercise": request.id_routine_has_exercise,
                "status": "IN PROGRESS",
                "created_at": datetime.now().isoformat(),
                "created_by": request.created_by
            }

            history_response = self.supabase.table("exercise_history")\
                .insert(history_data)\
                .execute()

            if not history_response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create exercise history"
                )

            exercise_history = history_response.data[0]

            return StartExerciseResponse(
                exercise_stats=exercise_stats,
                exercise_history=exercise_history
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error starting exercise: {str(e)}"
            )

    def update_exercise_progress(
        self,
        exercise_stats_id: int,
        request: UpdateExerciseProgressRequest
    ) -> dict:
        """
        Update exercise progress (concluded sets, reps, or goal).
        For Type 1 exercises, reps are calculated automatically as sets * reps_per_set.
        """
        try:
            update_data = {}

            # For Type 1 exercises (sets/reps), both should be provided together
            if request.concluded_sets is not None and request.concluded_reps is not None:
                update_data["concluded_sets"] = request.concluded_sets
                update_data["concluded_reps"] = request.concluded_reps
            elif request.concluded_goal is not None:
                # For Type 2 exercises (goal-based)
                update_data["concluded_goal"] = request.concluded_goal

            if not update_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No progress data provided"
                )

            response = self.supabase.table("exercise_stats")\
                .update(update_data)\
                .eq("id", exercise_stats_id)\
                .execute()

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Exercise stats not found"
                )

            return response.data[0]

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating exercise progress: {str(e)}"
            )

    def end_exercise(
        self,
        exercise_history_id: int,
        request: EndExerciseRequest
    ) -> dict:
        """
        End an exercise by updating exercise_stats with end_date and concluded values,
        and updating exercise_history status to COMPLETED.
        """
        try:
            # Get exercise_history to find exercise_stats_id
            history_response = self.supabase.table("exercise_history")\
                .select("*")\
                .eq("id", exercise_history_id)\
                .is_("deleted_at", "null")\
                .single()\
                .execute()

            if not history_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Exercise history not found"
                )

            exercise_history = history_response.data
            exercise_stats_id = exercise_history["id_exercise_stats"]

            # Update exercise_stats
            stats_update_data = {
                "end_date": datetime.now().isoformat()
            }

            if request.concluded_reps is not None:
                stats_update_data["concluded_reps"] = request.concluded_reps
            if request.concluded_sets is not None:
                stats_update_data["concluded_sets"] = request.concluded_sets
            if request.concluded_goal is not None:
                stats_update_data["concluded_goal"] = request.concluded_goal

            stats_response = self.supabase.table("exercise_stats")\
                .update(stats_update_data)\
                .eq("id", exercise_stats_id)\
                .execute()

            if not stats_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Exercise stats not found"
                )

            # Update exercise_history status
            history_update_data = {
                "status": "COMPLETED",
                "updated_at": datetime.now().isoformat(),
                "updated_by": request.updated_by
            }

            history_update_response = self.supabase.table("exercise_history")\
                .update(history_update_data)\
                .eq("id", exercise_history_id)\
                .execute()

            if not history_update_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Failed to update exercise history"
                )

            return {
                "exercise_stats": stats_response.data[0],
                "exercise_history": history_update_response.data[0]
            }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error ending exercise: {str(e)}"
            )

    def get_today_exercises(self, athlete_id: int) -> List[TodayExerciseResponse]:
        """
        Get all exercises scheduled for today for a specific athlete,
        including their status from exercise_history.
        """
        try:
            # Get current day of week
            today = date.today()
            day_of_week = today.strftime("%A").upper()  # MONDAY, TUESDAY, etc.

            # Get athlete's routines
            routines_response = self.supabase.table("routine")\
                .select("id")\
                .eq("id_athlete", athlete_id)\
                .is_("deleted_at", "null")\
                .execute()

            if not routines_response.data:
                return []

            routine_ids = [r["id"] for r in routines_response.data]

            # Get today's exercises from routine_has_exercise
            exercises_response = self.supabase.table("routine_has_exercise")\
                .select("*, exercise(*, type_exercise(*))")\
                .in_("id_routine", routine_ids)\
                .eq("days_of_week", day_of_week)\
                .is_("deleted_at", "null")\
                .execute()

            if not exercises_response.data:
                return []

            result = []

            for routine_exercise in exercises_response.data:
                # Check if there's an exercise_history for today
                history_response = self.supabase.table("exercise_history")\
                    .select("*, exercise_stats(*)")\
                    .eq("id_routine_has_exercise", routine_exercise["id"])\
                    .is_("deleted_at", "null")\
                    .order("created_at", desc=True)\
                    .limit(1)\
                    .execute()

                status = "NOT STARTED"
                exercise_history_id = None
                exercise_stats_id = None
                stats_data = {}

                if history_response.data:
                    history = history_response.data[0]
                    stats = history.get("exercise_stats")
                    
                    # Check if the history entry is from today
                    created_at = datetime.fromisoformat(history["created_at"].replace("Z", "+00:00"))
                    if created_at.date() == today:
                        status = history["status"]
                        exercise_history_id = history["id"]
                        exercise_stats_id = stats["id"] if stats else None
                        
                        if stats:
                            stats_data = {
                                "sets": stats.get("sets"),
                                "reps": stats.get("reps"),
                                "goal": stats.get("goal"),
                                "concluded_sets": stats.get("concluded_sets"),
                                "concluded_reps": stats.get("concluded_reps"),
                                "concluded_goal": stats.get("concluded_goal"),
                                "start_date": stats.get("start_date"),
                                "end_date": stats.get("end_date")
                            }

                exercise_data = {
                    "id": routine_exercise["exercise"]["id"],
                    "routine_has_exercise_id": routine_exercise["id"],
                    "exercise": routine_exercise["exercise"],
                    "days_of_week": routine_exercise["days_of_week"],
                    "start_hour": routine_exercise["start_hour"],
                    "end_hour": routine_exercise["end_hour"],
                    "status": status,
                    "exercise_history_id": exercise_history_id,
                    "exercise_stats_id": exercise_stats_id,
                    **stats_data
                }

                result.append(TodayExerciseResponse(**exercise_data))

            # Sort by start_hour
            result.sort(key=lambda x: x.start_hour)

            return result

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching today's exercises: {str(e)}"
            )
