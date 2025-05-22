"""
Location Analytics

This module provides functions for location-based analytics data:
- Reports heat map
- Reports by state
- Top reporting cities
- Time-filtered heat map data
"""
from fastapi import HTTPException
from typing import Optional
from datetime import datetime, timedelta
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


async def get_filtered_heatmap_data(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    category_id: Optional[int] = None
):
    """
    Get time-filtered heat map data for location analytics

    This function allows filtering heat map data by time period and category
    to create more specific visualizations.

    Args:
        start_date: Optional start date for filtering
        end_date: Optional end date for filtering
        category_id: Optional category ID for filtering

    Returns:
        dict: Filtered heat map data with additional metadata
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Build dynamic query with filters
        query = """
            SELECT 
                l.latitude,
                l.longitude,
                COUNT(r.reportID) as weight,
                MAX(r.createdAt) as latest_report,
                MIN(r.createdAt) as earliest_report,
                MAX(c.categoryName) as most_common_category
            FROM reports r
            JOIN locations l ON r.locationID = l.locationID
            JOIN categories c ON r.categoryID = c.categoryID
            WHERE 1=1
        """
        params = []

        if start_date:
            query += " AND r.createdAt >= %s"
            params.append(start_date)

        if end_date:
            query += " AND r.createdAt <= %s"
            params.append(end_date)

        if category_id:
            query += " AND r.categoryID = %s"
            params.append(category_id)

        query += """
            GROUP BY l.latitude, l.longitude
            ORDER BY weight DESC
        """

        cursor.execute(query, params)
        heat_map_data = cursor.fetchall() or []

        # Get summary metadata
        total_reports = sum(point['weight']
                            for point in heat_map_data) if heat_map_data else 0
        hotspots = len(
            [point for point in heat_map_data if point['weight'] > 10]) if heat_map_data else 0

        return {
            "heat_map_data": heat_map_data,
            "metadata": {
                "total_points": len(heat_map_data),
                "total_reports": total_reports,
                "hotspot_count": hotspots,
                "filters_applied": {
                    "start_date": start_date.isoformat() if start_date else None,
                    "end_date": end_date.isoformat() if end_date else None,
                    "category_id": category_id
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


async def get_location_trends(period: str = "monthly", start_date: Optional[datetime] = None, end_date: Optional[datetime] = None):
    """
    Get location trends over time

    Analyzes how report locations change over time using the specified period

    Args:
        period: Time period for aggregation ("daily", "weekly", "monthly", "quarterly", "yearly")
        start_date: Optional start date for filtering data
        end_date: Optional end date for filtering data

    Returns:
        dict: Location trend data over time
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

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

        # Build query with date range filtering
        query = f"""
            SELECT 
                {format_expression} as time_period,
                l.state,
                COUNT(r.reportID) as report_count
            FROM reports r
            JOIN locations l ON r.locationID = l.locationID
            WHERE 1=1
        """

        params = []

        # Add date range filters if provided
        if start_date:
            query += " AND r.createdAt >= %s"
            params.append(start_date)
        else:
            # Default to last year if no start date provided
            query += " AND r.createdAt >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)"

        if end_date:
            query += " AND r.createdAt <= %s"
            params.append(end_date)

        query += f"""
            GROUP BY time_period, l.state
            ORDER BY time_period, report_count DESC
        """

        cursor.execute(query, params)
        trend_data = cursor.fetchall() or []

        # Get top 5 states with same date range
        state_query = """
            SELECT 
                l.state,
                COUNT(r.reportID) as report_count
            FROM reports r
            JOIN locations l ON r.locationID = l.locationID
            WHERE 1=1
        """

        state_params = []

        # Use the same date filters
        if start_date:
            state_query += " AND r.createdAt >= %s"
            state_params.append(start_date)
        else:
            state_query += " AND r.createdAt >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)"

        if end_date:
            state_query += " AND r.createdAt <= %s"
            state_params.append(end_date)

        state_query += """
            GROUP BY l.state
            ORDER BY report_count DESC
            LIMIT 5
        """

        cursor.execute(state_query, state_params)
        top_states = [row['state'] for row in cursor.fetchall()] or []

        # Structure data for visualization
        timeline = {}
        for row in trend_data:
            period = row['time_period']
            state = row['state']
            count = row['report_count']

            if period not in timeline:
                timeline[period] = {}

            timeline[period][state] = count

        # Format for frontend chart
        result = []
        for period, states in timeline.items():
            entry = {"period": period}

            # Add top states data
            for state in top_states:
                entry[state] = states.get(state, 0)

            result.append(entry)

        return {
            "trend_data": result,
            "top_states": top_states
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
