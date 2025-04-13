import bcrypt
import re
import jwt
from fastapi import Depends, HTTPException, Request, Header, status, Security
from fastapi.security import OAuth2PasswordBearer
from typing import Optional, List, Dict, Any, Callable, Union
from ..config.config import Config
from pydantic import BaseModel, Field

# Set up OAuth2 scheme for Swagger UI - this creates the login button in docs
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password, hashed_password):
    """Verify a password against its hash"""
    if isinstance(hashed_password, bytes):
        encoded_hash = hashed_password
    else:
        encoded_hash = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password.encode('utf-8'), encoded_hash)


def generate_token(user_id):
    """Generate a JWT token for the user"""
    return jwt.encode(
        {'user_id': user_id},
        Config.JWT_SECRET_KEY,
        algorithm='HS256'
    )


def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_phone(phone):
    """Validate phone number format"""
    pattern = r'^\+?[0-9]{10,12}$'
    return bool(re.match(pattern, phone))


async def get_token_user(token: str = Depends(oauth2_scheme)) -> int:
    """Dependency to extract user ID from JWT token using OAuth2 scheme for better Swagger UI integration"""
    try:
        data = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
        return data['user_id']
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )


# Optional version of the token validator - doesn't require authentication
# Useful for endpoints that can work both authenticated and unauthenticated
async def get_optional_token_user(
    authorization: Optional[str] = Header(None)
) -> Optional[int]:
    """Optional dependency to extract user ID from JWT token if present"""
    if not authorization:
        return None

    try:
        token = authorization.split()[1]  # Remove 'Bearer ' prefix
        data = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
        return data['user_id']
    except Exception:
        return None


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


# Token models
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]


class TokenData(BaseModel):
    user_id: Optional[int] = None
