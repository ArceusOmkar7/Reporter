"""
Database Utility Module

This module provides functions for database connections and cursor management.
MySQL connections are created using credentials from the Config class.
"""

import mysql.connector
from ..config.config import Config
import os
import re
from .setup_default_images import download_default_images


def init_database():
    """
    Initialize the database if it doesn't exist

    This function:
    1. Checks if the database exists
    2. Creates the database if it doesn't exist
    3. Creates tables if they don't exist
    4. Inserts dummy data if tables are empty
    5. Downloads default category images if needed

    Returns:
        bool: True if initialization was needed, False if database was already set up
    """
    initialization_needed = False

    # Try to connect to MySQL without specifying the database
    try:
        conn = mysql.connector.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD
        )
        cursor = conn.cursor()

        # Check if database exists
        cursor.execute(f"SHOW DATABASES LIKE '{Config.DB_NAME}'")
        result = cursor.fetchone()

        # If database doesn't exist, create it
        if not result:
            print(f"Database '{Config.DB_NAME}' not found. Creating...")
            cursor.execute(f"CREATE DATABASE {Config.DB_NAME}")
            print(f"Database '{Config.DB_NAME}' created successfully.")

            # Connect to the new database
            cursor.close()
            conn.close()

            conn = mysql.connector.connect(
                host=Config.DB_HOST,
                user=Config.DB_USER,
                password=Config.DB_PASSWORD,
                database=Config.DB_NAME
            )
            cursor = conn.cursor()

            # Read and execute the table creation SQL script
            current_dir = os.path.dirname(os.path.dirname(
                os.path.dirname(os.path.abspath(__file__))))
            with open(os.path.join(current_dir, 'table_creation.sql')) as f:
                # Replace USE statement with the dynamic database name
                sql_script = re.sub(
                    r'USE\s+[^;]+;', f'USE {Config.DB_NAME};', f.read())

                # Execute each statement
                for statement in sql_script.split(';'):
                    if statement.strip():
                        cursor.execute(statement + ';')
                        conn.commit()

            print("Tables created successfully.")

            # Read and execute the data insertion SQL script
            with open(os.path.join(current_dir, 'table_insertion.sql')) as f:
                # Replace USE statement with the dynamic database name
                sql_script = re.sub(
                    r'USE\s+[^;]+;', f'USE {Config.DB_NAME};', f.read())

                # Execute each statement
                for statement in sql_script.split(';'):
                    if statement.strip():
                        try:
                            cursor.execute(statement + ';')
                            conn.commit()
                        except mysql.connector.Error as e:
                            # If there's a duplicate key error, just continue (data already exists)
                            if e.errno == 1062:  # Duplicate entry error code
                                continue
                            else:
                                raise

            print("Initial data inserted successfully.")
            initialization_needed = True
        else:
            # Database exists, check if tables have data
            conn.close()
            conn = mysql.connector.connect(
                host=Config.DB_HOST,
                user=Config.DB_USER,
                password=Config.DB_PASSWORD,
                database=Config.DB_NAME
            )
            cursor = conn.cursor()

            # Check if Users table exists and has data
            try:
                cursor.execute("SELECT COUNT(*) FROM Users")
                count = cursor.fetchone()[0]

                # If table is empty, insert dummy data
                if count == 0:
                    print("Database exists but is empty. Inserting initial data...")
                    # Read and execute just the data insertion script
                    current_dir = os.path.dirname(os.path.dirname(
                        os.path.dirname(os.path.abspath(__file__))))
                    with open(os.path.join(current_dir, 'table_insertion.sql')) as f:
                        # Replace USE statement with the dynamic database name
                        sql_script = re.sub(
                            r'USE\s+[^;]+;', f'USE {Config.DB_NAME};', f.read())

                        # Execute each statement
                        for statement in sql_script.split(';'):
                            if statement.strip():
                                try:
                                    cursor.execute(statement + ';')
                                    conn.commit()
                                except mysql.connector.Error as e:
                                    # If there's a duplicate key error, just continue (data already exists)
                                    if e.errno == 1062:  # Duplicate entry error code
                                        continue
                                    else:
                                        raise

                    print("Initial data inserted successfully.")
                    initialization_needed = True
            except mysql.connector.Error:
                # Table doesn't exist, create tables and insert data
                print("Database exists but tables are missing. Creating tables...")

                # Read and execute the table creation SQL script
                current_dir = os.path.dirname(os.path.dirname(
                    os.path.dirname(os.path.abspath(__file__))))
                with open(os.path.join(current_dir, 'table_creation.sql')) as f:
                    # Replace USE statement with the dynamic database name
                    sql_script = re.sub(
                        r'USE\s+[^;]+;', f'USE {Config.DB_NAME};', f.read())

                    # Execute each statement
                    for statement in sql_script.split(';'):
                        if statement.strip():
                            cursor.execute(statement + ';')
                            conn.commit()

                print("Tables created successfully.")

                # Read and execute the data insertion SQL script
                with open(os.path.join(current_dir, 'table_insertion.sql')) as f:
                    # Replace USE statement with the dynamic database name
                    sql_script = re.sub(
                        r'USE\s+[^;]+;', f'USE {Config.DB_NAME};', f.read())

                    # Execute each statement
                    for statement in sql_script.split(';'):
                        if statement.strip():
                            try:
                                cursor.execute(statement + ';')
                                conn.commit()
                            except mysql.connector.Error as e:
                                # If there's a duplicate key error, just continue (data already exists)
                                if e.errno == 1062:  # Duplicate entry error code
                                    continue
                                else:
                                    raise

                print("Initial data inserted successfully.")
                initialization_needed = True

        # Download default category images
        download_default_images()

        # Database and tables already exist and have data
        if not initialization_needed:
            print(
                f"Database '{Config.DB_NAME}' already exists and is initialized.")
        return initialization_needed

    except mysql.connector.Error as e:
        print(f"Error initializing database: {e}")
        raise
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


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
