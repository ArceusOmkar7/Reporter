from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, validator
from typing import Dict, Any, Optional, List
from ..utils.database import get_db_connection
from ..utils.auth import validate_email, validate_phone, BaseResponse

router = APIRouter()

# Model for user profile response


class UserProfileResponse(BaseModel):
    userID: int
    username: str
    role: str
    firstName: str
    lastName: str
    email: str
    contactNumber: str
    middleName: Optional[str] = None

# Model for profile update request


class ProfileUpdateRequest(BaseModel):
    firstName: Optional[str] = Field(None, description="User's first name")
    lastName: Optional[str] = Field(None, description="User's last name")
    middleName: Optional[str] = Field(
        None, description="User's middle name (optional)")
    email: Optional[str] = Field(None, description="User's email address")
    contactNumber: Optional[str] = Field(
        None, description="User's contact number")

    @validator('email')
    def validate_email_format(cls, v):
        if v is not None and not validate_email(v):
            raise ValueError("Invalid email format")
        return v

    @validator('contactNumber')
    def validate_phone_format(cls, v):
        if v is not None and not validate_phone(v):
            raise ValueError("Invalid phone number format")
        return v


@router.get("/all", response_model=List[UserProfileResponse], summary="Get All Users")
async def get_all_users():
    """
    Get all users' profiles

    Retrieves the profile information for all users in the system.
    This endpoint is public and doesn't require authentication.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """SELECT u.userID, u.username, u.role, ui.firstName, ui.middleName, 
            ui.lastName, ui.email, ui.contactNumber 
            FROM users u 
            JOIN user_info ui ON u.userID = ui.userID"""
        )
        users = cursor.fetchall()
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.get("/profile/{user_id}", response_model=UserProfileResponse, summary="Get User Profile")
async def get_user_profile(user_id: int):
    """
    Get user profile by ID

    Retrieves the profile information for a specific user by their ID.
    This endpoint is public and doesn't require authentication.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """SELECT u.userID, u.username, u.role, ui.firstName, ui.middleName, 
            ui.lastName, ui.email, ui.contactNumber 
            FROM users u 
            JOIN user_info ui ON u.userID = ui.userID 
            WHERE u.userID = %s""",
            (user_id,)
        )
        user = cursor.fetchone()
        if user:
            return user
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.put("/profile/{user_id}", response_model=BaseResponse, summary="Update User Profile")
async def update_user_profile(user_id: int, data: ProfileUpdateRequest):
    """
    Update user profile

    Updates the profile information for a specific user by their ID.
    Only the fields provided will be updated.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if user exists
        cursor.execute("SELECT * FROM users WHERE userID = %s", (user_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="User not found")

        # Update user info
        cursor.execute(
            """UPDATE user_info SET 
            firstName = COALESCE(%s, firstName), 
            middleName = COALESCE(%s, middleName), 
            lastName = COALESCE(%s, lastName), 
            email = COALESCE(%s, email), 
            contactNumber = COALESCE(%s, contactNumber) 
            WHERE userID = %s""",
            (data.firstName, data.middleName, data.lastName,
             data.email, data.contactNumber, user_id)
        )

        conn.commit()
        return {"message": "Profile updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
