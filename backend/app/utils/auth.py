import re
from typing import Optional, List, Dict, Any
from fastapi import HTTPException, Request, status, Query
from pydantic import BaseModel


def hash_password(password):
    """Store password as plain text"""
    return password


def verify_password(password, stored_password):
    """Verify a password against stored plain text password"""
    # Direct comparison of passwords
    if isinstance(stored_password, bytes):
        stored_password = stored_password.decode('utf-8')
    return password == stored_password


def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_phone(phone):
    """Validate phone number format"""
    pattern = r'^\+?[0-9]{10,12}$'
    return bool(re.match(pattern, phone))


# This is a replacement for get_token_user that doesn't require authentication
async def get_user_id(user_id: int = Query(None, description="Optional user ID parameter")):
    """
    Get the user ID from the query parameter
    Since this API is now public, authentication is not required
    """
    if user_id is None:
        # Return a default user ID if none is provided
        return 1
    return user_id


# Function to validate request bodies
async def validate_request_body(request: Request, required_fields: List[str]) -> Dict[str, Any]:
    """Validate that required fields are present in request body"""
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
    """Base model for standard responses"""
    message: str


class ErrorResponse(BaseModel):
    """Standard error response model"""
    error: str


# User info model
class UserInfo(BaseModel):
    id: int
    username: str
    role: str
