"""
Helper functions for image handling
"""
from datetime import datetime
from ..utils.database import get_db_connection


def get_images_for_report(report_id: int, cursor=None, connection=None):
    """
    Get appropriate images for a report.

    First tries to get user-uploaded images. If none exist,
    falls back to default images based on the report's category.

    Args:
        report_id: The ID of the report to get images for
        cursor: Optional database cursor to reuse
        connection: Optional database connection to reuse

    Returns:
        A list of image dictionaries
    """
    should_close_conn = False
    should_close_cursor = False

    try:
        # Create connection and cursor if not provided
        if connection is None:
            connection = get_db_connection()
            should_close_conn = True

        if cursor is None:
            cursor = connection.cursor(dictionary=True)
            should_close_cursor = True

        # Get user uploaded images (filter out default category images)
        cursor.execute(
            """SELECT * FROM images 
            WHERE reportID = %s 
            AND imageURL NOT LIKE '%default_%'""",
            (report_id,)
        )
        user_images = cursor.fetchall()

        # Convert datetime objects to strings
        for image in user_images:
            if image and 'uploadedAt' in image and isinstance(image.get('uploadedAt'), datetime):
                image['uploadedAt'] = image.get('uploadedAt').isoformat()

        # If user has uploaded images, use those
        if user_images:
            return user_images

        # Otherwise, look for default images directly linked to this report
        cursor.execute(
            """SELECT i.* 
            FROM images i
            WHERE i.reportID = %s
            AND imageURL LIKE '%default_%'""",
            (report_id,)
        )
        default_images = cursor.fetchall()

        # Convert datetime objects to strings
        for image in default_images:
            if image and 'uploadedAt' in image and isinstance(image.get('uploadedAt'), datetime):
                image['uploadedAt'] = image.get('uploadedAt').isoformat()

        # If we found default images for this report, use those
        if default_images:
            return default_images

        # Last resort: try to find default images matching this report's category
        try:
            # Get a default image with matching category
            cursor.execute(
                """SELECT i.* FROM images i
                JOIN reports r ON i.reportID = r.reportID
                WHERE i.imageURL LIKE '%default_%'
                AND r.categoryID = (
                    SELECT categoryID FROM reports WHERE reportID = %s
                )
                LIMIT 1""",
                (report_id,)
            )
            category_images = cursor.fetchall()

            # Convert datetime objects to strings
            for image in category_images:
                if image and 'uploadedAt' in image and isinstance(image.get('uploadedAt'), datetime):
                    image['uploadedAt'] = image.get('uploadedAt').isoformat()

            if category_images:
                return category_images
        except Exception:
            pass  # Silently handle this error and try the fallback

        # Final fallback: just get any default image
        cursor.execute(
            """SELECT i.* FROM images i
            WHERE i.imageURL LIKE '%default_%'
            LIMIT 1"""
        )
        fallback_images = cursor.fetchall()

        # Convert datetime objects to strings
        for image in fallback_images:
            if image and 'uploadedAt' in image and isinstance(image.get('uploadedAt'), datetime):
                image['uploadedAt'] = image.get('uploadedAt').isoformat()

        return fallback_images

    except Exception as e:
        raise e
    finally:
        if should_close_cursor and cursor:
            cursor.close()
        if should_close_conn and connection:
            connection.close()
