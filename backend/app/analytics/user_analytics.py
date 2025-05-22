"""
User Analytics

This module provides functions for user-related analytics data:
- User distribution by location
- User distribution by role
- Most active users
"""
from fastapi import HTTPException
from ..utils.database import get_db_connection
from .models import UserAnalytics
from datetime import datetime, timedelta
import logging
from typing import Optional

# Set up logger
logger = logging.getLogger(__name__)


async def get_user_analytics(
    period: str = "daily",
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """
    Get comprehensive user analytics

    Returns analytics for users including:
    - User distribution by location (India-specific)
    - User distribution by role
    - Most active users based on report submissions

    Note: User registration trend data is not available as createdAt is not tracked in the database schema.

    Args:
        period: Time period for other metrics aggregation (daily, weekly, monthly, quarterly, yearly)
        start_date: Optional start date for filtering data
        end_date: Optional end date for filtering data

    Returns:
        dict: User analytics data
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Since we don't have createdAt field in the Users table,
        # we won't generate registration trend data
        registrations_by_date = []
        logger.info(
            "User registration trends removed as registration dates are not tracked in the database schema")

        # Determine time ranges for other analytics
        today = datetime.now().date()

        if start_date and end_date:
            # Use custom date range if provided
            start = start_date.date() if isinstance(
                start_date, datetime) else start_date
            end = end_date.date() if isinstance(end_date, datetime) else end_date
        else:
            # Default ranges based on period
            if period == "daily":
                start = today - timedelta(days=30)
                end = today
            elif period == "weekly":
                start = today - timedelta(weeks=12)
                end = today
            elif period == "monthly":
                start = today.replace(month=today.month-12 if today.month > 12 else today.month +
                                      12-12, year=today.year-1 if today.month <= 12 else today.year)
                end = today
            elif period == "quarterly":
                start = today.replace(year=today.year-1)
                end = today
            elif period == "yearly":
                start = today.replace(year=today.year-5)
                end = today
            else:
                start = today - timedelta(days=30)
                end = today

        # Get users by location (state in India)
        location_query = """
            SELECT 
                IFNULL(l.state, 'Unknown') as locationName,
                COUNT(DISTINCT u.userID) as count
            FROM users u
            LEFT JOIN reports r ON u.userID = r.userID
            LEFT JOIN locations l ON r.locationID = l.locationID
            WHERE 1=1
        """

        location_params = []

        # Apply date filters to user activity (reports)
        if start_date:
            location_query += " AND (r.createdAt IS NULL OR r.createdAt >= %s)"
            location_params.append(start_date)

        if end_date:
            location_query += " AND (r.createdAt IS NULL OR r.createdAt <= %s)"
            location_params.append(end_date)

        location_query += """
            GROUP BY l.state
            ORDER BY count DESC
        """

        cursor.execute(location_query, location_params)
        users_by_location = cursor.fetchall() or []

        # Get users by role
        cursor.execute("""
            SELECT 
                role as name,
                COUNT(userID) as value
            FROM users
            GROUP BY role
        """)
        users_by_role = cursor.fetchall() or []

        # Get most active users (by report count)
        active_query = """
            SELECT 
                u.username,
                COUNT(r.reportID) as reportCount
            FROM users u
            LEFT JOIN reports r ON u.userID = r.userID
            WHERE 1=1
        """

        active_params = []

        if start_date:
            active_query += " AND (r.createdAt IS NULL OR r.createdAt >= %s)"
            active_params.append(start_date)

        if end_date:
            active_query += " AND (r.createdAt IS NULL OR r.createdAt <= %s)"
            active_params.append(end_date)

        active_query += """
            GROUP BY u.userID, u.username
            ORDER BY reportCount DESC
            LIMIT 10
        """

        cursor.execute(active_query, active_params)
        most_active_users = cursor.fetchall() or []

        return {
            "registrations_by_date": [],  # Empty list since we don't track this data
            "users_by_location": users_by_location,
            "users_by_role": users_by_role,
            "most_active_users": most_active_users,
            "period": period
        }
    except Exception as e:
        logger.error(f"User analytics error: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"User analytics error: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
