from fastapi import APIRouter, HTTPException
from models.user_models import UserCreate, UserLogin, UserResponse
from integrations.supabase_integration import SupabaseIntegration

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

        return {
            "id": user_record.get("id"),
            "usuario": user_record.get("usuario"),
            "email": user_record.get("email"),
            "nome": user_record.get("nome"),
            "tipo": user_record.get("tipo"),
            "ultimo_acesso": updated_access or user_record.get("ultimo_acesso"),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_auth.post("/register", response_model=UserResponse, status_code=201)
def register(user_create: UserCreate):
    """Register a new user."""
    try:
        integration = SupabaseIntegration()
        existing = integration.get_user_by_identifier(user_create.usuario)
        if existing.data:
            raise HTTPException(status_code=409, detail="User already exists")

        # Also check by email
        existing_email = integration.get_user_by_identifier(user_create.email)
        if existing_email.data:
            raise HTTPException(status_code=409, detail="Email already in use")

        result = integration.create_user(user_create)
        if not result.data:
            raise HTTPException(status_code=500, detail="Unable to create user")

        created = result.data[0]
        return {
            "id": created.get("id"),
            "usuario": created.get("usuario"),
            "email": created.get("email"),
            "nome": created.get("nome"),
            "tipo": created.get("tipo"),
            "ultimo_acesso": created.get("ultimo_acesso"),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
