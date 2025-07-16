import uuid
from datetime import datetime, timedelta
from fastapi import HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .models import UserCreate, Token
from ..database.models import User, Session
from .security import get_password_hash, verify_password, create_access_token, generate_session_token, hash_session_token

class AuthService:
    async def register_user(self, user_data: UserCreate, db: AsyncSession):
        # Check if user already exists
        result = await db.execute(select(User).where(User.email == user_data.email))
        existing_user = result.scalar_one_or_none()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        user = User(
            id=str(uuid.uuid4()),
            email=user_data.email,
            name=user_data.name,
            hashed_password=get_password_hash(user_data.password) if user_data.password else None,
            is_active=True,
            is_verified=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(user)
        await db.flush()
        # Create session
        session_token = generate_session_token()
        session = Session(
            id=str(uuid.uuid4()),
            user_id=user.id,
            session_token=hash_session_token(session_token),
            expires_at=datetime.utcnow() + timedelta(days=30),
            created_at=datetime.utcnow(),
            last_used=datetime.utcnow(),
        )
        db.add(session)
        await db.commit()
        await db.refresh(user)
        # Create JWT token
        jwt_token = create_access_token(data={"sub": user.id})
        token = Token(access_token=jwt_token)
        return user, token, session_token

    async def login(self, email: str, password: str, req: Request, db: AsyncSession):
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user or not user.hashed_password or not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if not user.is_active:
            raise HTTPException(status_code=401, detail="Account is deactivated")
        # Create JWT token
        jwt_token = create_access_token(data={"sub": user.id})
        token = Token(access_token=jwt_token)
        # Create session
        session_token = generate_session_token()
        session = Session(
            id=str(uuid.uuid4()),
            user_id=user.id,
            session_token=hash_session_token(session_token),
            expires_at=datetime.utcnow() + timedelta(days=30),
            created_at=datetime.utcnow(),
            last_used=datetime.utcnow(),
            user_agent=req.headers.get("user-agent"),
            ip_address=req.client.host if req.client else None
        )
        db.add(session)
        await db.commit()
        return user, token, session_token

    async def get_current_user(self, authorization: str, db: AsyncSession):
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Authentication required")
        token = authorization.split(" ")[1]
        from .security import verify_token
        token_data = verify_token(token)
        if not token_data:
            raise HTTPException(status_code=401, detail="Invalid token")
        result = await db.execute(select(User).where(User.id == token_data.user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user

    async def logout(self, session_token: str, db: AsyncSession):
        from .security import hash_session_token
        result = await db.execute(select(Session).where(Session.session_token == hash_session_token(session_token)))
        sessions = result.scalars().all()
        for session in sessions:
            await db.delete(session)
        await db.commit()
        return True

auth_service = AuthService() 