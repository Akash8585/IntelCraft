from fastapi import APIRouter, HTTPException, status, Request, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from .google_oauth import GoogleOAuth
from ..database.session import get_db
from .models import Token

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

    try:
        user, token, session_token = await google_oauth.authenticate_user(code, db)

        # Redirect to frontend with tokens
        frontend_url = "http://localhost:5174"
        redirect_url = f"{frontend_url}/auth/callback?access_token={token.access_token}&session_token={session_token}"

        print(f"Google OAuth successful for user: {user.email}")
        print(f"Redirecting to frontend: {redirect_url}")
        return RedirectResponse(url=redirect_url)

    except Exception as e:
        print(f"Google OAuth error: {str(e)}")

        try:
            # Fallback: Temporary tokens
            from ..auth.security import create_access_token, generate_session_token
            jwt_token = create_access_token(data={"sub": "temp_google_user"})
            session_token = generate_session_token()

            token = Token(
                access_token=jwt_token,
                expires_in=60 * 60  # 1 hour
            )

            frontend_url = "http://localhost:5174"
            redirect_url = f"{frontend_url}/auth/callback?access_token={token.access_token}&session_token={session_token}"

            print(f"Using temporary tokens due to DB error. Redirecting to: {redirect_url}")
            return RedirectResponse(url=redirect_url)

        except Exception as fallback_error:
            print(f"Fallback error: {str(fallback_error)}")
            frontend_url = "http://localhost:5174"
            error_url = f"{frontend_url}/auth/error?message=Authentication failed"
            return RedirectResponse(url=error_url)


@old_callback_router.get("/api/auth/callback/google")
async def google_callback_old(code: str, request: Request, db: AsyncSession = Depends(get_db)):
    """Legacy callback route still used by some old clients (e.g., hardcoded redirect URIs)."""
    print(f"Old Google OAuth callback received with code: {code[:20]}...")
    return await google_callback(code, request, db)
