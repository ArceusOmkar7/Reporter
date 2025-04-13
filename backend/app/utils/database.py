import mysql.connector
from ..config.config import Config


def get_db_connection():
    """Create and return a database connection"""
    return mysql.connector.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME
    )


def get_cursor(connection):
    """Get a cursor from the connection"""
    return connection.cursor(dictionary=True)
