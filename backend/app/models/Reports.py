"""
Reports Model Module

This module defines the Report data model for incident reports in the application.
"""

from dataclasses import dataclass
from enum import Enum, auto
from typing import Optional, List
from datetime import datetime


class ReportStatus(Enum):
    """
    Enum representing possible statuses for a report

    These status values track the lifecycle of a report from submission to resolution.
    """
    PENDING = auto()      # Initial state when report is submitted
    UNDER_REVIEW = auto()  # Report is being reviewed by administrators
    REJECTED = auto()     # Report was rejected as invalid or inappropriate
    ACCEPTED = auto()     # Report was accepted but not yet being processed
    IN_PROGRESS = auto()  # Report is being actively addressed
    RESOLVED = auto()     # Report issue has been resolved
    CLOSED = auto()       # Report case is closed (with or without resolution)


@dataclass
class Report:
    """
    Class representing a user-submitted report in the system

    Reports track incidents, issues, or problems that users have reported.
    Each report includes details about the incident, its location, status,
    and relevant metadata.

    Attributes:
        report_id: Unique identifier for the report
        title: Short descriptive title of the report
        description: Detailed description of the reported issue
        user_id: ID of the user who submitted the report
        category_id: ID of the category this report belongs to
        location_id: ID of the location where this issue was reported
        status: Current status of the report (from ReportStatus enum)
        created_at: Timestamp when the report was created
        updated_at: Timestamp when the report was last updated
    """
    __tablename__ = "reports"

    report_id: int
    title: str
    description: str
    user_id: int
    category_id: int
    location_id: int
    status: ReportStatus
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_dict(cls, data: dict) -> 'Report':
        """
        Create a Report instance from a dictionary

        Converts database row or JSON data into a Report object,
        handling possible variations in field names and types.

        Args:
            data: Dictionary containing report data from database or request

        Returns:
            Report: A new Report instance with data from the dictionary
        """
        # Handle possible variations in field naming from database or API
        report_id = data.get('reportID') or data.get('report_id')
        status = data.get('status', 'PENDING')

        # Convert status string to ReportStatus enum
        if isinstance(status, str):
            try:
                status = ReportStatus[status.upper()]
            except KeyError:
                status = ReportStatus.PENDING

        # Handle timestamps, creating defaults if missing
        created_at = data.get('createdAt') or data.get(
            'created_at') or datetime.now()
        updated_at = data.get('updatedAt') or data.get(
            'updated_at') or datetime.now()

        return cls(
            report_id=report_id,
            title=data.get('title', ''),
            description=data.get('description', ''),
            user_id=data.get('userID') or data.get('user_id'),
            category_id=data.get('categoryID') or data.get('category_id'),
            location_id=data.get('locationID') or data.get('location_id'),
            status=status,
            created_at=created_at,
            updated_at=updated_at
        )
