from ..utils.auth import get_user_id, BaseResponse
from ..utils.database import get_db_connection
from ..utils.image_helpers import get_images_for_report
from typing import List, Dict, Any, Optional, cast
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Depends, Request, Query, status
from datetime import datetime
import math

router = APIRouter()

# Model definitions for request/response


class ImageModel(BaseModel):
    imageID: int
    imageURL: str
    reportID: int
    uploadedAt: Optional[str] = None


class ReportBase(BaseModel):
    reportID: int
    title: str
    description: str
    categoryID: int
    locationID: int
    userID: int
    createdAt: str
    updatedAt: Optional[str] = None
    status: Optional[str] = None


class ReportListItem(BaseModel):
    reportID: int
    title: str
    description: str
    categoryName: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    username: Optional[str] = None
    imageCount: Optional[int] = 0
    upvotes: Optional[int] = 0
    downvotes: Optional[int] = 0
    createdAt: str


class PaginatedReportListResponse(BaseModel):
    reports: List[ReportListItem]
    totalPages: int
    currentPage: int
    totalReports: int


class ReportDetail(ReportBase):
    categoryName: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    username: Optional[str] = None
    upvotes: Optional[int] = 0
    downvotes: Optional[int] = 0
    images: Optional[List[ImageModel]] = []


class ReportCreate(BaseModel):
    title: str = Field(..., description="Report title")
    description: str = Field(...,
                             description="Detailed description of the report")
    categoryID: int = Field(..., description="Category ID")
    locationID: int = Field(..., description="Location ID")


class ReportUpdate(BaseModel):
    title: Optional[str] = Field(None, description="Report title")
    description: Optional[str] = Field(
        None, description="Detailed description")
    categoryID: Optional[int] = Field(None, description="Category ID")
    locationID: Optional[int] = Field(None, description="Location ID")


class ReportResponse(BaseResponse):
    id: int = Field(..., description="Report ID")


