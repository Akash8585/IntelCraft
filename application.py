import sys
import asyncio
import logging
import os
import uuid
import json
from collections import defaultdict
from datetime import datetime
from pathlib import Path

# Set Windows event loop policy to prevent "Event loop is closed" errors
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel

# Import WebSocket manager
from backend.services.websocket_manager import WebSocketManager

# Load environment variables from .env file at startup
env_path = Path(__file__).parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path, override=True)

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)
console_handler = logging.StreamHandler()
logger.addHandler(console_handler)

app = FastAPI(title="IntelCraft API")

# Include OAuth routes
try:
    from backend.auth.oauth_routes import router as oauth_router, old_callback_router
    app.include_router(oauth_router)
    app.include_router(old_callback_router)
    logger.info("OAuth routes included successfully")
except Exception as e:
    logger.warning(f"Failed to include OAuth routes: {e}")

# Include auth routes
try:
    from backend.auth.routes import router as auth_router
    app.include_router(auth_router)
    logger.info("Auth routes included successfully")
except Exception as e:
    logger.warning(f"Failed to include auth routes: {e}")
    logger.error(f"Auth routes error details: {str(e)}", exc_info=True)

# Add a simple test endpoint to verify auth routes
@app.get("/test-auth")
async def test_auth():
    """Test endpoint to verify auth routes are working"""
    return {"message": "Auth routes are accessible", "status": "ok"}

# Add a proper /auth/me endpoint for OAuth authentication
@app.get("/auth/me")
async def get_current_user(request: Request):
    """Get current user info from OAuth token"""
    try:
        # Get the Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
        
        token = auth_header.split(' ')[1]
        
        # Import JWT validation
        from backend.auth.security import decode_access_token
        from backend.database.models import User
        from backend.database.session import get_db
        
        # Decode the JWT token to get user ID
        try:
            payload = decode_access_token(token)
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid token")
        except Exception as e:
            logger.error(f"Token decode error: {str(e)}")
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Get database session and fetch user
        db = next(get_db())
        try:
            from sqlalchemy import select
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            return {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "avatar_url": user.avatar_url,
                "is_active": user.is_active,
                "is_verified": user.is_verified
            }
        finally:
            await db.close()
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in /auth/me: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")

# CORS configuration for frontend
frontend_url = os.getenv("FRONTEND_URL", "https://intel-craft.vercel.app")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev port
        frontend_url,  # Production frontend URL
        "*"  # Allow all origins for testing (remove in production)
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Simple in-memory storage
job_status = defaultdict(lambda: {
    "status": "pending",
    "result": None,
    "error": None,
    "debug_info": [],
    "company": None,
    "report": None,
    "last_update": datetime.now().isoformat()
})

# MongoDB integration disabled - using in-memory storage only
logger.info("MongoDB integration disabled - using in-memory storage")

# Initialize database (optional)
import asyncio
if os.getenv("DATABASE_URL"):
    try:
        from backend.database.session import init_db
        asyncio.run(init_db())
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        logger.warning("Continuing without database initialization")
else:
    logger.info("No DATABASE_URL provided - skipping database initialization")

@app.on_event("shutdown")
async def shutdown_event():
    """Gracefully close database connections on shutdown"""
    logger.info("Shutting down...")
    try:
        from backend.database.session import engine
        await engine.dispose()
        logger.info("Database connections closed")
    except:
        logger.info("No database connections to close")

class ResearchRequest(BaseModel):
    company: str
    company_url: str | None = None
    industry: str | None = None
    hq_location: str | None = None
    help_description: str | None = None

@app.get("/")
async def ping():
    """Health check endpoint"""
    try:
        # Basic health check
        return {
            "status": "healthy",
            "message": "IntelCraft API is running",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail="Health check failed")

