# Reporter Backend

## Overview

This is the backend for the Reporter application, built with FastAPI and MySQL. It provides RESTful API endpoints for user authentication, report submission, image uploads, voting, and more. The API is fully public with no authentication requirements.

## Completed Tasks

1. **Database Setup**
   - Created the database schema in `table_creation.sql`.
   - Established database connection in `utils/database.py`.

2. **Simple Authentication**
   - Implemented simple username/password authentication (no JWT tokens)
   - Passwords are stored as plain text for simplicity
   - All API endpoints are publicly accessible without authentication
   - No bearer token required for API access

3. **Models**
   - Defined database models for:
     - Categories (`app/models/Categories.py`)
     - Images (`app/models/Images.py`)
     - Location (`app/models/Location.py`)
     - Reports (`app/models/Reports.py`)
     - User (`app/models/User.py`)
     - UserInfo (`app/models/UserInfo.py`)
     - Votes (`app/models/Votes.py`)
   - Added Pydantic models for request/response validation and documentation

4. **API Endpoints**
   - Created comprehensive RESTful API endpoints for:
     - Authentication (`app/routes/auth.py`)
     - Categories (`app/routes/category.py`)
     - Images (`app/routes/image.py`) with file upload support
     - Locations (`app/routes/location.py`)
     - Reports (`app/routes/report.py`) with search functionality
     - Users (`app/routes/user.py`) with public access to all user data
     - Votes (`app/routes/vote.py`)
   - Added a health check endpoint at the base URL (`/`)

5. **Framework Migration**
   - Successfully migrated from Flask to FastAPI
   - Enhanced performance with asynchronous request handling
   - Implemented proper dependency injection patterns
   - Added automatic API documentation using OpenAPI

6. **Documentation**
   - Added detailed API documentation with Swagger UI and ReDoc integration
   - Documented request/response models with field descriptions
   - Improved code documentation with detailed docstrings

7. **Error Handling**
   - Implemented comprehensive error responses
   - Added request validation using Pydantic models
   - Created consistent error response format across all endpoints

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

Access the health check endpoint at `http://localhost:8000/` to verify the API is running correctly.

## API Documentation

FastAPI automatically generates interactive API documentation. After starting the server, access:
- Swagger UI: `http://localhost:8000/docs` - Interactive documentation with try-it-now functionality
- ReDoc: `http://localhost:8000/redoc` - Alternative documentation format

### Using Swagger UI for API Testing

1. Go to `http://localhost:8000/docs`
2. Register a new user using the `/api/auth/register` endpoint
3. Login with your username and password using the `/api/auth/login` endpoint
4. All API endpoints are publicly accessible without authentication
5. The users endpoint shows information for all users through `/api/user/all`

### Authentication Endpoints

#### POST /api/auth/register
- **Description**: Register a new user.
- **Request Body**: Username, password, name, email, contact info
- **Response**: User ID and success message

#### POST /api/auth/login
- **Description**: Authenticate user with username and password
- **Request Body**: Username and password
- **Response**: User information

### User Endpoints

#### GET /api/user/all
- **Description**: Get all users in the system
- **Response**: List of all users with their profiles

#### GET /api/user/profile/{user_id}
- **Description**: Get user profile by ID
- **Response**: User profile details

### Test Endpoints

#### GET /
- **Description**: API health check endpoint
- **Response**: API status information with timestamp

### Data Endpoints

All data endpoints follow RESTful principles with consistent patterns:
- GET endpoints for retrieving data
- POST endpoints for creating new resources
- PUT endpoints for updating existing resources
- DELETE endpoints for removing resources

All endpoints are public and don't require authentication.

## Pending Tasks

1. **Testing**
   - Write comprehensive unit tests for all endpoints
   - Implement integration tests for critical user flows
   - Set up automated testing pipeline

2. **Frontend Integration**
   - Complete integration with frontend application
   - Add client-side error handling for API responses

## Technical Details

- **Authentication**: Simple username/password authentication
- **Password Storage**: Plain text (no encryption)
- **Database**: MySQL with connection pooling
- **File Storage**: Local file system with secure naming
- **API Documentation**: OpenAPI 3.0 (Swagger/ReDoc)
- **Framework**: FastAPI with asynchronous request handling
- **Validation**: Pydantic models with field validation

## Notes
- All API endpoints are publicly accessible
- All user data is publicly accessible through the API
- Passwords are stored as plain text for simplicity
- File uploads are stored in the `uploads` directory with secure filenames
- All endpoints return standardized response formats
- Error responses include specific error details for debugging