import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.auth import router as auth_router
from app.api.comments import router as comments_router
from app.api.follows import router as follows_router
from app.api.likes import router as likes_router
from app.api.posts import router as posts_router
from app.api.users import router as users_router
from app.config import get_settings
from app.database import close_db, db_manager, init_db
from app.utils.exceptions import VibeGramException
from app.utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing VibeGram application...")
    await init_db()
    yield
    # Shutdown
    logger.info("Shutting down VibeGram application...")
    await close_db()


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="VibeGram API",
        description="Production-Quality 3-Tier Social Media Platform API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # 1. CORS Configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 2. Timing & Logging Middleware
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        response.headers["X-Process-Time"] = f"{process_time:.2f}ms"
        if request.url.path != "/health":
            logger.info(f"{request.method} {request.url.path} - {response.status_code} ({process_time:.2f}ms)")
        return response

    # 3. Custom Exception Handlers
    @app.exception_handler(VibeGramException)
    async def vibegram_exception_handler(request: Request, exc: VibeGramException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "details": exc.details,
                }
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        details = []
        for error in exc.errors():
            loc = " -> ".join([str(x) for x in error.get("loc", [])])
            details.append({"field": loc, "message": error.get("msg", "Validation error")})
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Invalid request payload or query parameters",
                    "details": details,
                }
            },
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled server error on {request.method} {request.url.path}: {exc}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred. Please try again later.",
                }
            },
        )

    # 4. Health Check Endpoint
    @app.get("/health", tags=["Health"], summary="Application and Database health check")
    async def health_check():
        db_status = "disconnected"
        if db_manager.db is not None:
            try:
                await db_manager.db.command("ping")
                db_status = "connected"
            except Exception:
                db_status = "unhealthy"

        return {
            "status": "healthy",
            "app": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "environment": settings.ENVIRONMENT,
            "database": db_status,
        }

    # 5. Include API Routers
    api_prefix = settings.API_V1_PREFIX
    app.include_router(auth_router, prefix=api_prefix)
    app.include_router(users_router, prefix=api_prefix)
    app.include_router(posts_router, prefix=api_prefix)
    app.include_router(comments_router, prefix=api_prefix)
    app.include_router(likes_router, prefix=api_prefix)
    app.include_router(follows_router, prefix=api_prefix)

    return app


app = create_app()
