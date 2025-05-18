"""
Analytics Routes

This module provides endpoints for analytics data used in the admin dashboard:
- Report statistics
- User analytics
- Location insights
- Category analysis
- System performance metrics

These endpoints are designed to be used by administrator accounts only.
"""
from fastapi import APIRouter, HTTPException, Depends
from ..utils.auth import get_current_user, UserRole
from ..analytics.models import ReportAnalytics, UserAnalytics
from ..analytics.report_analytics import get_report_analytics
from ..analytics.user_analytics import get_user_analytics
from ..analytics.location_analytics import get_location_insights
from ..analytics.category_analytics import get_category_analysis
from ..analytics.system_analytics import get_system_performance

router = APIRouter()


@router.get("/reports", response_model=ReportAnalytics, summary="Get Report Analytics")
async def reports_analytics_endpoint(user=Depends(get_current_user)):
    """
    Get comprehensive report analytics

    Returns analytics for reports including:
    - Distribution by category
    - Distribution by location
    - Trend over time
    - Recent reports
    """
    # In a production system, check for admin role
    # if user.role != UserRole.ADMINISTRATOR.value:
    #     raise HTTPException(status_code=403, detail="Admin access required")

    return await get_report_analytics()


@router.get("/users", response_model=UserAnalytics, summary="Get User Analytics")
async def users_analytics_endpoint(user=Depends(get_current_user)):
    """
    Get comprehensive user analytics

    Returns analytics for users including:
    - Registration trend by date
    - User distribution by location (India-specific)
    - User distribution by role
    - Most active users based on report submissions
    """
    # In a production system, check for admin role
    # if user.role != UserRole.ADMINISTRATOR.value:
    #     raise HTTPException(status_code=403, detail="Admin access required")

    return await get_user_analytics()


@router.get("/location-insights", summary="Get Location-based Insights")
async def location_insights_endpoint(user=Depends(get_current_user)):
    """
    Get location-based insights

    Returns analytics about reports based on location:
    - Reports heat map data
    - Reports by state comparison 
    - Top reporting cities
    """
    # In a production system, check for admin role
    # if user.role != UserRole.ADMINISTRATOR.value:
    #     raise HTTPException(status_code=403, detail="Admin access required")

    return await get_location_insights()


@router.get("/category-analysis", summary="Get Category Analysis")
async def category_analysis_endpoint(user=Depends(get_current_user)):
    """
    Get category analysis data

    Returns analytics about categories:
    - Category distribution over time
    - Category resolution rates
    - Category report complexity
    """
    # In a production system, check for admin role
    # if user.role != UserRole.ADMINISTRATOR.value:
    #     raise HTTPException(status_code=403, detail="Admin access required")

    return await get_category_analysis()


@router.get("/system-performance", summary="Get System Performance Metrics")
async def system_performance_endpoint(user=Depends(get_current_user)):
    """
    Get system performance metrics

    Returns analytics about the system:
    - Database performance 
    - API usage statistics
    - Error rates and issues
    """
    # In a production system, check for admin role
    # if user.role != UserRole.ADMINISTRATOR.value:
    #     raise HTTPException(status_code=403, detail="Admin access required")

    return await get_system_performance()
