from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field, validator, confloat
from typing import List, Dict, Any, Optional
from ..utils.database import get_db_connection
from ..utils.auth import get_token_user, BaseResponse

router = APIRouter()

# Model definitions for request/response


class LocationBase(BaseModel):
    locationID: int
    latitude: float
    longitude: float
    street: str
    district: str
    city: str
    state: str
    country: str
    postalCode: str
    landmark: Optional[str] = None


class LocationCreate(BaseModel):
    latitude: confloat(ge=-90, le=90) = Field(...,
                                              description="Latitude (-90 to 90)")
    longitude: confloat(ge=-180, le=180) = Field(...,
                                                 description="Longitude (-180 to 180)")
    street: str = Field(..., description="Street address")
    district: str = Field(..., description="District")
    city: str = Field(..., description="City")
    state: str = Field(..., description="State/Province")
    country: str = Field(..., description="Country")
    postalCode: str = Field(..., description="Postal/ZIP code")
    landmark: Optional[str] = Field(
        None, description="Nearby landmark (optional)")


class LocationUpdate(BaseModel):
    latitude: Optional[confloat(
        ge=-90, le=90)] = Field(None, description="Latitude (-90 to 90)")
    longitude: Optional[confloat(
        ge=-180, le=180)] = Field(None, description="Longitude (-180 to 180)")
    street: Optional[str] = Field(None, description="Street address")
    district: Optional[str] = Field(None, description="District")
    city: Optional[str] = Field(None, description="City")
    state: Optional[str] = Field(None, description="State/Province")
    country: Optional[str] = Field(None, description="Country")
    postalCode: Optional[str] = Field(None, description="Postal/ZIP code")
    landmark: Optional[str] = Field(
        None, description="Nearby landmark (optional)")


class LocationResponse(BaseResponse):
    id: int = Field(..., description="Location ID")


@router.get("/", response_model=List[LocationBase], summary="Get All Locations")
async def get_locations():
    """
    Get all locations

    Returns a list of all location records in the system.
    This endpoint does not require authentication.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM locations")
        locations = cursor.fetchall()
        return locations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.get("/{location_id}", response_model=LocationBase, summary="Get Location")
async def get_location(location_id: int):
    """
    Get a specific location by ID

    Returns detailed information about a specific location.
    This endpoint does not require authentication.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM locations WHERE locationID = %s", (location_id,))
        location = cursor.fetchone()
        if location:
            return location
        raise HTTPException(status_code=404, detail="Location not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.post("/", response_model=LocationResponse, status_code=status.HTTP_201_CREATED, summary="Create Location")
async def create_location(data: LocationCreate, current_user: int = Depends(get_token_user)):
    """
    Create a new location

    Creates a new location record with the provided details.
    Requires authentication.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO locations 
            (latitude, longitude, street, district, city, state, country, postalCode, landmark) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (data.latitude, data.longitude, data.street, data.district,
             data.city, data.state, data.country, data.postalCode,
             data.landmark)
        )
        conn.commit()
        return {"message": "Location created successfully", "id": cursor.lastrowid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.put("/{location_id}", response_model=BaseResponse, summary="Update Location")
async def update_location(location_id: int, data: LocationUpdate, current_user: int = Depends(get_token_user)):
    """
    Update a location

    Updates an existing location with new information.
    Only fields provided will be updated.
    Requires authentication.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if location exists
        cursor.execute(
            "SELECT * FROM locations WHERE locationID = %s", (location_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Location not found")

        # Update fields, using existing values if new ones aren't provided
        latitude = data.latitude if data.latitude is not None else existing['latitude']
        longitude = data.longitude if data.longitude is not None else existing['longitude']
        street = data.street if data.street is not None else existing['street']
        district = data.district if data.district is not None else existing['district']
        city = data.city if data.city is not None else existing['city']
        state = data.state if data.state is not None else existing['state']
        country = data.country if data.country is not None else existing['country']
        postal_code = data.postalCode if data.postalCode is not None else existing[
            'postalCode']
        landmark = data.landmark if data.landmark is not None else existing['landmark']

        cursor.execute(
            """UPDATE locations SET 
            latitude = %s, longitude = %s, street = %s, district = %s, 
            city = %s, state = %s, country = %s, postalCode = %s, landmark = %s 
            WHERE locationID = %s""",
            (latitude, longitude, street, district, city, state,
             country, postal_code, landmark, location_id)
        )
        conn.commit()
        return {"message": "Location updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.delete("/{location_id}", response_model=BaseResponse, summary="Delete Location")
async def delete_location(location_id: int, current_user: int = Depends(get_token_user)):
    """
    Delete a location

    Permanently removes a location from the system.
    Requires authentication.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM locations WHERE locationID = %s", (location_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Location not found")
        conn.commit()
        return {"message": "Location deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
