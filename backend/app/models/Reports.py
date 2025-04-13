from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class Report:
    """Class representing a report in the system.

    Attributes:
        report_id: Unique identifier for the report
        user_id: Foreign key to the users table
        category_id: Foreign key to the categories table
        location_id: Foreign key to the locations table
        title: Title of the report
        description: Detailed description of the report
        status: Current status of the report
        created_at: Timestamp when the report was created
        updated_at: Timestamp when the report was last updated
    """
    __tablename__ = "reports"

    report_id: int
    user_id: int
    category_id: int
    location_id: int
    title: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_dict(cls, data: dict) -> 'Report':
        """Create a Report instance from a dictionary.

        Args:
            data: Dictionary containing report data

        Returns:
            Report instance
        """
        return cls(
            report_id=data.get('reportID'),
            user_id=data['userID'],
            category_id=data['categoryID'],
            location_id=data['locationID'],
            title=data['title'],
            description=data['description'],
            status=data.get('status', 'pending'),
            created_at=data.get('createdAt', datetime.now()),
            updated_at=data.get('updatedAt', datetime.now())
        )
