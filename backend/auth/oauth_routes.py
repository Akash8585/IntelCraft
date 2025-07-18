import os
from fastapi import APIRouter, HTTPException, status, Request, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from .google_oauth import GoogleOAuth
from ..database.session import get_db
from .models import Token
import asyncio

router = APIRouter(prefix="/oauth", tags=["oauth"])
old_callback_router = APIRouter(tags=["oauth"])  # Legacy path

# Initialize Google OAuth
try:
    google_oauth = GoogleOAuth()
except ValueError as e:
    print(f"Google OAuth not configured: {e}")
    google_oauth = None


@router.get("/google/authorize")
async def google_authorize():
    """Redirects to Google's OAuth consent screen."""
    if not google_oauth:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth not configured"
        )
    auth_url = google_oauth.get_authorization_url()
    return {"auth_url": auth_url}


@router.get("/google/callback")
async def google_callback(code: str, request: Request, db: AsyncSession = Depends(get_db)):
    """Handles the OAuth callback from Google."""
    if not google_oauth:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth not configured"
        )

    print(f"Google OAuth callback received with code: {code[:20]}...")
    print(f"Redirect URI configured: {google_oauth.redirect_uri}")

    # Try to authenticate user with retries
    max_retries = 3
    for attempt in range(max_retries):
        try:
            user, token, session_token = await google_oauth.authenticate_user(code, db)
            
            # Success - redirect to frontend with tokens
            frontend_url = os.getenv("FRONTEND_URL", "https://intel-craft.vercel.app")
            redirect_url = f"{frontend_url}/auth/callback?access_token={token.access_token}&session_token={session_token}"

            print(f"Google OAuth successful for user: {user.email} (attempt {attempt + 1})")
            print(f"Redirecting to frontend: {redirect_url}")
            return RedirectResponse(url=redirect_url)

        except Exception as e:
            print(f"Google OAuth error (attempt {attempt + 1}): {str(e)}")
            
            # If it's a database error, try to rollback and continue
            if "Event loop is closed" in str(e) or "Database" in str(e):
                try:
                    await db.rollback()
                except:
                    pass
                if attempt < max_retries - 1:
                    await asyncio.sleep(2)  # Longer delay for database issues
                    continue
            
            if attempt < max_retries - 1:
                # Wait before retrying
                await asyncio.sleep(1)
                continue
            else:
                # All attempts failed, redirect to error page
                print(f"Google OAuth failed after {max_retries} attempts")
                frontend_url = os.getenv("FRONTEND_URL", "https://intel-craft.vercel.app")
                error_url = f"{frontend_url}/auth/error?message=Authentication failed after multiple attempts"
                return RedirectResponse(url=error_url)


@old_callback_router.get("/api/auth/callback/google")
async def google_callback_old(code: str, request: Request, db: AsyncSession = Depends(get_db)):
    """Legacy callback route still used by some old clients (e.g., hardcoded redirect URIs)."""
    print(f"Old Google OAuth callback received with code: {code[:20]}...")
    return await google_callback(code, request, db)
