"""
Report Analytics

This module provides functions for report-related analytics data:
- Reports by category
- Reports by location
- Report trends
- Recent reports
"""
from fastapi import HTTPException
from ..utils.database import get_db_connection
from .models import ReportAnalytics
import datetime


async def get_report_analytics():
    """
    Get comprehensive report analytics

    Returns analytics for reports including:
    - Distribution by category
    - Distribution by location
    - Trend over time
    - Recent reports

    Returns:
        dict: Report analytics data
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get reports by category
        cursor.execute("""
            SELECT c.categoryName, COUNT(r.reportID) as count
            FROM reports r
            LEFT JOIN categories c ON r.categoryID = c.categoryID
            GROUP BY c.categoryName
            ORDER BY count DESC
        """)
        reports_by_category = cursor.fetchall()

        # Get reports by location (state/city)
        cursor.execute("""
            SELECT 
                CONCAT(l.city, ', ', l.state) as locationName,
                COUNT(r.reportID) as count
            FROM reports r
            JOIN locations l ON r.locationID = l.locationID
            GROUP BY l.state, l.city
            ORDER BY count DESC
        """)
        reports_by_location = cursor.fetchall()

        # Get report trend over last 30 days
        cursor.execute("""
            SELECT 
                DATE(r.createdAt) as date, 
                COUNT(r.reportID) as count
            FROM reports r
            WHERE r.createdAt >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY DATE(r.createdAt)
            ORDER BY date
        """)
        reports_trend_raw = cursor.fetchall()

        # Convert date objects to ISO format strings
        reports_trend = []
        for item in reports_trend_raw:
            if isinstance(item['date'], (datetime.date, datetime.datetime)):
                reports_trend.append({
                    'date': item['date'].isoformat(),
                    'count': item['count']
                })
            else:
                reports_trend.append(item)

        # Get recent reports
        cursor.execute("""
            SELECT 
                r.reportID, r.title, r.description, r.createdAt,
                u.username,
                c.categoryName,
                CONCAT(l.city, ', ', l.state) as location
            FROM reports r
            LEFT JOIN users u ON r.userID = u.userID
            LEFT JOIN categories c ON r.categoryID = c.categoryID
            LEFT JOIN locations l ON r.locationID = l.locationID
            ORDER BY r.createdAt DESC
            LIMIT 10
        """)
        recent_reports = cursor.fetchall()

        return {
            "reports_by_category": reports_by_category,
            "reports_by_location": reports_by_location,
            "reports_trend": reports_trend,
            "recent_reports": recent_reports
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
