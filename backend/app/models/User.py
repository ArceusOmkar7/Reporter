from dataclasses import dataclass
from enum import Enum, auto
from typing import Optional
from datetime import datetime


class Role(Enum):
    """Enum representing user roles."""
    REGULAR = auto()
    ADMINISTRATOR = auto()


@dataclass
class User:
    """Class representing a user in the system.

    Attributes:
        user_id: Unique identifier for the user
        username: User's login username
        password: Hashed password
        role: User's role (REGULAR or ADMINISTRATOR)
        created_at: Timestamp when the user was created
        updated_at: Timestamp when the user was last updated
    """
    __tablename__ = "users"

    user_id: int
    username: str
    password: str
    role: Role
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_dict(cls, data: dict) -> 'User':
        """Create a User instance from a dictionary.

        Args:
            data: Dictionary containing user data

        Returns:
            User instance
        """
        return cls(
            user_id=data.get('userID'),
            username=data['username'],
            password=data['password'],
            role=Role[data['role'].upper()],
            created_at=data.get('createdAt', datetime.now()),
            updated_at=data.get('updatedAt', datetime.now())
        )