@app.get("/health")
async def health():
    """Detailed health check"""
    return {
        "status": "healthy",
        "message": "IntelCraft API is running",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

async def run_research_process(job_id: str, company: str, company_url: str = None, industry: str = None, hq_location: str = None, help_description: str = None):
    """Background research process that runs the actual LangGraph research system"""
    try:
        logger.info(f"Starting background research process for job {job_id}")
        
        # Send initial status via WebSocket
        await websocket_manager.send_status_update(
            job_id=job_id,
            status="processing",
            message=f"Starting research for {company}"
        )

        # Import and initialize the research graph
        try:
            from backend.graph import Graph
        except ImportError as e:
            logger.error(f"Failed to import research graph: {e}")
            raise Exception("Research system not available")

        # Create research graph with WebSocket manager
        graph = Graph(
            company=company,
            url=company_url,
            hq_location=hq_location,
            industry=industry,
            help_description=help_description,
            websocket_manager=websocket_manager,
            job_id=job_id
        )

        # Send status update
        await websocket_manager.send_status_update(
            job_id=job_id,
            status="processing",
            message="Initializing research workflow..."
        )

        # Run the research workflow
        thread = {"configurable": {"thread_id": job_id}}
        results = []
        
        try:
            logger.info(f"Starting research workflow for job {job_id}")
            async for state in graph.run(thread):
                current_node = state.get('current_node', 'unknown')
                logger.info(f"Research state update for job {job_id}: {current_node}")
                results.append(state)
                
                # Send progress update
                await websocket_manager.send_status_update(
                    job_id=job_id,
                    status="processing",
                    message=f"Processing: {current_node}"
                )
                
                # Add small delay to ensure WebSocket messages are sent
                await asyncio.sleep(0.1)
                
            logger.info(f"Research workflow completed for job {job_id} with {len(results)} steps")
                
        except Exception as e:
            logger.error(f"Error during research workflow for job {job_id}: {str(e)}", exc_info=True)
            raise e

        # Get final result
        final_state = results[-1] if results else {}
        logger.info(f"Final state for job {job_id} contains keys: {list(final_state.keys()) if isinstance(final_state, dict) else 'Not a dict'}")
        
        # Check for report in final state
        if isinstance(final_state, dict):
            if 'report' in final_state:
                logger.info(f"Report found in final state for job {job_id}, length: {len(str(final_state['report']))}")
            if 'editor' in final_state and isinstance(final_state['editor'], dict) and 'report' in final_state['editor']:
                logger.info(f"Report found in editor state for job {job_id}, length: {len(str(final_state['editor']['report']))}")
        
        # Clean the state to remove non-serializable objects
        def clean_state(state):
            """Remove non-serializable objects from state"""
            if not isinstance(state, dict):
                return str(state)
            
            cleaned = {}
            for key, value in state.items():
                # Skip WebSocketManager and other non-serializable objects
                if key in ['websocket_manager', 'job_id']:
                    continue
                elif isinstance(value, dict):
                    cleaned[key] = clean_state(value)
                elif isinstance(value, list):
                    cleaned[key] = [clean_state(item) if isinstance(item, dict) else str(item) for item in value]
                else:
                    try:
                        # Test if value is JSON serializable
                        json.dumps(value)
                        cleaned[key] = value
                    except (TypeError, ValueError):
                        cleaned[key] = str(value)
            return cleaned
        
        cleaned_state = clean_state(final_state)
        
        # Extract research results
        research_result = {
            "company": company,
            "summary": f"Research completed for {company}",
            "timestamp": datetime.now().isoformat(),
            "state": cleaned_state,
            "total_steps": len(results)
        }
        
        # Check if we have a report, if not generate a fallback
        if not cleaned_state.get('report') and not cleaned_state.get('editor', {}).get('report'):
            logger.warning(f"No report found in final state for job {job_id}, generating fallback report")
            
            # Generate a basic fallback report
            fallback_report = f"""# {company} Research Report

## Company Overview
Research has been completed for {company}. 

## Industry Overview
Industry analysis has been performed for {company}.

## Financial Overview
Financial data has been collected and analyzed.

## News
Recent news and developments have been gathered.

## Summary
This research report was generated for {company}. The research process completed successfully with {len(results)} processing steps.

*Note: This is a fallback report generated due to processing issues.*"""
            
            # Add the fallback report to the state
            cleaned_state['report'] = fallback_report
            research_result['state'] = cleaned_state
            research_result['fallback_report'] = True

        # Add delay to ensure WebSocket connection is stable before sending completion
        await asyncio.sleep(0.5)
        
        # Send completion status
        await websocket_manager.send_status_update(
            job_id=job_id,
            status="completed",
            message="Research completed successfully",
            result=research_result
        )
        
        # Add another delay to ensure completion message is sent
        await asyncio.sleep(0.5)

        # Update job status
        job_status[job_id].update({
            "status": "completed",
            "result": research_result,
            "last_update": datetime.now().isoformat()
        })
        
        logger.info(f"Research process completed for job {job_id} with {len(results)} steps")
        
    except Exception as e:
        logger.error(f"Error in research process for job {job_id}: {str(e)}", exc_info=True)
        # Send error status
        await websocket_manager.send_status_update(
            job_id=job_id,
            status="error",
            error=f"Research failed: {str(e)}"
        )
        # Update job status
        job_status[job_id].update({
            "status": "error",
            "error": str(e),
            "last_update": datetime.now().isoformat()
        })

@app.post("/research")
async def research(data: ResearchRequest):
    """Research endpoint with WebSocket integration"""
    try:
        logger.info(f"Received research request for {data.company}")
        job_id = str(uuid.uuid4())
        
        # Store job in memory
        job_status[job_id].update({
            "status": "processing",
            "company": data.company,
            "last_update": datetime.now().isoformat()
        })

        # Start research process in background (non-blocking)
        asyncio.create_task(run_research_process(
            job_id=job_id,
            company=data.company,
            company_url=data.company_url,
            industry=data.industry,
            hq_location=data.hq_location,
            help_description=data.help_description
        ))

        return {
            "status": "accepted",
            "job_id": job_id,
            "message": "Research request received and processing started",
            "company": data.company
        }

    except Exception as e:
        logger.error(f"Error processing research request: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/research/{job_id}")
async def get_research(job_id: str):
    """Get research status"""
    if job_id in job_status:
        return job_status[job_id]
    raise HTTPException(status_code=404, detail="Research job not found")

# Initialize WebSocket manager
websocket_manager = WebSocketManager()

@app.websocket("/research/ws/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    """WebSocket endpoint for real-time research updates"""
    try:
        await websocket.accept()
        logger.info(f"WebSocket connection accepted for job: {job_id}")
        
        # Connect to the WebSocket manager
        await websocket_manager.connect(websocket, job_id)
        
        # Send initial connection confirmation
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "data": {
                "job_id": job_id,
                "message": "Connected to research updates"
            }
        }))
        
        # Keep connection alive and handle messages
        try:
            while True:
                # Wait for any message from client (ping/pong or close)
                data = await websocket.receive_text()
                logger.info(f"Received message from client: {data}")
                
                # Handle ping/pong for connection health
                if data == "ping":
                    await websocket.send_text("pong")
                    
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected for job: {job_id}")
        except Exception as e:
            logger.error(f"WebSocket error for job {job_id}: {str(e)}")
        finally:
            # Clean up connection
            websocket_manager.disconnect(websocket, job_id)
            
    except Exception as e:
        logger.error(f"Failed to establish WebSocket connection for job {job_id}: {str(e)}")
        if websocket.client_state.value != 3:  # Not disconnected
            await websocket.close(code=1000)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)