from fastapi import APIRouter, HTTPException, Request, Body, status, Form
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
from ..utils.database import get_db_connection
from ..utils.auth import validate_email, validate_phone, verify_password, BaseResponse, UserInfo

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


class LoginResponse(BaseModel):
    message: str
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

        # Store password as plain text
        plain_password = data.password

        # Insert user with plain text password
        cursor.execute(
            "INSERT INTO users (username, password, role) VALUES (%s, %s, %s)",
            (data.username, plain_password, 'Regular')
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
    Authenticate user with username and password

    Validates user credentials and returns user information
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

        # If no user found with that username
        if not user:
            raise HTTPException(
                status_code=401, detail="Invalid username or password")

        # Try to get password with different possible key formats
        password = None
        if "password" in user:
            password = user["password"]
        elif "Password" in user:
            password = user["Password"]

        # If password not found in user object
        if password is None:
            raise HTTPException(
                status_code=401, detail="Invalid username or password")

        # Safely compare passwords
        try:
            if not verify_password(data.password, password):
                raise HTTPException(
                    status_code=401, detail="Invalid username or password")
        except Exception:
            # If any error in password verification
            raise HTTPException(
                status_code=401, detail="Invalid username or password")

        # Handle different possible key formats for userID
        user_id = None
        if "userID" in user:
            user_id = user["userID"]
        elif "userid" in user:
            user_id = user["userid"]
        else:
            user_id = 0

        # Handle different possible key formats for username
        username = user.get("username", user.get("Username", data.username))

        # Handle different possible key formats for role
        role = user.get("role", user.get("Role", "Regular"))

        return {
            "message": "Login successful",
            "user": {
                "id": user_id,
                "username": username,
                "role": role
            }
        }
    except HTTPException:
        # Re-raise HTTP exceptions as is
        raise
    except Exception as e:
        # Log the actual error but return a generic message to the user
        print(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail="Authentication failed. Please check your credentials."
        )
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()
