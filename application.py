import sys
import asyncio
import logging
import os
import uuid
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

from backend.graph import Graph
from backend.services.websocket_manager import WebSocketManager
from backend.database.session import init_db, engine
from backend.auth.routes import router as auth_router
from backend.auth.oauth_routes import router as oauth_router, old_callback_router

# Load environment variables from .env file at startup
env_path = Path(__file__).parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path, override=True)

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)
console_handler = logging.StreamHandler()
logger.addHandler(console_handler)

app = FastAPI(title="Tavily Company Research API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include authentication routes
app.include_router(auth_router)
app.include_router(oauth_router)
app.include_router(old_callback_router)

manager = WebSocketManager()

job_status = defaultdict(lambda: {
    "status": "pending",
    "result": None,
    "error": None,
    "debug_info": [],
    "company": None,
    "report": None,
    "last_update": datetime.now().isoformat()
})

mongodb = None
# MongoDB integration disabled - using in-memory storage only
logger.info("MongoDB integration disabled - using in-memory storage")

# Initialize database (optional)
import asyncio
if os.getenv("DATABASE_URL"):
    try:
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
    await engine.dispose()
    logger.info("Database connections closed")

class ResearchRequest(BaseModel):
    company: str
    company_url: str | None = None
    industry: str | None = None
    hq_location: str | None = None
    help_description: str | None = None

@app.options("/research")
async def preflight():
    response = JSONResponse(content=None, status_code=200)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

@app.post("/research")
async def research(
    data: ResearchRequest,
    authorization: str = Header(None)
):
    # Verify user is authenticated
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    
    token = authorization.split(" ")[1]
    from backend.auth.security import verify_token
    token_data = verify_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Get user from database
    from backend.database.models import User
    from backend.database.session import get_db
    from sqlalchemy import select
    
    try:
        async for db in get_db():
            result = await db.execute(select(User).where(User.id == token_data.user_id))
            user_data = result.scalar_one_or_none()
            
            if not user_data:
                raise HTTPException(status_code=401, detail="User not found")
            
            user = {"id": user_data.id, "email": user_data.email}
            break
    except Exception as e:
        logger.error(f"Database error in research endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Database connection error")
    try:
        logger.info(f"Received research request for {data.company} from user {user['id']}")
        job_id = str(uuid.uuid4())
        asyncio.create_task(process_research(job_id, data, user['id']))

        response = JSONResponse(content={
            "status": "accepted",
            "job_id": job_id,
            "message": "Research started. Connect to WebSocket for updates.",
            "websocket_url": f"/research/ws/{job_id}"
        })
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    except Exception as e:
        logger.error(f"Error initiating research: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

async def process_research(job_id: str, data: ResearchRequest, user_id: str):
    try:
        # Store job in memory (MongoDB disabled)
        job_status[job_id].update({
            "status": "processing",
            "company": data.company,
            "last_update": datetime.now().isoformat()
        })
        await asyncio.sleep(1)  # Allow WebSocket connection

        await manager.send_status_update(job_id, status="processing", message="Starting research")

        graph = Graph(
            company=data.company,
            url=data.company_url,
            industry=data.industry,
            hq_location=data.hq_location,
            help_description=data.help_description,
            websocket_manager=manager,
            job_id=job_id
        )

        state = {}
        async for s in graph.run(thread={}):
            state.update(s)
        
        # Look for the compiled report in either location.
        report_content = state.get('report') or (state.get('editor') or {}).get('report')
        if report_content:
            logger.info(f"Found report in final state (length: {len(report_content)})")
            job_status[job_id].update({
                "status": "completed",
                "report": report_content,
                "company": data.company,
                "last_update": datetime.now().isoformat()
            })
            # Update job status in memory (MongoDB disabled)
            await manager.send_status_update(
                job_id=job_id,
                status="completed",
                message="Research completed successfully",
                result={
                    "report": report_content,
                    "company": data.company
                }
            )
        else:
            logger.error(f"Research completed without finding report. State keys: {list(state.keys())}")
            logger.error(f"Editor state: {state.get('editor', {})}")
            
            # Check if there was a specific error in the state
            error_message = "No report found"
            if error := state.get('error'):
                error_message = f"Error: {error}"
            
            await manager.send_status_update(
                job_id=job_id,
                status="failed",
                message="Research completed but no report was generated",
                error=error_message
            )

    except Exception as e:
        logger.error(f"Research failed: {str(e)}")
        await manager.send_status_update(
            job_id=job_id,
            status="failed",
            message=f"Research failed: {str(e)}",
            error=str(e)
        )
        # Update job status in memory (MongoDB disabled)
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

@app.websocket("/research/ws/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    try:
        await websocket.accept()
        await manager.connect(websocket, job_id)

        if job_id in job_status:
            status = job_status[job_id]
            await manager.send_status_update(
                job_id,
                status=status["status"],
                message="Connected to status stream",
                error=status["error"],
                result=status["result"]
            )

        while True:
            try:
                await websocket.receive_text()
            except WebSocketDisconnect:
                manager.disconnect(websocket, job_id)
                break

    except Exception as e:
        logger.error(f"WebSocket error for job {job_id}: {str(e)}", exc_info=True)
        manager.disconnect(websocket, job_id)

@app.get("/research/{job_id}")
async def get_research(job_id: str):
    if job_id in job_status:
        return job_status[job_id]
    raise HTTPException(status_code=404, detail="Research job not found")

@app.get("/research/{job_id}/report")
async def get_research_report(job_id: str):
    if job_id in job_status:
        result = job_status[job_id]
        if report := result.get("report"):
            return {"report": report}
    raise HTTPException(status_code=404, detail="Report not found")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)