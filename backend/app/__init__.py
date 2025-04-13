from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .config.config import Config
import os


def create_app():
    app = FastAPI(
        title="Reporter API",
        description="API for Reporter application",
        version="1.0.0",
        openapi_tags=[
            {"name": "Authentication", "description": "User authentication endpoints"},
            {"name": "Users", "description": "User management endpoints"},
            {"name": "Reports", "description": "Report management endpoints"},
            {"name": "Categories", "description": "Category management endpoints"},
            {"name": "Locations", "description": "Location management endpoints"},
            {"name": "Images", "description": "Image management endpoints"},
            {"name": "Votes", "description": "Voting endpoints"}
        ]
    )

    # Ensure upload directory exists
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

    # Enable CORS for API routes
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register routers
    from .routes.auth import router as auth_router
    from .routes.user import router as user_router
    from .routes.report import router as report_router
    from .routes.category import router as category_router
    from .routes.location import router as location_router
    from .routes.image import router as image_router
    from .routes.vote import router as vote_router

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
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.detail}
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={"error": str(exc)}
        )

    return app
