# Reporter Backend

## Overview

This is the backend for the Reporter application, built with FastAPI and MySQL. It provides RESTful API endpoints for user authentication, report submission, image uploads, voting, and more. The API is fully public with no authentication requirements.

## Completed Tasks

1. **Database Setup**
   - Created the database schema in `table_creation.sql`
   - Added sample data in `table_insertion.sql`
   - Established database connection in `utils/database.py`

2. **Authentication System**
   - Implemented user registration and login endpoints
   - Basic username/password authentication
   - User profile management
   - No JWT tokens or session management

3. **Core Models**
   - Implemented comprehensive data models:
     - Categories (`app/models/Categories.py`)
     - Images (`app/models/Images.py`) with file handling
     - Location (`app/models/Location.py`) with geospatial support
     - Reports (`app/models/Reports.py`) with status tracking
     - User (`app/models/User.py`) with profile management
     - UserInfo (`app/models/UserInfo.py`) for extended user data
     - Votes (`app/models/Votes.py`) for report voting

4. **API Endpoints**
   - Implemented RESTful endpoints for:
     - Authentication (`app/routes/auth.py`)
       - Registration
       - Login
       - Profile management
     - Categories (`app/routes/category.py`)
       - CRUD operations
       - Category listing
     - Images (`app/routes/image.py`)
       - File upload with validation
       - Image retrieval
       - Image deletion
     - Locations (`app/routes/location.py`)
       - Location management
       - Geospatial queries
     - Reports (`app/routes/report.py`)
       - Report submission
       - Report listing and filtering
       - Report status updates
     - Users (`app/routes/user.py`)
       - User profile management
       - User listing
     - Votes (`app/routes/vote.py`)
       - Vote submission
       - Vote counting
   - Health check endpoint at root URL

5. **Framework Features**
   - FastAPI implementation with async support
   - Automatic API documentation (Swagger/ReDoc)
   - Request/response validation with Pydantic
   - Error handling middleware
   - File upload handling
   - Database connection pooling

## Pending Tasks

1. **Testing**
   - Unit tests for all endpoints
   - Integration tests
   - API endpoint testing
   - Database migration tests
   - Load testing

2. **Performance Optimization**
   - Optimize query performance
   - Add connection pooling

4. **Monitoring and Logging**
   - Add structured logging
   - Implement error tracking
   - Add performance monitoring
   - Set up health checks
   - Add usage analytics

5. **Documentation**
   - Add detailed API documentation
   - Create deployment guide
   - Add contribution guidelines
   - Document database schema
   - Add code comments

6. **Features**
   - Add report search functionality
   - Implement report filtering
   - Add user notifications
   - Add report comments
   - Implement report sharing

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
   - Run the sample data in `table_insertion.sql`
   - Update database credentials in `app/config/config.py` if needed

## Running the Server

Start the server with:
```
python run.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Technical Stack

- **Framework**: FastAPI
- **Database**: MySQL
- **File Storage**: Local filesystem
- **Documentation**: OpenAPI/Swagger
- **Validation**: Pydantic
- **Authentication**: Basic auth (to be upgraded)
- **File Handling**: FastAPI UploadFile
- **Error Handling**: Custom middleware

## Notes
- All endpoints are currently public
- Passwords are stored in plain text (to be fixed)
- File uploads are stored in the `uploads` directory
- Database credentials should be configured in `config.py`
- API responses follow a consistent format