"""
Database Utility Module

This module provides functions for database connections and cursor management.
MySQL connections are created using credentials from the Config class.
"""

import mysql.connector
from ..config.config import Config


def get_db_connection():
    """
    Create and return a new MySQL database connection

    This function creates a fresh connection to the MySQL database using
    credentials from Config. Each connection should be closed when done.

    Returns:
        mysql.connector.connection: A new database connection
    """
    return mysql.connector.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME
    )


def get_cursor(connection):
    """
    Get a dictionary cursor from the connection

    Returns a cursor that returns results as dictionaries rather than tuples,
    which makes accessing fields by name possible.

    Args:
        connection: MySQL database connection

    Returns:
        mysql.connector.cursor: A cursor for executing SQL queries
    """
    return connection.cursor(dictionary=True)
