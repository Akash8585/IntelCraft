import os
import logging
from fastapi import APIRouter, HTTPException, status, Request, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from .google_oauth import GoogleOAuth
from ..database.session import get_db
from .models import Token
import asyncio

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["oauth"])
old_callback_router = APIRouter(tags=["oauth"])  # Legacy path

# Initialize Google OAuth
try:
    google_oauth = GoogleOAuth()
    logger.info("Google OAuth initialized successfully")
except ValueError as e:
    logger.error(f"Google OAuth not configured: {e}")
    google_oauth = None


@router.get("/google/authorize")
async def google_authorize():
    """Redirects to Google's OAuth consent screen."""
    if not google_oauth:
        logger.error("Google OAuth not configured")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth not configured"
        )
    
    # Debug logging
    frontend_url = os.getenv("FRONTEND_URL", "https://intel-craft.vercel.app")
    logger.info(f"Frontend URL configured: {frontend_url}")
    logger.info(f"Google redirect URI: {google_oauth.redirect_uri}")
    
    try:
        auth_url = google_oauth.get_authorization_url()
        logger.info(f"Generated authorization URL: {auth_url[:100]}...")
        return {"auth_url": auth_url}
    except Exception as e:
        logger.error(f"Failed to generate authorization URL: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate authorization URL")


@router.get("/google/callback")
async def google_callback(code: str, request: Request, db: AsyncSession = Depends(get_db)):
    """Handles the OAuth callback from Google."""
    if not google_oauth:
        logger.error("Google OAuth not configured")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth not configured"
        )

    logger.info(f"Google OAuth callback received with code: {code[:20]}...")
    logger.info(f"Redirect URI configured: {google_oauth.redirect_uri}")
    logger.info(f"Request URL: {request.url}")
    logger.info(f"Request headers: {dict(request.headers)}")

    # Try to authenticate user with retries
    max_retries = 3
    for attempt in range(max_retries):
        try:
            logger.info(f"Attempting Google OAuth authentication (attempt {attempt + 1}/{max_retries})")
            
            user, token, session_token = await google_oauth.authenticate_user(code, db)
            
            # Success - redirect to frontend with tokens
            frontend_url = os.getenv("FRONTEND_URL", "https://intel-craft.vercel.app")
            redirect_url = f"{frontend_url}/auth/callback?access_token={token.access_token}&session_token={session_token}"

            logger.info(f"Google OAuth successful for user: {user.email} (attempt {attempt + 1})")
            logger.info(f"Redirecting to frontend: {redirect_url}")
            return RedirectResponse(url=redirect_url)

        except HTTPException as http_e:
            logger.error(f"Google OAuth HTTP error (attempt {attempt + 1}): {http_e.detail}")
            if attempt == max_retries - 1:
                # Last attempt failed, redirect to error page
                frontend_url = os.getenv("FRONTEND_URL", "https://intel-craft.vercel.app")
                error_url = f"{frontend_url}/auth/error?message={http_e.detail}"
                return RedirectResponse(url=error_url)
            await asyncio.sleep(1)
            continue
            
        except Exception as e:
            logger.error(f"Google OAuth error (attempt {attempt + 1}): {str(e)}", exc_info=True)
            
            # If it's a database error, try to rollback and continue
            if "Event loop is closed" in str(e) or "Database" in str(e):
                try:
                    await db.rollback()
                    logger.info("Database rollback completed")
                except Exception as rollback_error:
                    logger.error(f"Database rollback failed: {str(rollback_error)}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(2)  # Longer delay for database issues
                    continue
            
            if attempt < max_retries - 1:
                # Wait before retrying
                await asyncio.sleep(1)
                continue
            else:
                # All attempts failed, redirect to error page
                logger.error(f"Google OAuth failed after {max_retries} attempts")
                frontend_url = os.getenv("FRONTEND_URL", "https://intel-craft.vercel.app")
                error_url = f"{frontend_url}/auth/error?message=Authentication failed after multiple attempts"
                return RedirectResponse(url=error_url)


@router.get("/google/test")
async def google_oauth_test():
    """Test endpoint to check Google OAuth configuration"""
    try:
        if not google_oauth:
            return {
                "status": "error",
                "message": "Google OAuth not configured",
                "details": "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET"
            }
        
        return {
            "status": "ok",
            "message": "Google OAuth is configured",
            "client_id": f"{google_oauth.client_id[:10]}..." if google_oauth.client_id else None,
            "redirect_uri": google_oauth.redirect_uri,
            "frontend_url": os.getenv("FRONTEND_URL", "https://intel-craft.vercel.app")
        }
    except Exception as e:
        logger.error(f"OAuth test failed: {str(e)}")
        return {
            "status": "error",
            "message": "OAuth test failed",
            "details": str(e)
        }


@old_callback_router.get("/api/auth/callback/google")
async def google_callback_old(code: str, request: Request, db: AsyncSession = Depends(get_db)):
    """Legacy callback route still used by some old clients (e.g., hardcoded redirect URIs)."""
    logger.info(f"Old Google OAuth callback received with code: {code[:20]}...")
    return await google_callback(code, request, db)
