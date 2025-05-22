from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from typing import Any, List, Dict
from ..utils.database import get_db_connection, get_cursor
from ..utils.auth import get_current_user, UserRole, UserInfo
import mysql.connector
import google.generativeai as genai
from ..config.config import Config
import os

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    # Fallback to Config if not in environment (though it should be set in env for production)
    GEMINI_API_KEY = Config.GEMINI_API_KEY

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("Warning: GEMINI_API_KEY not found. AI SQL Generation will not work.")
    # Optionally, raise an error or disable the feature if the key is critical
    # raise ValueError("GEMINI_API_KEY is not set in environment or config file.")

router = APIRouter()

# Database Schema (from table_creation.sql)
# This should ideally be loaded dynamically or from a shared configuration
# For simplicity in this step, it's embedded here.
DATABASE_SCHEMA = """
USE reporter_lab;

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    userID INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(32) UNIQUE NOT NULL,
    password VARCHAR(64) NOT NULL, -- Stored as hash
    role ENUM('Regular', 'Administrator') NOT NULL DEFAULT 'Regular'
);

-- User Information Table
CREATE TABLE IF NOT EXISTS User_Info (
    userID INT PRIMARY KEY,
    firstName VARCHAR(32) NOT NULL,
    middleName VARCHAR(32),
    lastName VARCHAR(32) NOT NULL,
    email VARCHAR(64) UNIQUE NOT NULL,
    contactNumber VARCHAR(12) UNIQUE NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Categories Table
CREATE TABLE IF NOT EXISTS Categories (
    categoryID INT PRIMARY KEY AUTO_INCREMENT,
    categoryName VARCHAR(32) UNIQUE NOT NULL,
    categoryDescription TEXT
);

-- Locations Table
CREATE TABLE IF NOT EXISTS Locations (
    locationID INT PRIMARY KEY AUTO_INCREMENT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    street VARCHAR(64),
    district VARCHAR(64),
    city VARCHAR(64),
    state VARCHAR(64),
    country VARCHAR(64),
    postalCode VARCHAR(20),
    landmark VARCHAR(64)
);

-- Reports Table
CREATE TABLE IF NOT EXISTS Reports (
    reportID INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    locationID INT NOT NULL,
    categoryID INT NOT NULL,
    userID INT NOT NULL,
    FOREIGN KEY (LocationID) REFERENCES Locations(LocationID),
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Images Table
CREATE TABLE IF NOT EXISTS Images (
    imageID INT PRIMARY KEY AUTO_INCREMENT,
    imageURL VARCHAR(255) NOT NULL, -- Path to the image file
    reportID INT NOT NULL,
    uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ReportID) REFERENCES Reports(ReportID)
);

-- Votes Table
CREATE TABLE IF NOT EXISTS Votes (
    voteID INT PRIMARY KEY AUTO_INCREMENT,
    reportID INT NOT NULL,
    userID INT NOT NULL,
    voteType ENUM('Upvote', 'Downvote') NOT NULL,
    votedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ReportID) REFERENCES Reports(ReportID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);
"""


class SQLQueryRequest(BaseModel):
    query: str


class SQLQueryResponse(BaseModel):
    success: bool
    message: str
    results: List[Dict[str, Any]] | None = None
    columns: List[str] | None = None
    error: str | None = None


class NaturalLanguageQueryRequest(BaseModel):
    natural_language_query: str


class AISuggestedSQLResponse(BaseModel):
    success: bool
    suggested_sql: str | None = None
    message: str
    error: str | None = None


