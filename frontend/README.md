# Reportr Frontend

## Overview

This is the frontend for the Reportr application, built with React, TypeScript, and Vite. It provides a modern, responsive user interface for submitting and managing reports, user authentication, and interacting with the backend API.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **API Integration**: Axios
- **Type Safety**: TypeScript
- **Code Quality**: ESLint

## Completed Features

1. **Authentication**
   - User registration with form validation
   - Login functionality
   - Protected routes
   - Auth context for state management

2. **User Interface**
   - Modern, responsive design using Tailwind CSS
   - Component library with shadcn/ui
   - Custom UI components:
     - ReportCard for displaying reports
     - ImageWithFallback for handling image loading
     - Layout components for consistent page structure
     - Header with navigation

3. **Pages**
   - Home page (`Index.tsx`)
   - Authentication pages:
     - Sign In (`SignIn.tsx`)
     - Sign Up (`SignUp.tsx`)
   - Report management:
     - Create Report (`CreateReport.tsx`)
     - Edit Report (`EditReport.tsx`)
     - Report Details (`ReportDetails.tsx`)
     - Browse Reports (`BrowseReports.tsx`)
   - User Profile (`UserProfile.tsx`)
   - Analytics pages:
     - User Analytics (`UserAnalytics.tsx`) - Shows user role distribution, location distribution, and most active users

4. **API Integration**
   - Comprehensive API service (`api-service.ts`)
   - Type definitions for API responses (`api-types.ts`)
   - API configuration management (`api-config.ts`)
   - Error handling and response processing

5. **Form Handling**
   - Form validation
   - File upload support
   - Error messaging
   - Loading states

## Pending Tasks

1. **User Experience**
   - Add loading skeletons
   - Implement infinite scrolling for reports
   - Add pull-to-refresh functionality
   - Improve error messages and notifications
   - Add success/error toasts

2. **Features**
   - Implement report search functionality
   - Add report filtering options
   - Add report sorting capabilities
   - Implement report sharing
   - Add report comments section
   - Add user notifications

3. **Performance**
   - Implement code splitting
   - Add lazy loading for images
   - Optimize bundle size
   - Add service worker for offline support
   - Implement caching strategies

4. **Testing**
   - Add unit tests for components
   - Add integration tests
   - Add end-to-end tests
   - Set up testing pipeline
   - Add performance testing

5. **Accessibility**
   - Add ARIA labels
   - Implement keyboard navigation
   - Add screen reader support
   - Improve color contrast
   - Add focus management

6. **Documentation**
   - Add component documentation
   - Create style guide
   - Document API integration
   - Add contribution guidelines
   - Create deployment guide

## Installation

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

2. Create a `.env` file in the root directory with:
   ```
   VITE_API_URL=http://localhost:8000
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

## Development

- The application uses TypeScript for type safety
- Components are organized in the `src/components` directory
- Pages are in the `src/pages` directory
- API integration is handled in `src/lib`
- Global state is managed through contexts in `src/contexts`

## Building for Production

```bash
npm run build
# or
yarn build
# or
bun build
```

The build output will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts for state management
│   ├── hooks/          # Custom React hooks
│   ├── lib/           # Utilities and API integration
│   ├── pages/         # Page components
│   └── App.tsx        # Root component
├── public/            # Static assets
└── package.json       # Dependencies and scripts
```

## Notes
- The application uses Vite for fast development and building
- Tailwind CSS is used for styling with shadcn/ui components
- API integration is handled through a centralized service
- Form validation is implemented using React Hook Form
- The application is fully responsive and mobile-friendly

## Recent Changes

### Reporting and Admin Dashboard Enhancements (May 22, 2025)

*   **`BrowseReports.tsx`**:
    *   Integrated pagination UI and logic to handle large datasets of reports.
    *   Added UI elements and handlers for sorting reports.
*   **`admin/ReportManagement.tsx`**:
    *   Implemented pagination and sorting features for managing reports.
    *   Added new filter controls for searching by keyword, and filtering by category and location.
    *   Updated data fetching to use `@tanstack/react-query` and include new filter/sort parameters.
*   **`admin/Dashboard.tsx`**:
    *   Corrected the "Total Reports" summary card to display the accurate count from the `totalReports` field in the API response.
*   **`Index.tsx` (Home Page)**:
    *   Fixed a runtime error (`TypeError: data.sort is not a function`) by adapting to the paginated API response structure (i.e., accessing `response.reports`).

### User Analytics Component (May 22, 2025)
- Removed time period selector component from UserAnalytics page since the database doesn't track user registration dates
- Removed user registration trends chart for the same reason
- Fixed HTML structure in the User Role Distribution Card
- Changed API call to use fixed "monthly" period value for consistency
- Simplified UI to focus on three key analytics visualizations:
  1. User Role Distribution (pie chart)
  2. Users by Location (bar chart)
  3. Most Active Users (table)