@router.get("/search", response_model=PaginatedReportListResponse, summary="Search Reports")
async def search_reports(
    query: Optional[str] = Query(
        None, description="Search term for title or description"),
    category: Optional[str] = Query(
        None, description="Filter by category name"),
    location: Optional[str] = Query(
        None, description="Filter by location (street, city, state)"),
    dateFrom: Optional[str] = Query(
        None, description="Filter by start date (YYYY-MM-DD)"),
    dateTo: Optional[str] = Query(
        None, description="Filter by end date (YYYY-MM-DD)"),
    page: int = Query(1, ge=1, description="Page number for pagination"),
    limit: int = Query(
        10, ge=1, le=100, description="Number of items per page"),
    sortBy: Optional[str] = Query(
        "createdAt_desc", description="Sort order (e.g., createdAt_desc, createdAt_asc, upvotes_desc, upvotes_asc)")
):
    """
    Search reports with filters, pagination, and sorting

    Returns a paginated list of reports matching the specified filters and sort order.
    This endpoint does not require authentication.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Base SQL for filters
        filter_sql_parts = []
        params = []

        if query:
            filter_sql_parts.append(
                "(r.title LIKE %s OR r.description LIKE %s)")
            params.extend([f'%{query}%', f'%{query}%'])

        if category:
            filter_sql_parts.append("c.categoryName = %s")
            params.append(category)

        if location:
            filter_sql_parts.append(
                "(l.street LIKE %s OR l.city LIKE %s OR l.state LIKE %s OR l.country LIKE %s)")
            params.extend([f'%{location}%', f'%{location}%',
                          f'%{location}%', f'%{location}%'])

        if dateFrom:
            filter_sql_parts.append("r.createdAt >= %s")
            params.append(dateFrom)

        if dateTo:
            filter_sql_parts.append("r.createdAt <= %s")
            params.append(dateTo)

        where_clause = " AND ".join(
            filter_sql_parts) if filter_sql_parts else "1=1"

        # Count total matching reports for pagination
        count_sql = f"""
            SELECT COUNT(DISTINCT r.reportID) as totalRecords
            FROM reports r
            LEFT JOIN categories c ON r.categoryID = c.categoryID
            LEFT JOIN locations l ON r.locationID = l.locationID
            LEFT JOIN users u ON r.userID = u.userID
            WHERE {where_clause}
        """
        cursor.execute(count_sql, params)
        total_records_result = cursor.fetchone()
        total_records = total_records_result['totalRecords'] if total_records_result else 0

        total_pages = math.ceil(
            total_records / limit) if total_records > 0 else 1

        # Determine ORDER BY clause
        order_by_clause = "ORDER BY r.createdAt DESC"  # Default sort
        if sortBy == "createdAt_asc":
            order_by_clause = "ORDER BY r.createdAt ASC"
        elif sortBy == "upvotes_desc":
            # Secondary sort for tie-breaking
            order_by_clause = "ORDER BY upvotes DESC, r.createdAt DESC"
        elif sortBy == "upvotes_asc":
            # Secondary sort for tie-breaking
            order_by_clause = "ORDER BY upvotes ASC, r.createdAt ASC"

        # Main query for fetching reports with pagination and sorting
        offset = (page - 1) * limit

        sql = f"""
            SELECT r.reportID, r.title, r.description, r.createdAt, r.updatedAt,
                   c.categoryName, l.street, l.city, l.state, 
                   u.username, 
                   (SELECT COUNT(DISTINCT i.imageID) FROM images i WHERE i.reportID = r.reportID) as imageCount,
                   COALESCE(SUM(CASE WHEN v.voteType = 'upvote' THEN 1 ELSE 0 END), 0) as upvotes,
                   COALESCE(SUM(CASE WHEN v.voteType = 'downvote' THEN 1 ELSE 0 END), 0) as downvotes
            FROM reports r
            LEFT JOIN categories c ON r.categoryID = c.categoryID
            LEFT JOIN locations l ON r.locationID = l.locationID
            LEFT JOIN users u ON r.userID = u.userID
            LEFT JOIN votes v ON r.reportID = v.reportID
            WHERE {where_clause}
            GROUP BY r.reportID, r.title, r.description, r.createdAt, r.updatedAt, c.categoryName, l.street, l.city, l.state, u.username
            {order_by_clause}
            LIMIT %s OFFSET %s
        """

        final_params = params + [limit, offset]
        cursor.execute(sql, final_params)
        reports_data = cursor.fetchall()

        # Convert datetime objects to strings
        processed_reports = []
        for report_row in reports_data:
            report_dict = dict(report_row)
            if report_dict.get('createdAt') and isinstance(report_dict['createdAt'], datetime):
                report_dict['createdAt'] = report_dict['createdAt'].isoformat()
            if report_dict.get('updatedAt') and isinstance(report_dict.get('updatedAt'), datetime):
                report_dict['updatedAt'] = report_dict['updatedAt'].isoformat()
            processed_reports.append(ReportListItem(**report_dict))

        return PaginatedReportListResponse(
            reports=processed_reports,
            totalPages=total_pages,
            currentPage=page,
            totalReports=total_records
        )
    except Exception as e:
        import traceback
        print(f"Error in search_reports: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {str(e)}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()


@router.get("/{report_id}/details", response_model=ReportDetail, summary="Get Report Details")
async def get_report_details(report_id: int):
    """
    Get detailed information about a specific report

    Returns comprehensive details about a report, including location, images, and votes.
    This endpoint does not require authentication.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get report details
        cursor.execute(
            """SELECT r.*, c.categoryName, l.*, u.username,
            COUNT(DISTINCT i.imageID) as imageCount,
            SUM(CASE WHEN v.voteType = 'upvote' THEN 1 ELSE 0 END) as upvotes,
            SUM(CASE WHEN v.voteType = 'downvote' THEN 1 ELSE 0 END) as downvotes
            FROM reports r
            LEFT JOIN categories c ON r.categoryID = c.categoryID
            LEFT JOIN locations l ON r.locationID = l.locationID
            LEFT JOIN users u ON r.userID = u.userID
            LEFT JOIN images i ON r.reportID = i.reportID
            LEFT JOIN votes v ON r.reportID = v.reportID
            WHERE r.reportID = %s
            GROUP BY r.reportID""",
            (report_id,)
        )
        report = cursor.fetchone()

        if not report:
            raise HTTPException(status_code=404, detail="Report not found")

        # Get appropriate images using the helper function
        images = get_images_for_report(report_id, cursor, conn)

        if report:
            report_dict = dict(report)
            report_dict['images'] = images

            # Convert datetime objects to strings in report
            if 'createdAt' in report_dict and isinstance(report_dict.get('createdAt'), datetime):
                report_dict['createdAt'] = report_dict.get(
                    'createdAt').isoformat()
            if 'updatedAt' in report_dict and isinstance(report_dict.get('updatedAt'), datetime):
                report_dict['updatedAt'] = report_dict.get(
                    'updatedAt').isoformat()

            return report_dict

        raise HTTPException(status_code=404, detail="Report not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED, summary="Create Report")
async def create_report(data: ReportCreate, user_id: int = Depends(get_user_id)):
    """
    Create a new report

    Creates a new report with the specified details.
    User ID can be provided as a query parameter, otherwise uses default user.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Print debug info
        print(
            f"Creating report with: title={data.title}, description={data.description}, categoryID={data.categoryID}, locationID={data.locationID}, userID={user_id}")

        # Verify the user exists, or use a default user
        cursor.execute(
            "SELECT UserID FROM Users WHERE UserID = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            print(f"User ID {user_id} not found. Using default user ID 1")
            # User not found - use a default user (first admin)
            cursor.execute(
                "SELECT UserID FROM Users WHERE Role = 'Administrator' LIMIT 1")
            admin = cursor.fetchone()

            if admin:
                user_id = admin['UserID']
            else:
                # If no admin found, use first available user
                cursor.execute("SELECT UserID FROM Users LIMIT 1")
                default_user = cursor.fetchone()
                if default_user:
                    user_id = default_user['UserID']
                else:
                    raise HTTPException(
                        status_code=400, detail="No valid users found in the system")

        # Now create the report with valid user ID
        cursor.execute(
            """INSERT INTO reports 
            (title, description, categoryID, locationID, userID) 
            VALUES (%s, %s, %s, %s, %s)""",
            (data.title, data.description, data.categoryID,
             data.locationID, user_id)
        )

        report_id = cursor.lastrowid
        conn.commit()

        print(f"Report created successfully with ID: {report_id}")
        return {"message": "Report created successfully", "id": report_id}
    except Exception as e:
        # Detailed error logging
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR creating report: {str(e)}")
        print(f"ERROR details: {error_details}")
        raise HTTPException(
            status_code=500, detail=f"Failed to create report: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.put("/{report_id}", response_model=BaseResponse, summary="Update Report")
async def update_report(report_id: int, data: ReportUpdate, user_id: int = Depends(get_user_id)):
    """
    Update a report

    Updates an existing report with new details.
    This is a public API so any user can update any report.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if report exists
        cursor.execute(
            "SELECT * FROM reports WHERE reportID = %s",
            (report_id,)
        )
        report = cursor.fetchone()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")

        # Update with new data or keep existing
        title = data.title if data.title is not None else report.get(
            'title', '')
        description = data.description if data.description is not None else report.get(
            'description', '')
        category_id = data.categoryID if data.categoryID is not None else report.get(
            'categoryID', 0)
        location_id = data.locationID if data.locationID is not None else report.get(
            'locationID', 0)

        cursor.execute(
            """UPDATE reports SET 
            title = %s, description = %s, categoryID = %s, locationID = %s 
            WHERE reportID = %s""",
            (title, description, category_id, location_id, report_id)
        )

        conn.commit()
        return {"message": "Report updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.delete("/{report_id}", response_model=BaseResponse, summary="Delete Report")
async def delete_report(report_id: int, user_id: int = Depends(get_user_id)):
    """
    Delete a report

    Permanently removes a report from the system.
    This is a public API so any user can delete any report.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if report exists
        cursor.execute(
            "SELECT * FROM reports WHERE reportID = %s",
            (report_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Report not found")

        # Delete related records first
        # Delete votes
        cursor.execute("DELETE FROM votes WHERE reportID = %s", (report_id,))

        # Delete images
        cursor.execute("DELETE FROM images WHERE reportID = %s", (report_id,))

        # Finally delete the report
        cursor.execute("DELETE FROM reports WHERE reportID = %s", (report_id,))

        conn.commit()
        return {"message": "Report deleted successfully"}
    except Exception as e:
        conn.rollback()  # Rollback changes if any error occurs
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
