from dataclasses import dataclass


@dataclass
class UserInfo:
    """Class representing user information."""
    __tablename__ = "user_info"
    user_id: int
    first_name: str
    middle_name: str
    last_name: str
    email: str
    contact_number: str
