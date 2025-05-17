"""
Authentication Utility Module

This module provides functions and models for user authentication, validation,
and request processing. Current implementation uses simple authentication with
plain text passwords (pending security enhancement).
"""

import re
from typing import Optional, List, Dict, Any
from fastapi import HTTPException, Request, status, Query
from pydantic import BaseModel


def hash_password(password):
    """
    Hash a user password (currently stores as plain text)

    TODO: Implement proper password hashing with bcrypt or similar library

    Args:
        password: Plain text password

    Returns:
        str: Currently returns plain text password (needs security improvement)
    """
    return password


def verify_password(password, stored_password):
    """
    Verify a password against stored password

    TODO: Implement proper password verification with bcrypt or similar library

    Args:
        password: Plain text password to verify
        stored_password: Stored password (currently plain text)

    Returns:
        bool: True if passwords match, False otherwise
    """
    # Direct comparison of passwords
    if isinstance(stored_password, bytes):
        stored_password = stored_password.decode('utf-8')
    return password == stored_password


def validate_email(email):
    """
    Validate email format using regex pattern

    Args:
        email: Email address to validate

    Returns:
        bool: True if email format is valid, False otherwise
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_phone(phone):
    """
    Validate phone number format using regex pattern

    Args:
        phone: Phone number to validate

    Returns:
        bool: True if phone number format is valid, False otherwise
    """
    pattern = r'^\+?[0-9]{10,12}$'
    return bool(re.match(pattern, phone))


# This is a replacement for get_token_user that doesn't require authentication
async def get_user_id(user_id: int = Query(None, description="Optional user ID parameter")):
    """
    Get the user ID from the query parameter

    Since this API is public, authentication is not required.
    If no user_id is provided, returns a default user ID.

    Args:
        user_id: Optional user ID from query parameter

    Returns:
        int: The user ID (default is 1 if none provided)
    """
    if user_id is None:
        # Return a default user ID if none is provided
        return 1
    return user_id


# Function to validate request bodies
async def validate_request_body(request: Request, required_fields: List[str]) -> Dict[str, Any]:
    """
    Validate that required fields are present in request body

    Parses JSON request body and ensures all required fields are present.
    Raises appropriate HTTP exceptions if validation fails.

    Args:
        request: The FastAPI request object
        required_fields: List of field names that must be present

    Returns:
        dict: The validated request payload

    Raises:
        HTTPException: If JSON is invalid or required fields are missing
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON in request body"
        )

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request payload is missing"
        )

    missing_fields = [
        field for field in required_fields if field not in payload]
    if missing_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing fields: {', '.join(missing_fields)}"
        )

    return payload


# Base response models
class BaseResponse(BaseModel):
    """
    Base model for standard API responses

    Contains a message field that is included in all API responses.
    Extended by specific response models.
    """
    message: str


class ErrorResponse(BaseModel):
    """
    Standard error response model

    Used for consistent error responses across all API endpoints.
    """
    error: str


# User info model
class UserInfo(BaseModel):
    """
    User information model

    Contains basic user information returned after authentication
    or in user profile endpoints.

    Attributes:
        id: The user's unique identifier
        username: The user's username
        role: The user's role (e.g., "Regular" or "Administrator")
    """
    id: int
    username: str
    role: str
