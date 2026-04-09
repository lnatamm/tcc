from fastapi import APIRouter, HTTPException
from models.user_models import UserCreate, UserLogin, UserRegister, UserResponse
from integrations.supabase_integration import SupabaseIntegration
from models.athlete_models import AthleteCreate
from models.coach_models import CoachCreate
from datetime import datetime

api_auth = APIRouter(prefix="/auth", tags=["Auth"])


@api_auth.post("/login", response_model=UserResponse)
def login(user_login: UserLogin):
    """Authenticate a user by usuario/email and senha."""
    try:
        integration = SupabaseIntegration()
        result = integration.get_user_by_identifier(user_login.identifier)
        if not result.data:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        user_record = result.data[0]
        if user_record.get("senha") != user_login.senha:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Update last access timestamp and return it
        update_result = integration.update_user_last_access(user_record.get("id"))
        updated_access = None
        if update_result.data and len(update_result.data) > 0:
            updated_access = update_result.data[0].get("ultimo_acesso")

        user_type_name = None
        try:
            type_result = integration.get_user_type_by_id(user_record.get("id_user_type"))
            if type_result.data:
                user_type_name = (type_result.data[0].get("name") or "").strip().lower() or None
        except Exception:
            # Non-fatal: keep backward compatibility even if lookup fails
            user_type_name = None

        return {
            "id": user_record.get("id"),
            "usuario": user_record.get("usuario"),
            "email": user_record.get("email"),
            "nome": user_record.get("nome"),
            "id_user_type": user_record.get("id_user_type"),
            "user_type_name": user_type_name,
            "ultimo_acesso": updated_access or user_record.get("ultimo_acesso"),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_auth.post("/register", response_model=UserResponse, status_code=201)
def register(user_register: UserRegister):
    """Register a new user."""
    try:
        integration = SupabaseIntegration()
        existing = integration.get_user_by_identifier(user_register.usuario)
        if existing.data:
            raise HTTPException(status_code=409, detail="User already exists")

        # Also check by email
        existing_email = integration.get_user_by_identifier(user_register.email)
        if existing_email.data:
            raise HTTPException(status_code=409, detail="Email already in use")

        # Validate user type
        type_result = integration.get_user_type_by_id(user_register.id_user_type)
        if not type_result.data:
            raise HTTPException(status_code=400, detail="Invalid user type")

        type_name = (type_result.data[0].get("name") or "").strip().lower()
        if type_name not in {"athlete", "coach"}:
            raise HTTPException(status_code=400, detail="Unsupported user type")

        if type_name == "coach" and not user_register.id_level:
            raise HTTPException(status_code=400, detail="id_level is required for coach")

        user_create = UserCreate(
            usuario=user_register.usuario,
            email=user_register.email,
            nome=user_register.nome,
            senha=user_register.senha,
            id_user_type=user_register.id_user_type,
        )

        result = integration.create_user(user_create)
        if not result.data:
            raise HTTPException(status_code=500, detail="Unable to create user")

        created = result.data[0]

        # Create profile linked to the user (best-effort rollback if it fails)
        created_user_id = created.get("id")
        if not created_user_id:
            raise HTTPException(status_code=500, detail="Unable to create user")

        now = datetime.utcnow().isoformat()
        created_by = created.get("usuario") or str(created_user_id)

        try:
            if type_name == "athlete":
                profile_result = integration.create_athlete(
                    AthleteCreate(
                        name=created.get("nome"),
                        photo_path=None,
                        id_user=created_user_id,
                        created_at=now,
                        created_by=created_by,
                    )
                )
            else:
                profile_result = integration.create_coach(
                    CoachCreate(
                        name=created.get("nome"),
                        id_level=user_register.id_level,
                        photo_path=None,
                        id_user=created_user_id,
                        created_at=now,
                        created_by=created_by,
                    )
                )

            if not profile_result.data:
                raise Exception("Profile creation failed")
        except Exception as e:
            print(e)
            try:
                integration.delete_user(created_user_id)
            except Exception:
                pass
            raise HTTPException(status_code=500, detail="Unable to create profile")

        return {
            "id": created.get("id"),
            "usuario": created.get("usuario"),
            "email": created.get("email"),
            "nome": created.get("nome"),
            "id_user_type": created.get("id_user_type"),
            "user_type_name": type_name,
            "ultimo_acesso": created.get("ultimo_acesso"),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
