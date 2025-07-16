import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from .models import Base

# Create async engine
database_url = os.getenv("DATABASE_URL")
if database_url and database_url.startswith("postgresql://"):
    # Convert to async URL and handle SSL parameters
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    # Remove problematic parameters that asyncpg doesn't handle well
    if "?" in database_url:
        base_url = database_url.split("?")[0]
        params = database_url.split("?")[1].split("&")
        # Filter out problematic parameters
        filtered_params = []
        for param in params:
            if not any(param.startswith(prefix) for prefix in ["sslmode=", "channel_binding=", "application_name="]):
                filtered_params.append(param)
        
        if filtered_params:
            database_url = f"{base_url}?{'&'.join(filtered_params)}"
        else:
            database_url = base_url

engine = create_async_engine(
    database_url,
    echo=False,  # Set to True for SQL debugging
    pool_pre_ping=True,
    pool_recycle=300,
    # Add SSL context for managed databases if needed
    connect_args={
        "server_settings": {
            "application_name": "IntelCraft"
        }
    }
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db():
    """Dependency to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def close_db():
    """Close database connections"""
    await engine.dispose() 