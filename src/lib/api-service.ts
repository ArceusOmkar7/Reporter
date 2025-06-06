/**
 * API Service Module
 *
 * This module provides a structured interface for interacting with the Reportr backend API.
 * It includes services for authentication, user management, reports, categories, locations,
 * votes, and image uploads.
 */
import { API_BASE_URL, API_ENDPOINTS } from "./api-config";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserProfileResponse,
  ReportListItem,
  ReportDetail,
  ReportCreate,
  ReportResponse,
  LocationCreate,
  LocationResponse,
  LocationBase,
  CategoryBase,
  VoteCounts,
  VoteCreate,
  BaseResponse,
  ImageResponse,
} from "./api-types";

/**
 * Helper function to handle API errors
 *
 * Processes HTTP error responses, attempts to parse JSON error data,
 * and throws an appropriate error message.
 *
 * @param {Response} response - The fetch API response object
 * @returns {Response} The original response if no error
 * @throws {Error} With error message from API or status code
 */
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    console.error("API Error Response:", response.status, response.statusText);
    let errorData = {};
    try {
      errorData = await response.json();
      console.error("Error data:", errorData);
    } catch (e) {
      console.error("Failed to parse error response as JSON");
    }
    const errorMessage =
      (errorData as { message?: string })?.message ||
      `Error: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }
  return response;
};

/**
 * General API request function with error handling
 *
 * Makes HTTP requests to the API with appropriate headers and error handling.
 * Logs requests and responses for debugging purposes.
 *
 * @template T - The expected response data type
 * @param {string} endpoint - API endpoint path
 * @param {RequestInit} [options] - Fetch API options
 * @returns {Promise<T>} Response data of expected type
 * @throws {Error} If the request fails
 */
const apiRequest = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`Making API request to ${url}`);

  // Set default headers and merge with provided options
  const headers = {
    "Content-Type": "application/json",
    ...(options?.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      // Include credentials for cookies if using session-based auth
      credentials: "include",
    });

    console.log("API Response status:", response.status);
    await handleApiError(response);

    const data = await response.json();
    console.log("API Response data:", data);
    return data;
  } catch (error) {
    console.error("API Request failed:", error);
    throw error;
  }
};

/**
 * Authentication API Service
 *
 * Provides methods for user authentication operations:
 * - Login: Authenticate a user with credentials
 * - Register: Create a new user account
 */
export const AuthAPI = {
  /**
   * Login user with credentials
   *
   * @param {LoginRequest} credentials - Username and password
   * @returns {Promise<LoginResponse>} User data and authentication token
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Register a new user
   *
   * @param {RegisterRequest} userData - New user registration data
   * @returns {Promise<RegisterResponse>} Confirmation with new user ID
   */
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    return apiRequest<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },
};

/**
 * User API Service
 *
 * Provides methods for user operations:
 * - Get user profiles
 * - Update user profiles
 */
export const UserAPI = {
  /**
   * Get all users
   *
   * @returns {Promise<UserProfileResponse[]>} Array of user profiles
   */
  getAllUsers: async (): Promise<UserProfileResponse[]> => {
    return apiRequest<UserProfileResponse[]>(API_ENDPOINTS.USER.ALL);
  },

  /**
   * Get all users (same as getAllUsers but with legacy name)
   *
   * @returns {Promise<UserProfileResponse[]>} Array of user profiles
   */
  getAll: async (): Promise<UserProfileResponse[]> => {
    return apiRequest<UserProfileResponse[]>(API_ENDPOINTS.USER.ALL);
  },

  /**
   * Get user profile by ID
   *
   * @param {number} userId - User ID to fetch profile for
   * @returns {Promise<UserProfileResponse>} User profile data
   */
  getProfile: async (userId: number): Promise<UserProfileResponse> => {
    return apiRequest<UserProfileResponse>(API_ENDPOINTS.USER.PROFILE(userId));
  },

  /**
   * Update user profile
   *
   * @param {number} userId - ID of user to update
   * @param {Partial<UserProfileResponse>} profileData - Updated profile data
   * @param {number} [currentUserId] - ID of the current user making the request
   * @returns {Promise<BaseResponse>} Confirmation message
   */
  updateProfile: async (
    userId: number,
    profileData: Partial<UserProfileResponse>,
    currentUserId?: number
  ): Promise<BaseResponse> => {
    const queryString = currentUserId ? `?user_id=${currentUserId}` : "";
    return apiRequest<BaseResponse>(
      `${API_ENDPOINTS.USER.UPDATE(userId)}${queryString}`,
      {
        method: "PUT",
        body: JSON.stringify(profileData),
      }
    );
  },

  /**
   * Delete user by ID
   *
   * @param {number} userId - ID of user to delete
   * @param {number} [currentUserId] - ID of the current user making the request (admin)
   * @returns {Promise<BaseResponse>} Confirmation message
   */
  delete: async (
    userId: number,
    currentUserId?: number
  ): Promise<BaseResponse> => {
    const queryString = currentUserId
      ? `?current_user_id=${currentUserId}`
      : "";
    return apiRequest<BaseResponse>(
      `${API_ENDPOINTS.USER.PROFILE(userId)}${queryString}`,
      {
        method: "DELETE",
      }
    );
  },
};

// Report API service
export const ReportAPI = {
  // Search reports with filters
  search: async (params?: {
    query?: string;
    category?: string;
    location?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string; // Added sortBy
    page?: number; // Added page
    limit?: number; // Added limit
  }): Promise<{
    reports: ReportListItem[];
    totalPages: number;
    currentPage: number;
    totalReports: number; // Added totalReports
  }> => {
    // Updated return type
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Ensure value is not empty or undefined
          searchParams.append(key, String(value)); // Convert value to string
        }
      });
    }

    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    console.log(`Searching reports with query string: ${queryString}`);

    try {
      // Expect the API to return an object with reports, totalPages, currentPage, and totalReports
      const data = await apiRequest<{
        reports: ReportListItem[];
        totalPages: number;
        currentPage: number;
        totalReports: number; // Added totalReports
      }>(`${API_ENDPOINTS.REPORT.SEARCH}${queryString}`);
      console.log("Received reports data from API:", data);

      // Ensure the response structure is as expected
      if (
        data &&
        Array.isArray(data.reports) &&
        typeof data.totalPages === "number" &&
        typeof data.currentPage === "number" &&
        typeof data.totalReports === "number" // Added check for totalReports
      ) {
        return data;
      } else {
        // If the structure is not as expected, return a default/empty paginated structure
        console.warn("Unexpected API response structure for paginated reports");
        return { reports: [], totalPages: 1, currentPage: 1, totalReports: 0 }; // Added totalReports
      }
    } catch (error) {
      console.error("Report search failed:", error);
      // On error, return a default/empty paginated structure to prevent crashes
      return { reports: [], totalPages: 1, currentPage: 1, totalReports: 0 }; // Added totalReports
    }
  },

  // Get report details by ID
  getDetails: async (reportId: number): Promise<ReportDetail> => {
    return apiRequest<ReportDetail>(API_ENDPOINTS.REPORT.DETAILS(reportId));
  },

  // Create a new report
  create: async (
    reportData: ReportCreate,
    userId?: number
  ): Promise<ReportResponse> => {
    const queryString = userId ? `?user_id=${userId}` : "";
    return apiRequest<ReportResponse>(
      `${API_ENDPOINTS.REPORT.CREATE}${queryString}`,
      {
        method: "POST",
        body: JSON.stringify(reportData),
      }
    );
  },

  // Update a report
  update: async (
    reportId: number,
    reportData: Partial<ReportCreate>,
    userId?: number
  ): Promise<BaseResponse> => {
    const queryString = userId ? `?user_id=${userId}` : "";
    return apiRequest<BaseResponse>(
      `${API_ENDPOINTS.REPORT.UPDATE(reportId)}${queryString}`,
      {
        method: "PUT",
        body: JSON.stringify(reportData),
      }
    );
  },

  // Delete a report
  delete: async (reportId: number, userId?: number): Promise<BaseResponse> => {
    const queryString = userId ? `?user_id=${userId}` : "";
    return apiRequest<BaseResponse>(
      `${API_ENDPOINTS.REPORT.DELETE(reportId)}${queryString}`,
      {
        method: "DELETE",
      }
    );
  },
};

// Category API service
export const CategoryAPI = {
  // Get all categories
  getAll: async (): Promise<CategoryBase[]> => {
    try {
      const data = await apiRequest<CategoryBase[]>(API_ENDPOINTS.CATEGORY.ALL);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Category getAll failed:", error);
      return [];
    }
  },

  // Get category by ID
  getDetails: async (categoryId: number): Promise<CategoryBase> => {
    return apiRequest<CategoryBase>(API_ENDPOINTS.CATEGORY.DETAILS(categoryId));
  },

  // Update a category
  update: async (
    categoryId: number,
    categoryData: { name: string; description: string },
    userId?: number
  ): Promise<BaseResponse> => {
    const queryString = userId ? `?user_id=${userId}` : "";
    return apiRequest<BaseResponse>(
      `${API_ENDPOINTS.CATEGORY.DETAILS(categoryId)}${queryString}`,
      {
        method: "PUT",
        body: JSON.stringify(categoryData),
      }
    );
  },

  // Delete a category
  delete: async (
    categoryId: number,
    userId?: number
  ): Promise<BaseResponse> => {
    const queryString = userId ? `?user_id=${userId}` : "";
    return apiRequest<BaseResponse>(
      `${API_ENDPOINTS.CATEGORY.DETAILS(categoryId)}${queryString}`,
      {
        method: "DELETE",
      }
    );
  },
};

// Location API service
export const LocationAPI = {
  // Get all locations
  getAll: async (): Promise<LocationBase[]> => {
    return apiRequest<LocationBase[]>(API_ENDPOINTS.LOCATION.ALL);
  },

  // Create a new location
  create: async (
    locationData: LocationCreate,
    userId?: number
  ): Promise<LocationResponse> => {
    const queryString = userId ? `?user_id=${userId}` : "";
    return apiRequest<LocationResponse>(
      `${API_ENDPOINTS.LOCATION.CREATE}${queryString}`,
      {
        method: "POST",
        body: JSON.stringify(locationData),
      }
    );
  },

  // Get location by ID
  getDetails: async (locationId: number): Promise<LocationBase> => {
    return apiRequest<LocationBase>(API_ENDPOINTS.LOCATION.DETAILS(locationId));
  },

  // Update location
  update: async (
    locationId: number,
    locationData: Partial<LocationCreate>,
    userId?: number
  ): Promise<BaseResponse> => {
    const queryString = userId ? `?user_id=${userId}` : "";
    return apiRequest<BaseResponse>(
      `${API_ENDPOINTS.LOCATION.UPDATE(locationId)}${queryString}`,
      {
        method: "PUT",
        body: JSON.stringify(locationData),
      }
    );
  },
};

// Image API service
export const ImageAPI = {
  // Upload an image for a report
  upload: async (
    reportId: number,
    imageFile: File,
    userId?: number
  ): Promise<ImageResponse> => {
    const queryString = userId ? `?user_id=${userId}` : "";
    const url = `${API_BASE_URL}${API_ENDPOINTS.IMAGE.UPLOAD(
      reportId
    )}${queryString}`;

    const formData = new FormData();
    formData.append("file", imageFile);

    const response = await fetch(url, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    await handleApiError(response);
    return await response.json();
  },

  // Upload an image from URL for a report
  uploadUrl: async (
    reportId: number,
    imageUrl: string,
    userId?: number
  ): Promise<ImageResponse> => {
    const queryString = userId ? `?user_id=${userId}` : "";
    return apiRequest<ImageResponse>(
      `${API_ENDPOINTS.IMAGE.UPLOAD_URL(reportId)}${queryString}`,
      {
        method: "POST",
        body: JSON.stringify({ image_url: imageUrl }),
      }
    );
  },

  // Delete an image
  delete: async (imageId: number, userId?: number): Promise<BaseResponse> => {
    const queryString = userId ? `?user_id=${userId}` : "";
    return apiRequest<BaseResponse>(
      `${API_ENDPOINTS.IMAGE.DELETE(imageId)}${queryString}`,
      {
        method: "DELETE",
      }
    );
  },
};

// Vote API service
export const VoteAPI = {
  // Get vote counts for a report
  getVoteCounts: async (
    reportId: number,
    userId?: number
  ): Promise<VoteCounts> => {
    const queryString = userId ? `?user_id=${userId}` : "";
    const endpoint = `${API_ENDPOINTS.VOTE.GET(reportId)}${queryString}`;
    console.log(
      `Getting votes for report ${reportId}, user ${userId}, endpoint: ${endpoint}`
    );

    const response = await apiRequest<VoteCounts>(endpoint);
    console.log(`Raw vote response for report ${reportId}:`, response);
    return response;
  },

  // Vote on a report
  vote: async (
    reportId: number,
    voteData: VoteCreate,
    userId?: number
  ): Promise<BaseResponse> => {
    const queryString = userId ? `?user_id=${userId}` : "";
    console.log(
      `Voting on report ${reportId}, type: ${voteData.voteType}, user: ${userId}`
    );

    return apiRequest<BaseResponse>(
      `${API_ENDPOINTS.VOTE.VOTE(reportId)}${queryString}`,
      {
        method: "POST",
        body: JSON.stringify(voteData),
      }
    );
  },

  // Remove a vote
  removeVote: async (
    reportId: number,
    userId?: number
  ): Promise<BaseResponse> => {
    const queryString = userId ? `?user_id=${userId}` : "";
    console.log(`Removing vote on report ${reportId}, user: ${userId}`);

    return apiRequest<BaseResponse>(
      `${API_ENDPOINTS.VOTE.DELETE(reportId)}${queryString}`,
      {
        method: "DELETE",
      }
    );
  },
};

// Analytics API service
export const AnalyticsAPI = {
  /**
   * Get report analytics data
   *
   * @param {string} period - Time aggregation period: 'daily', 'weekly', 'monthly', 'quarterly', or 'yearly'
   * @param {string} startDate - Optional start date for filtering (ISO string)
   * @param {string} endDate - Optional end date for filtering (ISO string)
   * @returns {Promise<any>} Report analytics data
   */
  getReportAnalytics: async (
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" = "daily",
    startDate?: string,
    endDate?: string
  ): Promise<any> => {
    const params = new URLSearchParams();
    params.append("period", period);

    if (startDate) {
      params.append("start_date", startDate);
    }

    if (endDate) {
      params.append("end_date", endDate);
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<any>(`${API_ENDPOINTS.ANALYTICS.REPORTS}${queryString}`);
  },

  /**
   * Get user analytics data
   *
   * @param {string} period - Time aggregation period: 'daily', 'weekly', 'monthly', 'quarterly', or 'yearly'
   * @param {string} startDate - Optional start date for filtering (ISO string)
   * @param {string} endDate - Optional end date for filtering (ISO string)
   * @returns {Promise<any>} User analytics data
   */
  getUserAnalytics: async (
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" = "daily",
    startDate?: string,
    endDate?: string
  ): Promise<any> => {
    const params = new URLSearchParams();
    params.append("period", period);

    if (startDate) {
      params.append("start_date", startDate);
    }

    if (endDate) {
      params.append("end_date", endDate);
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<any>(`${API_ENDPOINTS.ANALYTICS.USERS}${queryString}`);
  },

  /**
   * Get location-based insights
   *
   * @returns {Promise<any>} Location insights data
   */
  getLocationInsights: async (): Promise<any> => {
    return apiRequest<any>(API_ENDPOINTS.ANALYTICS.LOCATION_INSIGHTS);
  },

  /**
   * Get filtered heatmap data for location analytics
   *
   * @param {Object} filters - Optional filters
   * @param {string} filters.startDate - Start date for filtering (ISO string)
   * @param {string} filters.endDate - End date for filtering (ISO string)
   * @param {number} filters.categoryId - Category ID for filtering
   * @returns {Promise<any>} Filtered heatmap data
   */
  getFilteredHeatmapData: async (filters?: {
    startDate?: string;
    endDate?: string;
    categoryId?: number;
  }): Promise<any> => {
    const params = new URLSearchParams();

    if (filters?.startDate) {
      params.append("start_date", filters.startDate);
    }

    if (filters?.endDate) {
      params.append("end_date", filters.endDate);
    }

    if (filters?.categoryId) {
      params.append("category_id", filters.categoryId.toString());
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<any>(
      `${API_ENDPOINTS.ANALYTICS.FILTERED_HEATMAP}${queryString}`
    );
  },

  /**
   * Get location trends over time
   *
   * @param {string} period - Time aggregation period: 'daily', 'weekly', 'monthly', 'quarterly', or 'yearly'
   * @param {string} startDate - Optional start date for filtering (ISO string)
   * @param {string} endDate - Optional end date for filtering (ISO string)
   * @returns {Promise<any>} Location trend data
   */
  getLocationTrends: async (
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" = "monthly",
    startDate?: string,
    endDate?: string
  ): Promise<any> => {
    const params = new URLSearchParams();
    params.append("period", period);

    if (startDate) {
      params.append("start_date", startDate);
    }

    if (endDate) {
      params.append("end_date", endDate);
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<any>(
      `${API_ENDPOINTS.ANALYTICS.LOCATION_TRENDS}${queryString}`
    );
  },

  /**
   * Get category analysis data
   *
   * @param {string} period - Time aggregation period: 'daily', 'weekly', 'monthly', 'quarterly', or 'yearly'
   * @param {string} startDate - Optional start date for filtering (ISO string)
   * @param {string} endDate - Optional end date for filtering (ISO string)
   * @returns {Promise<any>} Category analysis data
   */
  getCategoryAnalysis: async (
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" = "monthly",
    startDate?: string,
    endDate?: string
  ): Promise<any> => {
    const params = new URLSearchParams();
    params.append("period", period);

    if (startDate) {
      params.append("start_date", startDate);
    }

    if (endDate) {
      params.append("end_date", endDate);
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<any>(
      `${API_ENDPOINTS.ANALYTICS.CATEGORY_ANALYSIS}${queryString}`
    );
  },

  /**
   * Get system performance metrics
   *
   * @param {string} period - Time aggregation period: 'daily', 'weekly', 'monthly', 'quarterly', or 'yearly'
   * @param {string} startDate - Optional start date for filtering (ISO string)
   * @param {string} endDate - Optional end date for filtering (ISO string)
   * @returns {Promise<any>} System performance data
   */
  getSystemPerformance: async (
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" = "monthly",
    startDate?: string,
    endDate?: string
  ): Promise<any> => {
    const params = new URLSearchParams();
    params.append("period", period);

    if (startDate) {
      params.append("start_date", startDate);
    }

    if (endDate) {
      params.append("end_date", endDate);
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<any>(
      `${API_ENDPOINTS.ANALYTICS.SYSTEM_PERFORMANCE}${queryString}`
    );
  },
};
