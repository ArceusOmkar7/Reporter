"""
Reporter API: FastAPI application factory module

This module contains the application factory that creates and configures the FastAPI application.
It sets up middleware, route handlers, exception handlers, and static file serving.
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from .config.config import Config
import os
from datetime import datetime
from .utils.database import init_database
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database before application starts
    print("FastAPI startup: Initializing database...")
    init_database()
    yield
    # Shutdown: Code to run when application is shutting down
    print("FastAPI shutdown: Cleaning up resources...")


def create_app():
    """
    FastAPI application factory

    Creates and configures a FastAPI application instance with all necessary middleware,
    routes, and exception handlers.

    Returns:
        FastAPI: Configured FastAPI application instance
    """
    app = FastAPI(
        title="Reporter API",
        description="API for Reporter application - Public API with no authentication requirements",
        version="1.0.0",
        lifespan=lifespan,
        openapi_tags=[
            {"name": "Authentication",
                "description": "Simple username/password login (no JWT tokens)"},
            {"name": "Users", "description": "Public user management endpoints"},
            {"name": "Reports", "description": "Report management endpoints"},
            {"name": "Categories", "description": "Category management endpoints"},
            {"name": "Locations", "description": "Location management endpoints"},
            {"name": "Images", "description": "Image management endpoints"},
            {"name": "Votes", "description": "Voting endpoints"},
            {"name": "Test", "description": "Test endpoints for system verification"}
        ]
    )

    # Ensure upload directory exists
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

    # Mount static file server for uploads
    # This makes uploaded files accessible via HTTP at /backend/uploads/filename
    app.mount("/backend/uploads",
              StaticFiles(directory=Config.UPLOAD_FOLDER), name="uploads")

    # Enable CORS for API routes
    # This allows frontend applications running on localhost:8080 to make requests to this API
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:8080"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add test endpoint at base URL
    @app.get("/", tags=["Test"], summary="API Health Check")
    async def test_endpoint():
        """
        Simple test endpoint to verify the API is running

        Returns basic information about the API status
        """
        return {
            "status": "online",
            "message": "Reporter API is running",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0",
            "documentation": "/docs"
        }

    # Register routers from each module
    from .routes.auth import router as auth_router
    from .routes.user import router as user_router
    from .routes.report import router as report_router
    from .routes.category import router as category_router
    from .routes.location import router as location_router
    from .routes.image import router as image_router
    from .routes.vote import router as vote_router

    # Include each router with appropriate prefix and tags for OpenAPI documentation
    app.include_router(auth_router, prefix="/api/auth",
                       tags=["Authentication"])
    app.include_router(user_router, prefix="/api/user", tags=["Users"])
    app.include_router(report_router, prefix="/api/report", tags=["Reports"])
    app.include_router(
        category_router, prefix="/api/category", tags=["Categories"])
    app.include_router(
        location_router, prefix="/api/location", tags=["Locations"])
    app.include_router(image_router, prefix="/api/image", tags=["Images"])
    app.include_router(vote_router, prefix="/api/vote", tags=["Votes"])

    # Exception handlers
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        """
        Handle specific HTTP exceptions and return standardized JSON responses

        Args:
            request: The incoming request
            exc: The HTTP exception that was raised

        Returns:
            JSONResponse with appropriate status code and error detail
        """
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.detail}
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        """
        Handle any unhandled exceptions and return a 500 Internal Server Error

        Args:
            request: The incoming request
            exc: The exception that was raised

        Returns:
            JSONResponse with 500 status code and error detail
        """
        return JSONResponse(
            status_code=500,
            content={"error": str(exc)}
        )

    return app
