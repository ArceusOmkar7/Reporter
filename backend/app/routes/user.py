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
    username: Optional[str] = Field(None, description="User's username")
    firstName: Optional[str] = Field(None, description="User's first name")
    lastName: Optional[str] = Field(None, description="User's last name")
    middleName: Optional[str] = Field(
        None, description="User's middle name (optional)")
    email: Optional[str] = Field(None, description="User's email address")
    contactNumber: Optional[str] = Field(
        None, description="User's contact number")
    role: Optional[str] = Field(None, description="User's role")

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

    @validator('role')
    def validate_role(cls, v):
        if v is not None:
            v = v.strip()  # Remove any whitespace
            if v not in ["Regular", "Administrator"]:
                raise ValueError(
                    "Invalid role. Must be either 'Regular' or 'Administrator'")
        return v

    @validator('username')
    def validate_username(cls, v):
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Username cannot be empty")
            if len(v) < 3:
                raise ValueError("Username must be at least 3 characters long")
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
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update username if provided
        if data.username is not None:
            # Check if username is already taken
            cursor.execute(
                "SELECT userID FROM users WHERE username = %s AND userID != %s",
                (data.username, user_id)
            )
            if cursor.fetchone():
                raise HTTPException(
                    status_code=400,
                    detail="Username is already taken"
                )
            cursor.execute(
                "UPDATE users SET username = %s WHERE userID = %s",
                (data.username, user_id)
            )

        # Update user info
        update_fields = []
        update_values = []

        if data.firstName is not None:
            update_fields.append("firstName = %s")
            update_values.append(data.firstName)
        if data.middleName is not None:
            update_fields.append("middleName = %s")
            update_values.append(data.middleName)
        if data.lastName is not None:
            update_fields.append("lastName = %s")
            update_values.append(data.lastName)
        if data.email is not None:
            update_fields.append("email = %s")
            update_values.append(data.email)
        if data.contactNumber is not None:
            update_fields.append("contactNumber = %s")
            update_values.append(data.contactNumber)

        if update_fields:
            update_values.append(user_id)
            query = f"""UPDATE user_info SET {', '.join(update_fields)} 
                      WHERE userID = %s"""
            cursor.execute(query, tuple(update_values))

        # Update user role if provided
        if data.role is not None:
            cursor.execute(
                "UPDATE users SET role = %s WHERE userID = %s",
                (data.role, user_id)
            )

        conn.commit()
        return {"message": "Profile updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update profile: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


@router.delete("/profile/{user_id}", response_model=BaseResponse, summary="Delete User Profile")
async def delete_user_profile(user_id: int, current_user_id: Optional[int] = None):
    """
    Delete user profile

    Deletes a specific user by their ID.
    An admin cannot delete their own account.
    Requires `current_user_id` to be passed as a query parameter for authorization.
    """
    if current_user_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current user ID is required for this operation."
        )

    if user_id == current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrators cannot delete their own accounts."
        )

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the current user is an administrator
        cursor.execute(
            "SELECT role FROM users WHERE userID = %s", (current_user_id,))
        admin_user = cursor.fetchone()
        if not admin_user or admin_user[0] != 'Administrator':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can delete users."
            )

        # Check if the user to be deleted exists
        cursor.execute(
            "SELECT userID FROM users WHERE userID = %s", (user_id,))
        user_to_delete = cursor.fetchone()
        if not user_to_delete:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User to delete not found")

        # Proceed with deletion
        # Note: Consider what to do with related data (e.g., reports, votes).
        # For this example, we'll delete from user_info and then users.
        # You might need to handle foreign key constraints or decide on a soft delete strategy.

        cursor.execute("DELETE FROM user_info WHERE userID = %s", (user_id,))
        cursor.execute("DELETE FROM users WHERE userID = %s", (user_id,))

        conn.commit()

        if cursor.rowcount == 0:
            # This case should ideally be caught by the "User to delete not found" check,
            # but it's a safeguard.
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="User not found or already deleted.")

        return {"message": "User deleted successfully"}
    except HTTPException:
        raise  # Re-raise HTTPException to return specific error responses
    except Exception as e:
        # Log the full error for debugging
        print(f"Error deleting user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}"
        )
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()
