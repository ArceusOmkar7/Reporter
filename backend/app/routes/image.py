from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, status, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import os
import time
import requests
from werkzeug.utils import secure_filename
from ..utils.database import get_db_connection
from ..utils.auth import get_user_id, BaseResponse
from ..utils.image_helpers import get_images_for_report
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


class ImageURLUpload(BaseModel):
    image_url: str = Field(..., description="URL of the image to add")


@router.get("/{report_id}", response_model=List[ImageModel], summary="Get Report Images")
async def get_report_images(report_id: int):
    """
    Get all images for a specific report

    Returns a list of all images associated with the specified report.
    This endpoint does not require authentication.
    """
    try:
        # Use the helper function to get appropriate images
        return get_images_for_report(report_id)
    except Exception as e:
        print(f"Error getting images for report {report_id}: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get images: {str(e)}")


@router.post("/{report_id}", response_model=ImageResponse, status_code=status.HTTP_201_CREATED, summary="Upload Image")
async def upload_image(
    report_id: int,
    file: UploadFile = File(
        None, description="Image file to upload (PNG, JPG, JPEG, GIF)"),
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


@router.post("/{report_id}/url", response_model=ImageResponse, status_code=status.HTTP_201_CREATED, summary="Add Image from URL")
async def add_image_from_url(
    report_id: int,
    image_data: ImageURLUpload,
    user_id: int = Depends(get_user_id),
):
    """
    Add an image from URL for a report

    Downloads an image from the provided URL, saves it locally, and associates it with the specified report.
    Requires authentication.
    """
    try:
        print(f"Received image URL: {image_data.image_url}")

        # Basic URL validation
        if not image_data.image_url.startswith(('http://', 'https://')):
            raise HTTPException(
                status_code=400, detail="URL must start with http:// or https://")

        try:
            # Download the image
            response = requests.get(
                image_data.image_url, timeout=10, stream=True)

            # Check if the request was successful
            if response.status_code != 200:
                raise HTTPException(
                    status_code=400, detail=f"Failed to download image: HTTP {response.status_code}")

            # Get content type
            content_type = response.headers.get('Content-Type', '')

            # Determine file extension based on content type or URL
            extension = '.jpg'  # Default
            if 'image/jpeg' in content_type:
                extension = '.jpg'
            elif 'image/png' in content_type:
                extension = '.png'
            elif 'image/gif' in content_type:
                extension = '.gif'
            elif 'image/webp' in content_type:
                extension = '.webp'
            else:
                # Try to get extension from URL
                url_path = image_data.image_url.split(
                    '?')[0]  # Remove query parameters
                if '.' in url_path:
                    url_ext = url_path.split('.')[-1].lower()
                    if url_ext in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
                        extension = f'.{url_ext}'

            # Create a unique filename
            timestamp = int(time.time())
            unique_filename = f"report_{report_id}_url_{timestamp}{extension}"
            filepath = os.path.join(Config.UPLOAD_FOLDER, unique_filename)

            # Save the downloaded image
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)

            # Create the URL for the database
            db_filepath = f"http://localhost:8000/backend/uploads/{unique_filename}"

            # Save to database
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute(
                "INSERT INTO images (imageURL, reportID) VALUES (%s, %s)",
                (db_filepath, report_id)
            )
            conn.commit()

            image_id = cursor.lastrowid
            print(f"Image downloaded and saved successfully: {db_filepath}")
            return {"message": "Image downloaded and saved successfully", "id": image_id}
        except requests.exceptions.RequestException as e:
            print(f"Error downloading image: {str(e)}")
            raise HTTPException(
                status_code=400, detail=f"Error downloading image: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error adding image URL: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Unexpected error: {str(e)}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
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

        # Only delete the file if it's a local file
        image_url = image['imageURL']
        if image_url.startswith("http://localhost:8000/backend/uploads/"):
            filename = os.path.basename(image_url)
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
