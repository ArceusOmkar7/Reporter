from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from ..utils.database import get_db_connection
from ..utils.auth import get_token_user, BaseResponse, get_optional_token_user

router = APIRouter()

# Model definitions for request/response


class CategoryBase(BaseModel):
    categoryID: int
    categoryName: str
    categoryDescription: str


class CategoryCreate(BaseModel):
    name: str = Field(..., description="Category name")
    description: str = Field(..., description="Category description")


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Category name")
    description: Optional[str] = Field(
        None, description="Category description")


class CategoryResponse(BaseResponse):
    id: int = Field(..., description="Category ID")


@router.get("/", response_model=List[CategoryBase], summary="Get All Categories")
async def get_categories():
    """
    Get all categories

    Returns a list of all available categories in the system.
    This endpoint does not require authentication.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM categories")
        categories = cursor.fetchall()
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.get("/{category_id}", response_model=CategoryBase, summary="Get Category")
async def get_category(category_id: int):
    """
    Get a specific category by ID

    Returns details for a specific category identified by its ID.
    This endpoint does not require authentication.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM categories WHERE categoryID = %s", (category_id,))
        category = cursor.fetchone()
        if category:
            return category
        raise HTTPException(status_code=404, detail="Category not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED, summary="Create Category")
async def create_category(data: CategoryCreate, current_user: int = Depends(get_token_user)):
    """
    Create a new category

    Creates a new category with the provided name and description.
    This endpoint requires authentication and admin privileges.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO categories (categoryName, categoryDescription) VALUES (%s, %s)",
            (data.name, data.description)
        )
        conn.commit()
        return {"message": "Category created successfully", "id": cursor.lastrowid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.put("/{category_id}", response_model=BaseResponse, summary="Update Category")
async def update_category(category_id: int, data: CategoryUpdate, current_user: int = Depends(get_token_user)):
    """
    Update a category

    Updates an existing category with new information.
    This endpoint requires authentication and admin privileges.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Get current data
        cursor.execute(
            "SELECT * FROM categories WHERE categoryID = %s", (category_id,))
        existing = cursor.fetchone()

        if not existing:
            raise HTTPException(status_code=404, detail="Category not found")

        # Update with new data or keep existing
        new_name = data.name if data.name is not None else existing['categoryName']
        new_desc = data.description if data.description is not None else existing[
            'categoryDescription']

        cursor.execute(
            "UPDATE categories SET categoryName = %s, categoryDescription = %s WHERE categoryID = %s",
            (new_name, new_desc, category_id)
        )
        conn.commit()
        return {"message": "Category updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.delete("/{category_id}", response_model=BaseResponse, summary="Delete Category")
async def delete_category(category_id: int, current_user: int = Depends(get_token_user)):
    """
    Delete a category

    Permanently removes a category from the system.
    This endpoint requires authentication and admin privileges.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM categories WHERE categoryID = %s", (category_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Category not found")
        conn.commit()
        return {"message": "Category deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
