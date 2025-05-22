# Reporter Application Changelog

This file documents all notable changes to the Reporter application.

## [Unreleased]

## [1.2.0] - 2025-05-22

### Changed
- Removed time period component from the UserAnalytics page
- Removed user registration trends from the UserAnalytics page
- Fixed HTML structure in the User Role Distribution Card
- Simplified analytics UI to focus on current data rather than historical trends
- Updated documentation to reflect that user registration dates are not tracked in the database

### Technical Details
- The UserAnalytics.tsx component now uses a fixed "monthly" period for all analytics calls
- Backend API still supports the period parameter for consistency
- User registration trends (registrations_by_date) will always return an empty array
- Documentation in the API, README files, and code comments updated to reflect these changes

## [1.1.0] - 2025-04-15

### Added
- Admin analytics dashboard with charts and visualizations
- User analytics showing role distribution, location distribution, and most active users
- Report analytics with category distribution and location insights
- System performance metrics

### Changed
- Improved UI for the admin dashboard
- Enhanced API response structure for analytics endpoints

### Fixed
- Multiple UI bugs in the report creation form
- Backend validation for image uploads

## [1.0.0] - 2025-03-01

### Added
- Initial release of the Reporter application
- User authentication and profile management
- Report creation and management
- Image upload and handling
- Location-based reporting
- Voting system
- Category-based organization
- Responsive design for all devices
