"""
Analytics Data Models

This module defines Pydantic models used for analytics data responses.
"""
from pydantic import BaseModel
from typing import List, Dict, Any


class TimeSeriesDataPoint(BaseModel):
    """Data point for time series data"""
    date: str
    count: int


class CategoryDistribution(BaseModel):
    """Data point for category distribution data"""
    categoryName: str
    count: int


class LocationAnalytics(BaseModel):
    """Data point for location-based analytics"""
    locationName: str
    count: int


class UserAnalytics(BaseModel):
    """User analytics data model"""
    registrations_by_date: List[TimeSeriesDataPoint]
    users_by_location: List[Dict[str, Any]]
    users_by_role: List[Dict[str, Any]]
    most_active_users: List[Dict[str, Any]]


class ReportAnalytics(BaseModel):
    """Report analytics data model"""
    reports_by_category: List[CategoryDistribution]
    reports_by_location: List[LocationAnalytics]
    reports_trend: List[TimeSeriesDataPoint]
    recent_reports: List[Dict[str, Any]]
