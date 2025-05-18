"""
User Analytics

This module provides functions for user-related analytics data:
- User registrations by date
- User distribution by location
- User distribution by role
- Most active users
"""
from fastapi import HTTPException
from ..utils.database import get_db_connection
from .models import UserAnalytics
import datetime


async def get_user_analytics():
    """
    Get comprehensive user analytics

    Returns analytics for users including:
    - Registration trend by date
    - User distribution by location (India-specific)
    - User distribution by role
    - Most active users based on report submissions

    Returns:
        dict: User analytics data
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get user registrations by date (last 30 days)
        cursor.execute("""
            SELECT 
                DATE(u.createdAt) as date, 
                COUNT(u.userID) as count
            FROM users u
            WHERE u.createdAt >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY DATE(u.createdAt)
            ORDER BY date
        """)
        registrations_raw = cursor.fetchall()

        # Convert date objects to ISO format strings
        registrations_by_date = []
        for item in registrations_raw:
            if isinstance(item['date'], (datetime.date, datetime.datetime)):
                registrations_by_date.append({
                    'date': item['date'].isoformat(),
                    'count': item['count']
                })
            else:
                registrations_by_date.append(item)

        # Provide default empty array if no data
        if not registrations_by_date:
            registrations_by_date = [
                {'date': datetime.datetime.now().date().isoformat(), 'count': 0}]

        # Get users by location (state in India)
        cursor.execute("""
            SELECT 
                IFNULL(l.state, 'Unknown') as locationName,
                COUNT(DISTINCT u.userID) as count
            FROM users u
            LEFT JOIN reports r ON u.userID = r.userID
            LEFT JOIN locations l ON r.locationID = l.locationID
            GROUP BY l.state
            ORDER BY count DESC
        """)
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
        cursor.execute("""
            SELECT 
                u.username,
                COUNT(r.reportID) as reportCount
            FROM users u
            LEFT JOIN reports r ON u.userID = r.userID
            GROUP BY u.userID, u.username
            ORDER BY reportCount DESC
            LIMIT 10
        """)
        most_active_users = cursor.fetchall() or []

        return {
            "registrations_by_date": registrations_by_date,
            "users_by_location": users_by_location,
            "users_by_role": users_by_role,
            "most_active_users": most_active_users
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"User analytics error: {str(e)}")
    finally:
        cursor.close()
        conn.close()
