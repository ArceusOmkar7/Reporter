from dataclasses import dataclass
from datetime import datetime


@dataclass
class Images:
    """Class representing an image."""
    __tablename__ = "images"
    image_id: int
    image_url: str
    report_id: int
    uploaded_at: datetime
