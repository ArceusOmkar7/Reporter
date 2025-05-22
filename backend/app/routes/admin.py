from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from typing import Any, List, Dict
from ..utils.database import get_db_connection, get_cursor
from ..utils.auth import get_current_user, UserRole, UserInfo  # Updated UserInfo import
import mysql.connector  # Import mysql.connector for error handling

router = APIRouter()


class SQLQueryRequest(BaseModel):
    query: str


class SQLQueryResponse(BaseModel):
    success: bool
    message: str
    results: List[Dict[str, Any]] | None = None
    columns: List[str] | None = None
    error: str | None = None


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
