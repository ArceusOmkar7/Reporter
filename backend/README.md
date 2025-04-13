# Reporter Backend

## Overview

This is the backend for the Reporter application, built with FastAPI and MySQL. It provides RESTful API endpoints for user authentication, report submission, image uploads, voting, and more.

## Completed Tasks

1. **Database Setup**
   - Created the database schema in `table_creation.sql`.
   - Established database connection in `utils/database.py`.

2. **Authentication**
   - Implemented secure authentication using JWT tokens
   - Added OAuth2 password flow for Swagger UI integration
   - Implemented login, registration and token validation
   - Created robust validation for emails and passwords

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
     - Users (`app/routes/user.py`)
     - Votes (`app/routes/vote.py`)

5. **Framework Migration**
   - Successfully migrated from Flask to FastAPI
   - Enhanced performance with asynchronous request handling
   - Implemented proper dependency injection patterns
   - Added automatic API documentation using OpenAPI

6. **Documentation**
   - Added detailed API documentation with Swagger UI and ReDoc integration
   - Documented request/response models with field descriptions
   - Provided clear authentication requirements for protected endpoints
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

## API Documentation

FastAPI automatically generates interactive API documentation. After starting the server, access:
- Swagger UI: `http://localhost:8000/docs` - Interactive documentation with try-it-now functionality
- ReDoc: `http://localhost:8000/redoc` - Alternative documentation format

### Using Swagger UI for API Testing

1. Go to `http://localhost:8000/docs`
2. Register a new user using the `/api/auth/register` endpoint
3. Click the "Authorize" button at the top right
4. Enter your username and password
5. All authenticated endpoints will now work with your credentials

### Authentication Endpoints

#### POST /api/auth/register
- **Description**: Register a new user.
- **Request Body**: Username, password, name, email, contact info
- **Response**: User ID and success message

#### POST /api/auth/login
- **Description**: Authenticate and get JWT token
- **Request Body**: Username and password
- **Response**: JWT token for authorization

#### POST /api/auth/token
- **Description**: OAuth2 compatible token endpoint (for Swagger UI)
- **Form Data**: Username and password
- **Response**: Access token for use with the authorization system

### Data Endpoints

All data endpoints follow RESTful principles with consistent patterns:
- GET endpoints for retrieving data
- POST endpoints for creating new resources
- PUT endpoints for updating existing resources
- DELETE endpoints for removing resources

Protected endpoints require JWT authentication via Bearer token.

## Authorization

Protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

For Swagger UI, use the "Authorize" button to input credentials.

## Pending Tasks

1. **Testing**
   - Write comprehensive unit tests for all endpoints
   - Implement integration tests for critical user flows
   - Set up automated testing pipeline

2. **Performance Optimization**
   - Add database query optimization for high traffic endpoints
   - Implement caching for frequently accessed data
   - Optimize file upload/download handling

3. **Deployment**
   - Configure production environment settings
   - Set up containerization (Docker)
   - Implement CI/CD pipeline

4. **Frontend Integration**
   - Complete integration with frontend application
   - Implement real-time notifications with WebSockets
   - Add client-side error handling for API responses

5. **Security Enhancements**
   - Implement rate limiting
   - Add CSRF protection
   - Enhance password security (complexity requirements, expiration)

## Technical Details

- **Authentication**: JWT tokens with OAuth2 password flow
- **Database**: MySQL with connection pooling
- **File Storage**: Local file system with secure naming
- **API Documentation**: OpenAPI 3.0 (Swagger/ReDoc)
- **Framework**: FastAPI with asynchronous request handling
- **Validation**: Pydantic models with field validation

## Notes
- Authentication is handled using JWT tokens with 24-hour expiration
- File uploads are stored in the `uploads` directory with secure filenames
- All endpoints return standardized response formats
- Error responses include specific error details for debugging