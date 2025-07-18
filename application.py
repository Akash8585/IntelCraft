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

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev port
        "https://your-vercel-domain.vercel.app",  # Replace with your actual Vercel domain
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

@app.post("/research")
async def research(data: ResearchRequest):
    """Simple research endpoint for testing"""
    try:
        logger.info(f"Received research request for {data.company}")
        job_id = str(uuid.uuid4())
        
        # Store job in memory
        job_status[job_id].update({
            "status": "processing",
            "company": data.company,
            "last_update": datetime.now().isoformat()
        })

        return {
            "status": "accepted",
            "job_id": job_id,
            "message": "Research request received (simplified mode)",
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)