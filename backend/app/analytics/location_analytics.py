"""
Location Analytics

This module provides functions for location-based analytics data:
- Reports heat map
- Reports by state
- Top reporting cities
"""
from fastapi import HTTPException
from ..utils.database import get_db_connection


async def get_location_insights():
    """
    Get location-based insights

    Returns analytics about reports based on location:
    - Reports heat map data
    - Reports by state comparison 
    - Top reporting cities

    Returns:
        dict: Location analytics data
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get reports by state
        cursor.execute("""
            SELECT 
                l.state as name,
                COUNT(r.reportID) as value,
                MAX(l.latitude) as latitude,
                MAX(l.longitude) as longitude
            FROM reports r
            JOIN locations l ON r.locationID = l.locationID
            GROUP BY l.state
            ORDER BY value DESC
        """)
        reports_by_state = cursor.fetchall() or []

        # Get top reporting cities
        cursor.execute("""
            SELECT 
                l.city as name,
                l.state,
                COUNT(r.reportID) as value,
                l.latitude,
                l.longitude
            FROM reports r
            JOIN locations l ON r.locationID = l.locationID
            GROUP BY l.city, l.state, l.latitude, l.longitude
            ORDER BY value DESC
            LIMIT 20
        """)
        top_cities = cursor.fetchall() or []

        # Get heat map data (all report locations with count)
        cursor.execute("""
            SELECT 
                l.latitude,
                l.longitude,
                COUNT(r.reportID) as weight
            FROM reports r
            JOIN locations l ON r.locationID = l.locationID
            GROUP BY l.latitude, l.longitude
            ORDER BY weight DESC
        """)
        heat_map_data = cursor.fetchall() or []

        return {
            "reports_by_state": reports_by_state,
            "top_cities": top_cities,
            "heat_map_data": heat_map_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
