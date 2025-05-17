"""
Configuration Module

This module provides centralized configuration for the Reporter API.
All configuration parameters are defined in the Config class.
"""

import os


class Config:
    """
    Application configuration class

    Contains all configuration parameters for the application, including:
    - Security settings (SECRET_KEY)
    - File upload configuration
    - Database connection parameters
    - JWT authentication settings
    """
    # Security
    # Generate random secret key for this instance
    SECRET_KEY = os.urandom(24).hex()

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

    # JWT configuration (for future implementation)
    JWT_SECRET_KEY = SECRET_KEY  # Use same secret for JWT
    JWT_ACCESS_TOKEN_EXPIRES = 24 * 60 * 60  # 24 hours token expiration
