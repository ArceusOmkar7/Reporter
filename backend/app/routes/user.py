from fastapi import APIRouter, HTTPException, Depends, Request, status
from pydantic import BaseModel, Field, validator
from typing import Dict, Any, Optional
from ..utils.database import get_db_connection
from ..utils.auth import get_token_user, validate_email, validate_phone, oauth2_scheme, BaseResponse

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


@router.get("/profile", response_model=UserProfileResponse, summary="Get User Profile")
async def get_user_profile(current_user: int = Depends(get_token_user)):
    """
    Get current user's profile

    Retrieves the profile information of the currently authenticated user.
    Requires authentication via Bearer token.
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
            (current_user,)
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


@router.put("/profile", response_model=BaseResponse, summary="Update User Profile")
async def update_user_profile(data: ProfileUpdateRequest, current_user: int = Depends(get_token_user)):
    """
    Update current user's profile

    Updates the profile information of the currently authenticated user.
    Only the fields provided will be updated.
    Requires authentication via Bearer token.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

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
             data.email, data.contactNumber, current_user)
        )

        conn.commit()
        return {"message": "Profile updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
