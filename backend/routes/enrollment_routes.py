from fastapi import APIRouter, HTTPException
from models.enrollment_models import EnrollmentBase, EnrollmentCreate, EnrollmentUpdate
from controllers.enrollment_controller import EnrollmentController

api_enrollments = APIRouter(prefix="/enrollments", tags=["Enrollments"])

@api_enrollments.get("/")
def get_all_enrollments():
    """Return all enrollments"""
    try:
        controller = EnrollmentController()
        result = controller.get_all_enrollments()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_enrollments.get("/{enrollment_id}")
def get_enrollment(enrollment_id: int):
    """Returns an enrollment by ID"""
    try:
        controller = EnrollmentController()
        result = controller.get_enrollment_by_id(enrollment_id)
        if not result.data:
            raise HTTPException(status_code=404, detail="Enrollment not found")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_enrollments.get("/team/{team_id}")
def get_enrollments_by_team(team_id: int):
    """Returns all enrollments of a team"""
    try:
        controller = EnrollmentController()
        result = controller.get_enrollments_by_team(team_id)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_enrollments.get("/athlete/{athlete_id}")
def get_enrollments_by_athlete(athlete_id: int):
    """Returns all enrollments of an athlete"""
    try:
        controller = EnrollmentController()
        result = controller.get_enrollments_by_athlete(athlete_id)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_enrollments.post("/", status_code=201)
def create_enrollment(enrollment: EnrollmentCreate):
    """Creates a new enrollment"""
    try:
        controller = EnrollmentController()
        result = controller.create_enrollment(enrollment)
        return result.data[0] if result.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_enrollments.put("/{enrollment_id}")
def update_enrollment(enrollment_id: int, enrollment: EnrollmentUpdate):
    """Updates an enrollment"""
    try:
        controller = EnrollmentController()
        result = controller.update_enrollment(enrollment_id, enrollment)
        if not result.data:
            raise HTTPException(status_code=404, detail="Enrollment not found")
        return result.data[0] if result.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_enrollments.delete("/{enrollment_id}", status_code=204)
def delete_enrollment(enrollment_id: int):
    """Deletes an enrollment"""
    try:
        controller = EnrollmentController()
        controller.delete_enrollment(enrollment_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))