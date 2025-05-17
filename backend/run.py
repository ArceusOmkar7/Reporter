#!/usr/bin/env python3
# Entry point for the Reporter backend application
# This file initializes and runs the FastAPI application

from app import create_app
import uvicorn

# Initialize FastAPI app using factory pattern
app = create_app()

if __name__ == "__main__":
    # Run the application with uvicorn server when this file is executed directly
    # Host: 127.0.0.1 (localhost)
    # Port: 8000
    # Reload: True (enable auto-reload during development)
    uvicorn.run("run:app", host="127.0.0.1", port=8000, reload=True)
