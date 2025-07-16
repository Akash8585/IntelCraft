from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from .models import UserCreate, UserOut, LoginRequest, Token
from .auth_service import auth_service
from backend.database.session import get_db

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=dict)
async def register(request: UserCreate, db: AsyncSession = Depends(get_db)):
    try:
        user, token, session_token = await auth_service.register_user(request, db)
        return {
            "user": UserOut.from_orm(user),
            "access_token": token.access_token,
            "token_type": token.token_type,
            "expires_in": token.expires_in,
            "session_token": session_token
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=dict)
async def login(request: LoginRequest, req: Request, db: AsyncSession = Depends(get_db)):
    try:
        user, token, session_token = await auth_service.login(request.email, request.password, req, db)
        return {
            "user": UserOut.from_orm(user),
            "access_token": token.access_token,
            "token_type": token.token_type,
            "expires_in": token.expires_in,
            "session_token": session_token
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/me", response_model=UserOut)
async def get_current_user(authorization: str = Header(None), db: AsyncSession = Depends(get_db)):
    user = await auth_service.get_current_user(authorization, db)
    return UserOut.from_orm(user)

@router.post("/logout")
async def logout(session_token: str, db: AsyncSession = Depends(get_db)):
    await auth_service.logout(session_token, db)
    return {"message": "Successfully logged out"}


 