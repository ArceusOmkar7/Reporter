from ..utils.auth import get_user_id, BaseResponse
from ..utils.database import get_db_connection
from typing import List, Dict, Any, Optional, cast
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Depends, Request, Query, status
from datetime import datetime

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


@router.get("/search", response_model=List[ReportListItem], summary="Search Reports")
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
        None, description="Filter by end date (YYYY-MM-DD)")
):
    """
    Search reports with filters

    Returns a list of reports matching the specified filters.
    This endpoint does not require authentication.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        sql = """
            SELECT r.*, c.categoryName, l.street, l.city, l.state, 
            u.username, COUNT(DISTINCT i.imageID) as imageCount,
            SUM(CASE WHEN v.voteType = 'upvote' THEN 1 ELSE 0 END) as upvotes,
            SUM(CASE WHEN v.voteType = 'downvote' THEN 1 ELSE 0 END) as downvotes
            FROM reports r
            LEFT JOIN categories c ON r.categoryID = c.categoryID
            LEFT JOIN locations l ON r.locationID = l.locationID
            LEFT JOIN users u ON r.userID = u.userID
            LEFT JOIN images i ON r.reportID = i.reportID
            LEFT JOIN votes v ON r.reportID = v.reportID
            WHERE 1=1
        """
        params = []

        if query:
            sql += " AND (r.title LIKE %s OR r.description LIKE %s)"
            params.extend([f'%{query}%', f'%{query}%'])

        if category:
            sql += " AND c.categoryName = %s"
            params.append(category)

        if location:
            sql += " AND (l.street LIKE %s OR l.city LIKE %s OR l.state LIKE %s OR l.country LIKE %s)"
            params.extend([f'%{location}%', f'%{location}%',
                          f'%{location}%', f'%{location}%'])

        if dateFrom:
            sql += " AND r.createdAt >= %s"
            params.append(dateFrom)

        if dateTo:
            sql += " AND r.createdAt <= %s"
            params.append(dateTo)

        sql += " GROUP BY r.reportID"

        cursor.execute(sql, params)
        reports = cursor.fetchall()

        # Convert datetime objects to strings
        for report in reports:
            if report and isinstance(report.get('createdAt'), datetime):
                report['createdAt'] = report.get('createdAt').isoformat()
            if report and isinstance(report.get('updatedAt'), datetime):
                report['updatedAt'] = report.get('updatedAt').isoformat()

        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
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

        # Get images
        cursor.execute(
            "SELECT * FROM images WHERE reportID = %s",
            (report_id,)
        )
        images = cursor.fetchall()

        # Convert datetime objects to strings in images
        for image in images:
            if image and 'uploadedAt' in image and isinstance(image.get('uploadedAt'), datetime):
                image['uploadedAt'] = image.get('uploadedAt').isoformat()

        if report:
            report_dict = dict(report)
            report_dict['images'] = images

            # Convert datetime objects to strings in report
            if 'createdAt' in report_dict and isinstance(report_dict.get('createdAt'), datetime):
                report_dict['createdAt'] = report_dict.get('createdAt').isoformat()
            if 'updatedAt' in report_dict and isinstance(report_dict.get('updatedAt'), datetime):
                report_dict['updatedAt'] = report_dict.get('updatedAt').isoformat()

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
        cursor = conn.cursor()

        cursor.execute(
            """INSERT INTO reports 
            (title, description, categoryID, locationID, userID) 
            VALUES (%s, %s, %s, %s, %s)""",
            (data.title, data.description, data.categoryID,
             data.locationID, user_id)
        )

        report_id = cursor.lastrowid
        conn.commit()
        return {"message": "Report created successfully", "id": report_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
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
        title = data.title if data.title is not None else report.get('title', '')
        description = data.description if data.description is not None else report.get('description', '')
        category_id = data.categoryID if data.categoryID is not None else report.get('categoryID', 0)
        location_id = data.locationID if data.locationID is not None else report.get('locationID', 0)

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

        # Delete report
        cursor.execute("DELETE FROM reports WHERE reportID = %s", (report_id,))
        conn.commit()
        return {"message": "Report deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
