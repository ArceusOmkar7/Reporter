"""
Configuration Module

This module provides centralized configuration for the Reporter API.
All configuration parameters are defined in the Config class.
"""

import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file
# Construct the path to the .env file relative to this config.py file
# config.py is in backend/app/config/, .env is in backend/
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)


class Config:
    """
    Application configuration class

    Contains all configuration parameters for the application, including:
    - Security settings (SECRET_KEY)
    - File upload configuration
    - Database connection parameters
    """

    # File uploads
    UPLOAD_FOLDER = 'uploads'  # Directory to store uploaded files
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    # Allowed file extensions
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

    # Database configuration
    DB_HOST = 'localhost'  # MySQL server hostname
    DB_USER = 'root'  # MySQL username
    DB_PASSWORD = '1234'  # MySQL password
    DB_NAME = 'reporter_lab'  # Database name

    # Gemini API Key
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
    # LLM Model Name
    LLM_MODEL_NAME = "gemini-2.5-flash-preview-04-17"  # Default to gemini-pro
