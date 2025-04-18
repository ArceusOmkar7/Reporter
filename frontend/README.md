# Reporter Frontend

## Overview

This is the frontend for the Reporter application, built with React, TypeScript, and Shadcn UI components. It provides a modern, responsive user interface for submitting reports, browsing petitions, and interacting with the community.

## Features

1. **User Authentication**
   - Sign up and sign in functionality
   - Persistent authentication state using localStorage
   - Protected routes for authenticated features

2. **Report Browsing**
   - Browse all public reports with search functionality
   - Filter reports by category, location, and date range
   - Sort reports by various criteria

3. **Report Details**
   - View detailed information about each report
   - Interactive map showing report location
   - Upvote/downvote functionality
   - Image gallery for attached photos

4. **Report Creation**
   - Multi-step form with progress indicator
   - Rich text editor for detailed descriptions
   - Category selection from predefined options
   - Interactive map for precise location selection
   - Multiple image uploads with previews

5. **Report Editing**
   - Edit existing reports with the same interface as creation
   - Update location with interactive map selection
   - Add or remove images from reports

6. **Interactive Map Features**
   - OpenStreetMap integration with Leaflet.js
   - Current location detection and centering
   - Click-to-select location functionality
   - Draggable marker for precise positioning
   - Real-time coordinate updates

7. **Responsive Design**
   - Mobile-first approach with responsive components
   - Adaptive layout for different screen sizes
   - Touch-friendly interactions for mobile users

## Technology Stack

- **Framework**: React with TypeScript
- **UI Components**: Shadcn UI (based on Tailwind CSS)
- **State Management**: React Context API and React Query
- **Routing**: React Router
- **Form Handling**: React Hook Form
- **Mapping**: Leaflet.js with OpenStreetMap
- **API Client**: Custom fetch-based client

## Getting Started

### Prerequisites

- Node.js (v16.0.0 or higher)
- npm (v7.0.0 or higher) or Bun

### Installation

```bash
# Install dependencies
npm install
# or
bun install
```

### Development

```bash
# Start development server
npm run dev
# or
bun dev
```

The development server will start at `http://localhost:5173`

### Building for Production

```bash
# Build the application
npm run build
# or
bun run build
```

## Project Structure

- `src/`
  - `components/` - Reusable UI components
  - `contexts/` - React context providers
  - `hooks/` - Custom React hooks
  - `lib/` - Utility functions and API services
  - `pages/` - Page components
  - `App.tsx` - Main application component
  - `main.tsx` - Entry point

## Usage

### Creating a Report

1. Navigate to the "Create Report" page
2. Fill in the basic information (title, description, category)
3. Add location details:
   - Enter address information manually
   - Click "Use my current location" to automatically detect your location
   - Use the interactive map to select a precise location by clicking or dragging the marker
   - The latitude and longitude coordinates will update automatically
4. Upload images (optional)
5. Submit the report

### Editing a Report

1. Navigate to a report you've created
2. Click the "Edit" button
3. Update information as needed
4. For location updates:
   - Use the interactive map to select a new location
   - The coordinates will update in real-time
   - All location changes are saved when you submit the form
5. Save your changes

## Known Issues

- The map may not display properly in some older browsers
- Location services require HTTPS in production environments
- Current location detection may be less accurate on some mobile devices

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request
