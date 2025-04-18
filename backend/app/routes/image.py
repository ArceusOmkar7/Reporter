from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, status, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import os
import time
from werkzeug.utils import secure_filename
from ..utils.database import get_db_connection
from ..utils.auth import get_user_id, BaseResponse
from ..config.config import Config

router = APIRouter()

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# Model definitions for request/response
class ImageModel(BaseModel):
    imageID: int
    imageURL: str
    reportID: int
    uploadedAt: Optional[str] = None


class ImageResponse(BaseResponse):
    id: int = Field(..., description="Image ID")


@router.get("/{report_id}", response_model=List[ImageModel], summary="Get Report Images")
async def get_report_images(report_id: int):
    """
    Get all images for a specific report

    Returns a list of all images associated with the specified report.
    This endpoint does not require authentication.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM images WHERE reportID = %s", (report_id,))
        images = cursor.fetchall()
        return images
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.post("/{report_id}", response_model=ImageResponse, status_code=status.HTTP_201_CREATED, summary="Upload Image")
async def upload_image(
    report_id: int,
    file: UploadFile = File(...,
                            description="Image file to upload (PNG, JPG, JPEG, GIF)"),
    user_id: int = Depends(get_user_id),
    request: Request = None,
):
    """
    Upload an image for a report

    Uploads a new image file and associates it with the specified report.
    Supported formats: PNG, JPG, JPEG, GIF.
    Requires authentication.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file part")

    if file.filename == '':
        raise HTTPException(status_code=400, detail="No selected file")

    if not allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="File type not allowed")

    try:
        # Create a unique filename with timestamp and report ID to avoid collisions
        original_filename = secure_filename(file.filename)
        name, ext = os.path.splitext(original_filename)
        timestamp = int(time.time())
        unique_filename = f"report_{report_id}_{name}_{timestamp}{ext}"

        # Save the file with unique name
        filepath = os.path.join(Config.UPLOAD_FOLDER, unique_filename)

        # Save uploaded file
        contents = await file.read()
        with open(filepath, "wb") as f:
            f.write(contents)

        # Store with /backend/uploads/ prefix for easier frontend access
        # Include full URL for cross-origin access
        db_filepath = f"http://localhost:8000/backend/uploads/{unique_filename}"

        # Save to database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO images (imageURL, reportID) VALUES (%s, %s)",
            (db_filepath, report_id)
        )
        conn.commit()
        return {"message": "Image uploaded successfully", "id": cursor.lastrowid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.delete("/{image_id}", response_model=BaseResponse, summary="Delete Image")
async def delete_image(image_id: int, user_id: int = Depends(get_user_id)):
    """
    Delete an image

    Permanently removes an image from the system and deletes the associated file.
    Requires authentication.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get image info
        cursor.execute("SELECT * FROM images WHERE imageID = %s", (image_id,))
        image = cursor.fetchone()
        if not image:
            raise HTTPException(status_code=404, detail="Image not found")

        # Extract filename from the stored URL path
        # URLs are stored as http://localhost:8000/backend/uploads/filename
        image_url = image['imageURL']
        filename = os.path.basename(image_url)

        # Delete file
        filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
        if os.path.exists(filepath):
            os.remove(filepath)

        # Delete from database
        cursor.execute("DELETE FROM images WHERE imageID = %s", (image_id,))
        conn.commit()
        return {"message": "Image deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
