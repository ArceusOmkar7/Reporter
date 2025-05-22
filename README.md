# Reporter

A full-stack web application for reporting and tracking community issues, built with React, FastAPI, and MySQL.

## Project Overview

Reporter is a platform that enables users to submit, track, and manage community reports. Users can create detailed reports with images, locations, and categories, while other users can vote and engage with these reports.

### Key Features

- User authentication and profile management
- Report creation and management
- Image upload and handling
- Location-based reporting
- Voting system
- Category-based organization
- Responsive design for all devices

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS with shadcn/ui components
- React Context API for state management
- React Hook Form for form handling
- Axios for API integration

### Backend
- FastAPI (Python)
- MySQL database
- Pydantic for data validation
- OpenAPI/Swagger for API documentation
- File system for image storage

## Project Structure

```
reporter/
├── frontend/          # React frontend application
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
│
├── backend/          # FastAPI backend application
│   ├── app/         # Application code
│   ├── uploads/     # Uploaded files
│   └── requirements.txt  # Backend dependencies
│
└── README.md        # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8 or higher
- MySQL 8.0 or higher
- npm, yarn, or bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/reporter.git
   cd reporter
   ```

2. Set up the backend:
   ```bash
   cd backend
   python -m venv env
   # On Windows
   env\Scripts\activate
   # On Unix/MacOS
   source env/bin/activate
   
   pip install -r requirements.txt
   ```

3. Set up the database:
   - Create a MySQL database named `reporter_py`
   - Run the SQL commands in `backend/table_creation.sql`
   - Run the sample data in `backend/table_insertion.sql`

4. Set up the frontend:
   ```bash
   cd frontend
   npm install
   # or
   yarn install
   # or
   bun install
   ```

5. Configure environment variables:
   - Backend: Update `backend/app/config/config.py` with your database credentials
   - Frontend: Create `.env` file with `VITE_API_URL=http://localhost:8000`

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   python run.py
   ```
   The API will be available at `http://localhost:8000`

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```
   The frontend will be available at `http://localhost:5173`

## API Documentation

The backend API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Development Status

### Completed Features

1. **Backend**
   - Database schema and setup
   - User authentication
   - Report management
   - Image handling
   - Location tracking
   - Voting system
   - API documentation
   - User analytics API with simplified design

2. **Frontend (User Side - Completed)**
   - User authentication
   - Report creation and editing
   - Image upload
   - Location selection
   - Report browsing
   - User profiles
   - Responsive design
   - Voting functionality
   
3. **Analytics Features**
   - User role distribution visualization
   - User location distribution charts
   - Most active users tracking

### In Progress

1. **Frontend (Admin Dashboard)**
   - Admin user management
   - Report monitoring and moderation
   - Category management
   - Dashboard analytics
   - System-wide statistics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## Testing

### Backend Testing
```bash
cd backend
pytest
```

### Frontend Testing
```bash
cd frontend
npm test
# or
yarn test
# or
bun test
```

## Deployment

### Backend Deployment
1. Build the application:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Set up a production database
3. Configure environment variables
4. Deploy using your preferred hosting service

### Frontend Deployment
1. Build the application:
   ```bash
   cd frontend
   npm run build
   # or
   yarn build
   # or
   bun build
   ```

2. Deploy the contents of the `dist` directory to your hosting service

## Security Considerations

- Currently using basic authentication (to be upgraded to JWT)
- Passwords stored in plain text (to be hashed)
- All endpoints are public (to be secured)
- File uploads need validation
- Input sanitization needed

## Recent Changes

### User Analytics Module (May 22, 2025)
- Removed time period component from UserAnalytics page
- Removed user registration trends chart as the database does not track user registration dates (no `createdAt` field in Users table)
- Fixed HTML structure in the User Role Distribution Card
- Updated backend API to return empty array for registration trends
- Simplified analytics UI to focus on current data rather than historical trends

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- FastAPI for the backend framework
- React and Vite for the frontend
- Tailwind CSS and shadcn/ui for the UI components
- MySQL for the database