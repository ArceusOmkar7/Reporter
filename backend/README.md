# Reporter Backend

## Overview

This is the backend for the Reporter application, built with FastAPI and MySQL. It provides RESTful API endpoints for user authentication, report submission, image uploads, voting, and more.

## Completed Tasks

1. **Database Setup**
   - Created the database schema in `table_creation.sql`.
   - Established database connection in `utils/database.py`.

2. **Authentication**
   - Implemented authentication logic in `app/routes/auth.py`.
   - Utility functions for authentication in `app/utils/auth.py` including JWT token handling.

3. **Models**
   - Defined models for:
     - Categories (`app/models/Categories.py`)
     - Images (`app/models/Images.py`)
     - Location (`app/models/Location.py`)
     - Reports (`app/models/Reports.py`)
     - User (`app/models/User.py`)
     - UserInfo (`app/models/UserInfo.py`)
     - Votes (`app/models/Votes.py`)

4. **Routes**
   - Created API endpoints for:
     - Authentication (`app/routes/auth.py`)
     - Categories (`app/routes/category.py`)
     - Images (`app/routes/image.py`)
     - Location (`app/routes/location.py`)
     - Reports (`app/routes/report.py`)
     - Users (`app/routes/user.py`)
     - Votes (`app/routes/vote.py`)

5. **Configuration**
   - Added configuration settings in `app/config/config.py`.

6. **Framework Migration**
   - Successfully migrated from Flask to FastAPI.

## Installation

1. Create a virtual environment:
   ```
   python -m venv env
   ```

2. Activate the virtual environment:
   - On Windows: `env\Scripts\activate`
   - On Unix/MacOS: `source env/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up the MySQL database:
   - Create a database named `reporter_py`
   - Run the SQL commands in `table_creation.sql`
   - Update database credentials in `app/config/config.py` if needed

## Running the Server

Start the server with:
```
python run.py
```

The API will be available at `http://localhost:8000`

## API Documentation

FastAPI automatically generates interactive API documentation. After starting the server, access:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Authentication

#### POST /api/auth/register
- **Description**: Register a new user.
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "contactNumber": "string",
    "middleName": "string" // optional
  }
  ```

#### POST /api/auth/login
- **Description**: Authenticate a user and return a token.
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

### Categories

#### GET /api/category/
- **Description**: Retrieve all categories.

#### GET /api/category/{category_id}
- **Description**: Retrieve a specific category.

#### POST /api/category/
- **Description**: Add a new category (requires authentication).

#### PUT /api/category/{category_id}
- **Description**: Update a category (requires authentication).

#### DELETE /api/category/{category_id}
- **Description**: Delete a category (requires authentication).

### Reports

#### GET /api/report/search
- **Description**: Search reports with filters.
- **Query Parameters**:
  - `query`: Search term.
  - `category`: Category name.
  - `location`: Location name.
  - `dateFrom`: Start date.
  - `dateTo`: End date.

#### GET /api/report/{report_id}/details
- **Description**: Retrieve detailed information about a specific report.

#### POST /api/report/
- **Description**: Submit a new report (requires authentication).

#### PUT /api/report/{report_id}
- **Description**: Update a report (requires authentication).

#### DELETE /api/report/{report_id}
- **Description**: Delete a report (requires authentication).

### User

#### GET /api/user/profile
- **Description**: Retrieve the current user's profile (requires authentication).

#### PUT /api/user/profile
- **Description**: Update the current user's profile (requires authentication).

### Location

#### GET /api/location/
- **Description**: Retrieve all locations.

#### GET /api/location/{location_id}
- **Description**: Retrieve a specific location.

#### POST /api/location/
- **Description**: Create a new location (requires authentication).

#### PUT /api/location/{location_id}
- **Description**: Update a location (requires authentication).

#### DELETE /api/location/{location_id}
- **Description**: Delete a location (requires authentication).

### Image

#### GET /api/image/{report_id}
- **Description**: Retrieve all images for a specific report.

#### POST /api/image/{report_id}
- **Description**: Upload an image for a report (requires authentication).

#### DELETE /api/image/{image_id}
- **Description**: Delete an image (requires authentication).

### Vote

#### POST /api/vote/{report_id}
- **Description**: Vote on a report (upvote/downvote) (requires authentication).

#### GET /api/vote/{report_id}
- **Description**: Retrieve vote counts for a report.

#### DELETE /api/vote/{report_id}
- **Description**: Remove a user's vote from a report (requires authentication).

## Authorization

Protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Pending Tasks

1. **Testing**
   - Write unit tests for all routes and models.
   - Ensure adequate test coverage.

2. **Error Handling**
   - Add more comprehensive error handling throughout the application.

3. **Documentation**
   - Complete API documentation with examples.
   - Add code comments where necessary.

4. **Deployment**
   - Set up deployment scripts.
   - Configure environment variables for production.

5. **Frontend Integration**
   - Test API endpoints with the frontend.
   - Fix any integration issues.

## Notes
- Authentication is handled using JWT tokens.
- File uploads are stored in the `uploads` directory.
- The API follows RESTful principles.