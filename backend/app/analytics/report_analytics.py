"""
Report Analytics

This module provides functions for report-related analytics data:
- Reports by category
- Reports by location
- Report trends
- Recent reports
"""
from fastapi import HTTPException
from typing import Optional
from ..utils.database import get_db_connection
from .models import ReportAnalytics
import datetime
from datetime import date


async def get_report_analytics(
    period: str = "daily",
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """
    Get comprehensive report analytics

    Returns analytics for reports including:
    - Distribution by category
    - Distribution by location
    - Trend over time with custom period (daily, weekly, monthly, quarterly, yearly)
    - Recent reports

    Args:
        period: Time period for trend aggregation (daily, weekly, monthly, quarterly, yearly)
        start_date: Optional start date for filtering data
        end_date: Optional end date for filtering data

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

        # Different time format based on period
        time_format = {
            "daily": "%Y-%m-%d",
            "weekly": "%Y-%u",  # Year-Week number
            "monthly": "%Y-%m",
            "quarterly": "%Y-Q%q",  # Year-Quarter (MySQL 8.0+)
            "yearly": "%Y"
        }.get(period, "%Y-%m-%d")

        # Handle quarterly format for older MySQL versions
        if period == "quarterly":
            format_expression = "CONCAT(YEAR(r.createdAt), '-Q', QUARTER(r.createdAt))"
        else:
            format_expression = f"DATE_FORMAT(r.createdAt, '{time_format}')"

        # Get report trend with time period options and date range
        trend_query = f"""
            SELECT 
                {format_expression} as date, 
                COUNT(r.reportID) as count
            FROM reports r
            WHERE 1=1
        """

        params = []

        # Add date range filters if provided
        if start_date:
            trend_query += " AND r.createdAt >= %s"
            params.append(start_date)
        else:
            # Default to last 30 days if no start date provided
            trend_query += " AND r.createdAt >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)"

        if end_date:
            trend_query += " AND r.createdAt <= %s"
            params.append(end_date)

        trend_query += f"""
            GROUP BY date
            ORDER BY date
        """

        cursor.execute(trend_query, params)
        reports_trend_raw = cursor.fetchall() or []

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
            "recent_reports": recent_reports,
            "period": period
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
