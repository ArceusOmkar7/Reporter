# Reporter App

A community-based petition and reporting platform that allows users to submit, browse, and interact with public reports. 

## Project Structure

The project is organized into two main parts:
- `frontend/` - React/TypeScript application with Shadcn UI components
- Backend - Python FastAPI service (in project root)

## Frontend-Backend Integration Status

### Completed

1. **API Service Layer**
   - Created configuration file with all backend endpoints
   - Defined TypeScript interfaces for API requests/responses
   - Implemented comprehensive API services for all backend resources

2. **Authentication**
   - Implemented user authentication context with localStorage persistence
   - Connected sign-in and sign-up forms to backend authentication endpoints
   - Updated Header component to conditionally display options based on auth status

3. **Report Browsing**
   - Integrated browse page with backend search API
   - Implemented filtering by search query, category, and location
   - Added loading states and error handling

4. **Report Details**
   - Connected detailed report view to backend API
   - Implemented upvote/downvote functionality
   - Added report deletion capability for owners
   - Integrated map view for location data

5. **Create Petition Flow**
   - Implemented multi-step form with modular component architecture
   - Created basic info step for title, description, and category selection
   - Added location step for address input and coordinates
   - Built image upload step with preview functionality
   - Integrated form navigation and progress indicator components

### Pending Implementation

1. **Report Editing**
   - Edit form for modifying existing reports
   - Image management in edit mode

2. **User Profile**
   - View and edit user profile information
   - Display reports created by a user

3. **Home Page**
   - Featured or trending reports display
   - Statistics or summary information

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
# Activate virtual environment
# On Windows
env\Scripts\activate

# On macOS/Linux
source env/bin/activate

# Start server
uvicorn main:app --reload
```

## API Documentation

The backend API is documented with OpenAPI/Swagger. When the backend server is running, visit:
- `/docs` for Swagger UI
- `/redoc` for ReDoc UI