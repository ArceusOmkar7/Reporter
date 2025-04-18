// API Types

// Authentication Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: UserInfo;
}

export interface RegisterRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  middleName?: string;
}

export interface RegisterResponse {
  message: string;
  id: number;
}

export interface UserInfo {
  id: number;
  username: string;
  role: string;
}

export interface UserProfileResponse {
  userID: number;
  username: string;
  role: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  contactNumber: string;
}

// Report Types
export interface ReportListItem {
  reportID: number;
  title: string;
  description: string;
  categoryName?: string;
  street?: string;
  city?: string;
  state?: string;
  username?: string;
  imageCount?: number;
  upvotes?: number;
  downvotes?: number;
  createdAt: string;
}

export interface ReportDetail {
  reportID: number;
  title: string;
  description: string;
  categoryID: number;
  locationID: number;
  userID: number;
  createdAt: string;
  updatedAt?: string;
  status?: string;
  categoryName?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  username?: string;
  upvotes?: number;
  downvotes?: number;
  images?: ImageModel[];
}

export interface ReportCreate {
  title: string;
  description: string;
  categoryID: number;
  locationID: number;
}

export interface ReportResponse {
  message: string;
  id: number;
}

// Location Types
export interface LocationCreate {
  latitude: number;
  longitude: number;
  street: string;
  district: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  landmark?: string;
}

export interface LocationResponse {
  message: string;
  id: number;
}

export interface LocationBase {
  locationID: number;
  latitude: number;
  longitude: number;
  street: string;
  district: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  landmark?: string;
}

// Category Types
export interface CategoryBase {
  categoryID: number;
  categoryName: string;
  categoryDescription: string;
}

// Image Types
export interface ImageModel {
  imageID: number;
  imageURL: string;
  reportID: number;
  uploadedAt?: string;
}

export interface ImageResponse {
  message: string;
  id: number;
}

// Vote Types
export interface VoteCounts {
  upvotes: number;
  downvotes: number;
}

export interface VoteCreate {
  voteType: "upvote" | "downvote";
}

// Common Types
export interface BaseResponse {
  message: string;
}
