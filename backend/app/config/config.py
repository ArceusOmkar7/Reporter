import os


class Config:
    SECRET_KEY = os.urandom(24).hex()
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

    # Database configuration
    DB_HOST = 'localhost'
    DB_USER = 'root'
    DB_PASSWORD = '1234'
    DB_NAME = 'reporter_py'

    # JWT configuration
    JWT_SECRET_KEY = SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = 24 * 60 * 60  # 24 hours

    # File upload configuration
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
