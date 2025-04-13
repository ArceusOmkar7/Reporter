from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class Location:
    """Class representing a location in the system.

    Attributes:
        location_id: Unique identifier for the location
        name: Name of the location
        latitude: Latitude coordinate
        longitude: Longitude coordinate
        address: Full address of the location
        created_at: Timestamp when the location was created
        updated_at: Timestamp when the location was last updated
    """
    __tablename__ = "locations"

    location_id: int
    name: str
    latitude: float
    longitude: float
    address: str
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_dict(cls, data: dict) -> 'Location':
        """Create a Location instance from a dictionary.

        Args:
            data: Dictionary containing location data

        Returns:
            Location instance
        """
        return cls(
            location_id=data.get('locationID'),
            name=data['name'],
            latitude=data['latitude'],
            longitude=data['longitude'],
            address=data['address'],
            created_at=data.get('createdAt', datetime.now()),
            updated_at=data.get('updatedAt', datetime.now())
        )
