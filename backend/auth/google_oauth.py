import os
import uuid
import httpx
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy import select
from ..database.models import User, OAuthAccount, Session
from .security import create_access_token, generate_session_token, hash_session_token
from .models import Token


class GoogleOAuth:
    def __init__(self):
        self.client_id = os.getenv("GOOGLE_CLIENT_ID")
        self.client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        # TEMPORARY: Hardcode the correct production redirect URI
        self.redirect_uri = "https://intelcraft.onrender.com/oauth/google/callback"

        if not self.client_id or not self.client_secret:
            raise ValueError("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are required")

    def get_authorization_url(self) -> str:
        """Generate Google OAuth authorization URL"""
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent",
        }
        
        # Debug logging
        print(f"Google OAuth redirect_uri: {self.redirect_uri}")
        print(f"Google OAuth client_id: {self.client_id[:10]}...")
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"https://accounts.google.com/o/oauth2/v2/auth?{query_string}"

    async def exchange_code_for_tokens(self, code: str) -> Dict[str, Any]:
        """Exchange code for access and refresh tokens"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": self.redirect_uri,
                },
                timeout=10
            )

            if response.status_code != 200:
                print("Token exchange failed:", response.text)
                raise HTTPException(status_code=400, detail="Failed to exchange code for tokens")

            return response.json()

    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Fetch user profile info using access token"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=10
            )

            if response.status_code != 200:
                print("User info fetch failed:", response.text)
                raise HTTPException(status_code=400, detail="Failed to get user info from Google")

            return response.json()

    async def authenticate_user(self, code: str, db) -> tuple[User, Token, str]:
        """Authenticate or create a user from Google login"""
        try:
            tokens = await self.exchange_code_for_tokens(code)
            access_token = tokens["access_token"]
            user_info = await self.get_user_info(access_token)

            result = await db.execute(select(User).where(User.email == user_info["email"]))
            user = result.scalar_one_or_none()

            if user:
                result = await db.execute(select(OAuthAccount).where(OAuthAccount.user_id == user.id))
                oauth_account = result.scalar_one_or_none()

                if oauth_account:
                    oauth_account.access_token = access_token
                    oauth_account.refresh_token = tokens.get("refresh_token")
                    oauth_account.updated_at = datetime.utcnow()
                else:
                    oauth_account = OAuthAccount(
                        id=str(uuid.uuid4()),
                        user_id=user.id,
                        provider="google",
                        provider_user_id=user_info["id"],
                        access_token=access_token,
                        refresh_token=tokens.get("refresh_token"),
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow(),
                    )
                    db.add(oauth_account)
            else:
                user = User(
                    id=str(uuid.uuid4()),
                    email=user_info["email"],
                    name=user_info.get("name"),
                    avatar_url=user_info.get("picture"),
                    is_active=True,
                    is_verified=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
                db.add(user)
                await db.flush()  # Ensure user.id is available

                oauth_account = OAuthAccount(
                    id=str(uuid.uuid4()),
                    user_id=user.id,
                    provider="google",
                    provider_user_id=user_info["id"],
                    access_token=access_token,
                    refresh_token=tokens.get("refresh_token"),
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
                db.add(oauth_account)

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

            jwt_token = create_access_token(data={"sub": user.id})
            token = Token(
                access_token=jwt_token,
                expires_in=60 * 60  # 1 hour
            )

            return user, token, session_token

        except Exception as e:
            try:
                await db.rollback()
            except:
                pass  # Ignore rollback errors
            print(f"Database error in Google OAuth: {str(e)}")
            raise HTTPException(status_code=500, detail="Authentication failed")
