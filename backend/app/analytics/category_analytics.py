"""
Category Analytics

This module provides functions for category-related analytics data:
- Category distribution
- Category trends
- Category effectiveness (resolution rates)
"""
from fastapi import HTTPException
from ..utils.database import get_db_connection
import datetime


async def get_category_analysis():
    """
    Get category analysis data

    Returns analytics about categories:
    - Most reported categories
    - Category trends over time
    - Category by location analysis

    Returns:
        dict: Category analytics data
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get most reported categories
        cursor.execute("""
            SELECT 
                c.categoryName as name,
                COUNT(r.reportID) as value
            FROM reports r
            JOIN categories c ON r.categoryID = c.categoryID
            GROUP BY c.categoryName
            ORDER BY value DESC
        """)
        most_reported_categories = cursor.fetchall() or []

        # Get category distribution over time (by month)
        cursor.execute("""
            SELECT 
                DATE_FORMAT(r.createdAt, '%Y-%m') as month,
                c.categoryName,
                COUNT(r.reportID) as count
            FROM reports r
            JOIN categories c ON r.categoryID = c.categoryID
            WHERE r.createdAt >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(r.createdAt, '%Y-%m'), c.categoryName
            ORDER BY month, c.categoryName
        """)
        category_trends = cursor.fetchall() or []

        # Get category distribution by location
        cursor.execute("""
            SELECT 
                c.categoryName,
                l.state,
                COUNT(r.reportID) as count
            FROM reports r
            JOIN categories c ON r.categoryID = c.categoryID
            JOIN locations l ON r.locationID = l.locationID
            GROUP BY c.categoryName, l.state
            ORDER BY c.categoryName, count DESC
        """)
        category_by_location = cursor.fetchall() or []

        return {
            "most_reported_categories": most_reported_categories,
            "category_trends": category_trends,
            "category_by_location": category_by_location
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Category analytics error: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