@router.post("/generate-sql-from-natural-language", response_model=AISuggestedSQLResponse)
async def generate_sql_from_natural_language(
    request_body: NaturalLanguageQueryRequest,
    current_user: UserInfo = Depends(get_current_user)
):
    if not current_user or current_user.role != UserRole.ADMINISTRATOR.value:
        raise HTTPException(
            status_code=403, detail="Not authorized for this action")

    if not GEMINI_API_KEY:
        return AISuggestedSQLResponse(success=False, message="AI service not configured (API key missing).", error="GEMINI_API_KEY not found.")

    if not request_body.natural_language_query.strip():
        raise HTTPException(
            status_code=400, detail="Natural language query cannot be empty")

    try:
        # Use the model name from Config
        model = genai.GenerativeModel(Config.LLM_MODEL_NAME)
        prompt = f"""
        Based on the following SQL schema:
        {DATABASE_SCHEMA}

        Convert the following natural language query into a syntactically correct SQL query.
        Only return the SQL query, with no other explanatory text.
        If the natural language query is ambiguous or cannot be converted to SQL based on the schema,
        return "Error: Cannot generate SQL from the provided query."

        Natural language query: "{request_body.natural_language_query}"

        SQL query:
        """

        response = model.generate_content(prompt)

        generated_sql = response.text.strip()

        if "Error:" in generated_sql or not generated_sql:
            return AISuggestedSQLResponse(success=False, message="Failed to generate SQL from natural language.", error=generated_sql or "AI returned an empty response.")

        # Basic validation: remove potential markdown backticks if AI adds them
        if generated_sql.startswith("```sql"):
            generated_sql = generated_sql[len("```sql"):].strip()
        if generated_sql.endswith("```"):
            generated_sql = generated_sql[:-len("```")].strip()

        # Remove trailing semicolon if present, as it might interfere with some UI components or further processing
        if generated_sql.endswith(';'):
            generated_sql = generated_sql[:-1]

        return AISuggestedSQLResponse(success=True, suggested_sql=generated_sql, message="SQL query generated successfully.")

    except Exception as e:
        # Log the full error for debugging
        print(f"Error generating SQL with Gemini: {e}")
        error_message = str(e)
        # Check for specific Gemini API error details if available
        if hasattr(e, 'message'):  # For google.api_core.exceptions.GoogleAPIError
            error_message = e.message
        elif hasattr(e, 'args') and e.args:  # General exceptions
            error_message = str(e.args[0])

        return AISuggestedSQLResponse(success=False, message="An error occurred while generating the SQL query.", error=f"Gemini API Error: {error_message}")


@router.post("/execute-query", response_model=SQLQueryResponse)
async def execute_sql_query(
    request_body: SQLQueryRequest,
    current_user: UserInfo = Depends(get_current_user)  # Use UserInfo
):
    """
    Execute an arbitrary SQL query. Only accessible by administrators.
    """
    # Ensure current_user is not None and has a role attribute
    if not current_user or not hasattr(current_user, 'role'):
        raise HTTPException(
            status_code=403, detail="Authentication failed or user role not found.")

    if current_user.role != UserRole.ADMINISTRATOR.value:
        raise HTTPException(
            status_code=403, detail="Not authorized to execute this action")

    query = request_body.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # More robust validation:
    # Disallow multiple statements by checking for semicolons not at the end of the query
    # This is a basic check. For production, a proper SQL parser/validator is recommended.
    if query.count(';') > 1 or (query.count(';') == 1 and not query.endswith(';')):
        if not query.lower().strip().startswith("select"):  # Allow multiple statements only for SELECT for now
            raise HTTPException(
                status_code=400, detail="Multiple SQL statements are not allowed for this query type.")

    # Remove trailing semicolon if present, as some drivers might not like it with execute()
    if query.endswith(';'):
        query = query[:-1]

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = get_cursor(conn)  # Use get_cursor for dictionary cursor

        cursor.execute(query)

        results = []
        columns = []

        # Check if the query produced results (e.g., SELECT)
        if cursor.description:
            columns = [desc[0] for desc in cursor.description]
            # fetchall() with dictionary=True cursor returns list of dicts
            results = cursor.fetchall()

        # Determine message based on query type
        query_lower = query.lower()
        if query_lower.startswith(("insert", "update", "delete", "replace")):
            conn.commit()
            message = f"Query executed successfully. {cursor.rowcount} rows affected."
        elif query_lower.startswith("select"):
            message = f"Query executed successfully. {len(results)} rows returned."
        else:  # For DDL statements like CREATE, ALTER, DROP, etc.
            conn.commit()
            message = "DDL query executed successfully."
            # DDL queries might not have cursor.description or rowcount in a standard way
            # but they need to be committed.

        return SQLQueryResponse(success=True, message=message, results=results, columns=columns)

    except mysql.connector.Error as db_err:  # Catch specific MySQL errors
        if conn:
            conn.rollback()
        return SQLQueryResponse(success=False, message="Database query execution failed.", error=f"MySQL Error: {db_err.msg} (Error Code: {db_err.errno})", results=[], columns=[])
    except Exception as e:
        if conn:
            conn.rollback()
        return SQLQueryResponse(success=False, message="Query execution failed.", error=str(e), results=[], columns=[])
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# This function can be used in __init__.py if you want to register it from there
# def register_admin_routes(app):
# app.include_router(router, prefix="/api/admin", tags=["Admin"])
