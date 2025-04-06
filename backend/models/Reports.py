from dataclasses import dataclass
from datetime import datetime


@dataclass
class Reports:
    """Class representing a report."""
    __tablename__ = "reports"
    report_id: int
    title: str
    description: str
    created_at: datetime
    updated_at: datetime
    location_id: int
    category_id: int
    user_id: int
