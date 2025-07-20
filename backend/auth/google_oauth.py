import os
import uuid
import httpx
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy import select
from ..database.models import User, OAuthAccount, Session
from .security import create_access_token, generate_session_token, hash_session_token
from .models import Token

# Set up logging
logger = logging.getLogger(__name__)

class GoogleOAuth:
    def __init__(self):
        self.client_id = os.getenv("GOOGLE_CLIENT_ID")
        self.client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        # Use environment variable or default to standard format
        self.redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "https://intelcraft.onrender.com/api/auth/google/callback")

        logger.info(f"Google OAuth initialized with client_id: {self.client_id[:10] if self.client_id else 'None'}...")
        logger.info(f"Google OAuth redirect_uri: {self.redirect_uri}")

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
        logger.info(f"Google OAuth redirect_uri: {self.redirect_uri}")
        logger.info(f"Google OAuth client_id: {self.client_id[:10]}...")
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"https://accounts.google.com/o/oauth2/v2/auth?{query_string}"

    async def exchange_code_for_tokens(self, code: str) -> Dict[str, Any]:
        """Exchange code for access and refresh tokens"""
        try:
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
                    timeout=30
                )

                logger.info(f"Token exchange response status: {response.status_code}")
                
                if response.status_code != 200:
                    logger.error(f"Token exchange failed: {response.text}")
                    raise HTTPException(status_code=400, detail=f"Failed to exchange code for tokens: {response.text}")

                return response.json()
        except httpx.TimeoutException:
            logger.error("Token exchange timeout")
            raise HTTPException(status_code=408, detail="Token exchange timeout")
        except Exception as e:
            logger.error(f"Token exchange error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Token exchange error: {str(e)}")

    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Fetch user profile info using access token"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"},
                    timeout=30
                )

                logger.info(f"User info response status: {response.status_code}")
                
                if response.status_code != 200:
                    logger.error(f"User info fetch failed: {response.text}")
                    raise HTTPException(status_code=400, detail="Failed to get user info from Google")

                return response.json()
        except httpx.TimeoutException:
            logger.error("User info fetch timeout")
            raise HTTPException(status_code=408, detail="User info fetch timeout")
        except Exception as e:
            logger.error(f"User info fetch error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"User info fetch error: {str(e)}")

    async def authenticate_user(self, code: str, db) -> tuple[User, Token, str]:
        """Authenticate or create a user from Google login"""
        try:
            logger.info("Starting Google OAuth authentication")
            
            # Step 1: Exchange code for tokens
            logger.info("Exchanging code for tokens...")
            tokens = await self.exchange_code_for_tokens(code)
            access_token = tokens["access_token"]
            logger.info("Token exchange successful")
            
            # Step 2: Get user info from Google
            logger.info("Fetching user info from Google...")
            user_info = await self.get_user_info(access_token)
            logger.info(f"User info received for email: {user_info.get('email', 'unknown')}")
            
            # Step 3: Check if user exists
            logger.info("Checking if user exists in database...")
            result = await db.execute(select(User).where(User.email == user_info["email"]))
            user = result.scalar_one_or_none()

            if user:
                logger.info(f"Existing user found: {user.email}")
                # Update existing user's OAuth account
                result = await db.execute(select(OAuthAccount).where(OAuthAccount.user_id == user.id))
                oauth_account = result.scalar_one_or_none()

                if oauth_account:
                    logger.info("Updating existing OAuth account")
                    oauth_account.access_token = access_token
                    oauth_account.refresh_token = tokens.get("refresh_token")
                    oauth_account.updated_at = datetime.utcnow()
                else:
                    logger.info("Creating new OAuth account for existing user")
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
                logger.info("Creating new user")
                # Create new user
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
                logger.info(f"New user created with ID: {user.id}")

                # Create OAuth account for new user
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
                logger.info("OAuth account created for new user")

            # Step 4: Create session
            logger.info("Creating session...")
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

            # Step 5: Commit all changes
            logger.info("Committing database changes...")
            await db.commit()
            await db.refresh(user)
            logger.info("Database changes committed successfully")

            # Step 6: Create JWT token
            logger.info("Creating JWT token...")
            jwt_token = create_access_token(data={"sub": user.id})
            token = Token(
                access_token=jwt_token,
                expires_in=60 * 60  # 1 hour
            )
            logger.info("JWT token created successfully")

            logger.info(f"Google OAuth authentication completed successfully for user: {user.email}")
            return user, token, session_token

        except Exception as e:
            logger.error(f"Google OAuth authentication failed: {str(e)}", exc_info=True)
            try:
                await db.rollback()
                logger.info("Database rollback completed")
            except Exception as rollback_error:
                logger.error(f"Database rollback failed: {str(rollback_error)}")
            
            # Re-raise the exception with more context
            if "Failed to exchange code for tokens" in str(e):
                raise HTTPException(status_code=400, detail="Invalid authorization code or OAuth configuration")
            elif "Failed to get user info" in str(e):
                raise HTTPException(status_code=400, detail="Failed to retrieve user information from Google")
            else:
                raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")
