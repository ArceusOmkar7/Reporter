"""
Category Analytics

This module provides functions for category-related analytics data:
- Category distribution
- Category trends
- Category effectiveness (resolution rates)
"""
from fastapi import HTTPException
from ..utils.database import get_db_connection
from datetime import datetime
from typing import Optional


async def get_category_analysis(
    period: str = "monthly",
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """
    Get category analysis data

    Returns analytics about categories:
    - Most reported categories
    - Category trends over time with customizable period and date range
    - Category by location analysis

    Args:
        period: Time period for trend aggregation (daily, weekly, monthly, quarterly, yearly)
        start_date: Optional start date for filtering data
        end_date: Optional end date for filtering data

    Returns:
        dict: Category analytics data
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get most reported categories
        most_categories_query = """
            SELECT 
                c.categoryName as name,
                COUNT(r.reportID) as value
            FROM reports r
            JOIN categories c ON r.categoryID = c.categoryID
            WHERE 1=1
        """

        most_params = []

        if start_date:
            most_categories_query += " AND r.createdAt >= %s"
            most_params.append(start_date)

        if end_date:
            most_categories_query += " AND r.createdAt <= %s"
            most_params.append(end_date)

        most_categories_query += """
            GROUP BY c.categoryName
            ORDER BY value DESC
        """

        cursor.execute(most_categories_query, most_params)
        most_reported_categories = cursor.fetchall() or []

        # Different time format based on period
        time_format = {
            "daily": "%Y-%m-%d",
            "weekly": "%Y-%u",  # Year-Week number
            "monthly": "%Y-%m",
            "quarterly": "%Y-Q%q",  # Year-Quarter (MySQL 8.0+)
            "yearly": "%Y"
        }.get(period, "%Y-%m")

        # Handle quarterly format for older MySQL versions
        if period == "quarterly":
            format_expression = "CONCAT(YEAR(r.createdAt), '-Q', QUARTER(r.createdAt))"
        else:
            format_expression = f"DATE_FORMAT(r.createdAt, '{time_format}')"

        # Get category distribution over time with period options
        trends_query = f"""
            SELECT 
                {format_expression} as period_date,
                c.categoryName,
                COUNT(r.reportID) as count
            FROM reports r
            JOIN categories c ON r.categoryID = c.categoryID
            WHERE 1=1
        """

        trend_params = []

        if start_date:
            trends_query += " AND r.createdAt >= %s"
            trend_params.append(start_date)
        else:
            # Default to last 6 months if no start date
            trends_query += " AND r.createdAt >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)"

        if end_date:
            trends_query += " AND r.createdAt <= %s"
            trend_params.append(end_date)

        trends_query += f"""
            GROUP BY period_date, c.categoryName
            ORDER BY period_date, c.categoryName
        """

        cursor.execute(trends_query, trend_params)
        category_trends = cursor.fetchall() or []

        # Get category distribution by location with optional date filtering
        location_query = """
            SELECT 
                c.categoryName,
                l.state,
                COUNT(r.reportID) as count
            FROM reports r
            JOIN categories c ON r.categoryID = c.categoryID
            JOIN locations l ON r.locationID = l.locationID
            WHERE 1=1
        """

        location_params = []

        if start_date:
            location_query += " AND r.createdAt >= %s"
            location_params.append(start_date)

        if end_date:
            location_query += " AND r.createdAt <= %s"
            location_params.append(end_date)

        location_query += """
            GROUP BY c.categoryName, l.state
            ORDER BY c.categoryName, count DESC
        """

        cursor.execute(location_query, location_params)
        category_by_location = cursor.fetchall() or []

        return {
            "most_reported_categories": most_reported_categories,
            "category_trends": category_trends,
            "category_by_location": category_by_location,
            "period": period
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Category analytics error: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
