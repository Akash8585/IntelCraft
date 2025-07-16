from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class UserCreate(BaseModel):
    email: EmailStr
    password: Optional[str] = None  # Optional for Google
    name: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class User(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    is_verified: bool = False

    class Config:
        from_attributes = True


class UserInDB(User):
    hashed_password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600


class TokenData(BaseModel):
    user_id: Optional[str] = None


class Session(BaseModel):
    id: str
    user_id: str
    expires_at: datetime
    created_at: datetime
    last_used: datetime
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None 

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    is_verified: bool
    class Config:
        from_attributes = True 