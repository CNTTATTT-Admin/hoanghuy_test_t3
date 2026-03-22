"""FastAPI Application Entry Point"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import uvicorn
from contextlib import asynccontextmanager

from api.transactions import router as transactions_router
from api.alerts import router as alerts_router
from api.users import router as users_router
from logger import setup_logging
from notifier import get_notifier

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting Fraud Detection API")
    notifier = get_notifier()
    await notifier.initialize()

    # Print startup message
    print("\n" + "="*60)
    print("🎉 Fraud Detection API started successfully!")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🏥 Health Check: http://localhost:8000/health")
    print("🔍 Root Endpoint: http://localhost:8000/")
    print("="*60 + "\n")

    yield

    # Shutdown
    logger.info("Shutting down Fraud Detection API")
    await notifier.cleanup()

# Create FastAPI app
app = FastAPI(
    title="Fraud Detection API",
    description="API để phát hiện gian lận giao dịch tài chính sử dụng Machine Learning",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    transactions_router,
    prefix="/api/v1",
    tags=["transactions"]
)

app.include_router(
    alerts_router,
    prefix="/api/v1",
    tags=["alerts"]
)

app.include_router(
    users_router,
    prefix="/api/v1",
    tags=["users"]
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Fraud Detection API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred"
        }
    )

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*50)
    print("🚀 Fraud Detection API is starting...")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🏥 Health Check: http://localhost:8000/health")
    print("="*50 + "\n")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)