from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class UserInfo:
    """Class representing additional user information.

    Attributes:
        user_id: Foreign key to the users table
        first_name: User's first name
        middle_name: User's middle name (optional)
        last_name: User's last name
        email: User's email address
        contact_number: User's contact number
        created_at: Timestamp when the info was created
        updated_at: Timestamp when the info was last updated
    """
    __tablename__ = "user_info"

    user_id: int
    first_name: str
    middle_name: Optional[str]
    last_name: str
    email: str
    contact_number: str
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_dict(cls, data: dict) -> 'UserInfo':
        """Create a UserInfo instance from a dictionary.

        Args:
            data: Dictionary containing user info data

        Returns:
            UserInfo instance
        """
        return cls(
            user_id=data['userID'],
            first_name=data['firstName'],
            middle_name=data.get('middleName'),
            last_name=data['lastName'],
            email=data['email'],
            contact_number=data['contactNumber'],
            created_at=data.get('createdAt', datetime.now()),
            updated_at=data.get('updatedAt', datetime.now())
        )
