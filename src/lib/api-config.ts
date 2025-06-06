// API configuration

// Base API URL - adjust this based on your backend server location
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
let determinedApiBaseUrl: string;

if (rawApiBaseUrl) {
  if (
    rawApiBaseUrl.startsWith("http://") ||
    rawApiBaseUrl.startsWith("https://")
  ) {
    determinedApiBaseUrl = rawApiBaseUrl;
  } else if (
    rawApiBaseUrl.includes("localhost") ||
    rawApiBaseUrl.includes("127.0.0.1")
  ) {
    // Assume http for localhost if no protocol is specified
    determinedApiBaseUrl = `http://${rawApiBaseUrl}`;
  } else {
    // Default to https for other domains if no protocol is specified
    determinedApiBaseUrl = `https://${rawApiBaseUrl}`;
  }
} else {
  // Fallback to local development URL
  determinedApiBaseUrl = "http://127.0.0.1:8000";
}

export const API_BASE_URL = determinedApiBaseUrl;

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
  },
  // Users
  USER: {
    ALL: "/api/user/all",
    PROFILE: (id: number) => `/api/user/profile/${id}`,
    UPDATE: (id: number) => `/api/user/profile/${id}`,
  },
  // Reports
  REPORT: {
    SEARCH: "/api/report/search",
    CREATE: "/api/report/",
    DETAILS: (id: number) => `/api/report/${id}/details`,
    UPDATE: (id: number) => `/api/report/${id}`,
    DELETE: (id: number) => `/api/report/${id}`,
  },
  // Categories
  CATEGORY: {
    ALL: "/api/category/",
    DETAILS: (id: number) => `/api/category/${id}`,
  },
  // Locations
  LOCATION: {
    ALL: "/api/location/",
    CREATE: "/api/location/",
    DETAILS: (id: number) => `/api/location/${id}`,
    UPDATE: (id: number) => `/api/location/${id}`,
  },
  // Images
  IMAGE: {
    GET: (reportId: number) => `/api/image/${reportId}`,
    UPLOAD: (reportId: number) => `/api/image/${reportId}`,
    UPLOAD_URL: (reportId: number) => `/api/image/${reportId}/url`,
    DELETE: (id: number) => `/api/image/${id}`,
  },
  // Votes
  VOTE: {
    GET: (reportId: number) => `/api/vote/${reportId}`,
    VOTE: (reportId: number) => `/api/vote/${reportId}`,
    DELETE: (reportId: number) => `/api/vote/${reportId}`,
  },
  // Analytics
  ANALYTICS: {
    REPORTS: "/api/analytics/reports",
    USERS: "/api/analytics/users",
    LOCATION_INSIGHTS: "/api/analytics/location-insights",
    FILTERED_HEATMAP: "/api/analytics/filtered-heatmap",
    LOCATION_TRENDS: "/api/analytics/location-trends",
    CATEGORY_ANALYSIS: "/api/analytics/category-analysis",
    SYSTEM_PERFORMANCE: "/api/analytics/system-performance",
  },
  // Admin
  ADMIN: {
    EXECUTE_QUERY: "/api/admin/execute-query",
    GENERATE_SQL: "/api/admin/generate-sql-from-natural-language",
  },
};
