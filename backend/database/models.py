from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(255), primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255))
    hashed_password = Column(String(255))  # For email/password auth
    avatar_url = Column(String(500))  # For Google OAuth
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    oauth_accounts = relationship("OAuthAccount", back_populates="user", cascade="all, delete-orphan")

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(String(255), primary_key=True)
    user_id = Column(String(255), ForeignKey("users.id"), nullable=False, index=True)
    session_token = Column(String(255), nullable=False)
    expires_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_used = Column(DateTime, default=datetime.utcnow, nullable=False)
    user_agent = Column(String(500))
    ip_address = Column(String(45))
    
    # Relationships
    user = relationship("User", back_populates="sessions")

class OAuthAccount(Base):
    __tablename__ = "oauth_accounts"
    
    id = Column(String(255), primary_key=True)
    user_id = Column(String(255), ForeignKey("users.id"), nullable=False, index=True)
    provider = Column(String(50), nullable=False)  # "google"
    provider_user_id = Column(String(255), nullable=False, index=True)
    access_token = Column(Text)
    refresh_token = Column(Text)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="oauth_accounts") 