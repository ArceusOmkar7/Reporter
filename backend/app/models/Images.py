from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class Image:
    """Class representing an image in the system.

    Attributes:
        image_id: Unique identifier for the image
        report_id: Foreign key to the reports table
        image_url: URL or path to the image
        created_at: Timestamp when the image was created
        updated_at: Timestamp when the image was last updated
    """
    __tablename__ = "images"

    image_id: int
    report_id: int
    image_url: str
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_dict(cls, data: dict) -> 'Image':
        """Create an Image instance from a dictionary.

        Args:
            data: Dictionary containing image data

        Returns:
            Image instance
        """
        return cls(
            image_id=data.get('imageID'),
            report_id=data['reportID'],
            image_url=data['imageURL'],
            created_at=data.get('createdAt', datetime.now()),
            updated_at=data.get('updatedAt', datetime.now())
        )
