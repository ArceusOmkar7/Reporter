from dataclasses import dataclass
from enum import Enum, auto
from datetime import datetime


class Role(Enum):
    REGULAR = auto()
    ADMINISTRATOR = auto()


@dataclass
class User:
    """Class representing a user."""
    __tablename__ = "users"
    user_id: int
    username: str
    password: str
    role: Role
