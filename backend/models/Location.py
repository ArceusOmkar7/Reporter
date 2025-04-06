from dataclasses import dataclass


@dataclass
class Location:
    """Class representing a location."""
    __tablename__ = "locations"
    location_id: int
    latitude: float
    longitude: float
    street: str
    district: str
    city: str
    state: str
    country: str
    postal_code: str
    landmark: str
