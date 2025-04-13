from fastapi import APIRouter, HTTPException, Depends, Request, Body, status, Form
from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, Dict, Any
from ..utils.database import get_db_connection
from ..utils.auth import generate_token, validate_email, validate_phone, verify_password, BaseResponse, Token
import bcrypt

router = APIRouter()

# Request and response models for better API documentation


class RegisterRequest(BaseModel):
    username: str = Field(..., description="User's unique username")
    password: str = Field(..., min_length=6,
                          description="User's password (min 6 characters)")
    firstName: str = Field(..., description="User's first name")
    lastName: str = Field(..., description="User's last name")
    email: str = Field(..., description="User's email address")
    contactNumber: str = Field(..., description="User's contact number")
    middleName: Optional[str] = Field(
        None, description="User's middle name (optional)")

    @validator('email')
    def email_must_be_valid(cls, v):
        if not validate_email(v):
            raise ValueError("Invalid email format")
        return v

    @validator('contactNumber')
    def phone_must_be_valid(cls, v):
        if not validate_phone(v):
            raise ValueError("Invalid phone number format")
        return v


class RegisterResponse(BaseResponse):
    id: int = Field(..., description="ID of the newly registered user")


class LoginRequest(BaseModel):
    username: str = Field(..., description="User's username")
    password: str = Field(..., description="User's password")


class UserInfo(BaseModel):
    id: int
    username: str
    role: str


class LoginResponse(BaseModel):
    message: str
    token: str
    user: UserInfo


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest):
    """
    Register a new user

    Creates a new user account with the provided details and returns the user ID
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if username or email already exists
        cursor.execute(
            "SELECT * FROM users u JOIN user_info ui ON u.userID = ui.userID WHERE u.username = %s OR ui.email = %s",
            (data.username, data.email)
        )
        if cursor.fetchone():
            raise HTTPException(
                status_code=400, detail="Username or email already exists")

        # Hash password
        hashed_password = bcrypt.hashpw(
            data.password.encode('utf-8'), bcrypt.gensalt())

        # Insert user
        cursor.execute(
            "INSERT INTO users (username, password, role) VALUES (%s, %s, %s)",
            (data.username, hashed_password, 'Regular')
        )
        user_id = cursor.lastrowid

        # Insert user info
        cursor.execute(
            """INSERT INTO user_info 
            (userID, firstName, middleName, lastName, email, contactNumber) 
            VALUES (%s, %s, %s, %s, %s, %s)""",
            (user_id, data.firstName, data.middleName,
             data.lastName, data.email, data.contactNumber)
        )

        conn.commit()
        return {"message": "User registered successfully", "id": user_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest):
    """
    Authenticate user and return JWT token

    Validates user credentials and returns a JWT token for use in authenticated requests
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get user
        cursor.execute(
            "SELECT * FROM users WHERE username = %s",
            (data.username,)
        )
        user = cursor.fetchone()

        if not user or not verify_password(data.password, user['password']):
            raise HTTPException(
                status_code=401, detail="Invalid username or password")

        # Generate token
        token = generate_token(user['userID'])

        return {
            "message": "Login successful",
            "token": token,
            "user": {
                "id": user['userID'],
                "username": user['username'],
                "role": user['role']
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.post("/token", response_model=Token)
async def get_access_token(username: str = Form(...), password: str = Form(...)):
    """
    OAuth2 compatible token login, get an access token for future requests

    This endpoint is specifically for Swagger UI authentication and OAuth2 compatibility.
    Returns an access token that can be used in the "Authorize" section of Swagger UI.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get user
        cursor.execute(
            "SELECT * FROM users WHERE username = %s",
            (username,)
        )
        user = cursor.fetchone()

        if not user or not verify_password(password, user['password']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Generate token
        token = generate_token(user['userID'])

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user['userID'],
                "username": user['username'],
                "role": user['role']
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
