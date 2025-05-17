"""
Script to check for default images for categories

This script checks if placeholder images for each category exist in the system.
"""

import os
from ..config.config import Config


def download_default_images():
    """
    Check for default images for each category.

    Verifies that placeholder images exist for each category.
    Since images are manually added, this just prints status info.
    """
    # Ensure upload directory exists
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

    # Default images to check
    default_images = [
        "default_traffic.jpg",
        "default_infrastructure.jpg",
        "default_environment.jpg",
        "default_public_safety.jpg",
        "default_community_events.jpg"
    ]

    all_exist = True

    for img_name in default_images:
        filepath = os.path.join(Config.UPLOAD_FOLDER, img_name)

        if os.path.exists(filepath):
            print(f"✓ Image {img_name} exists")
        else:
            print(
                f"✗ Warning: Image {img_name} is missing from {Config.UPLOAD_FOLDER}")
            all_exist = False

    if all_exist:
        print("All default category images are present.")
    else:
        print(
            f"Some default category images are missing. Please add them to the {Config.UPLOAD_FOLDER} directory.")


if __name__ == "__main__":
    # Execute if script is run directly
    download_default_images()
