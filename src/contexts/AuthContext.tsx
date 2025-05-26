/**
 * Authentication Context
 *
 * This module provides authentication functionality for the application
 * through a React Context. It handles user login, registration, and logout
 * operations, as well as persistent authentication via local storage.
 */
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthAPI } from "@/lib/api-service";
import { UserInfo, LoginRequest, RegisterRequest } from "@/lib/api-types";

/**
 * Authentication Context Type Definition
 *
 * Defines the shape of the authentication context including:
 * - Current user data
 * - Authentication state
 * - Loading state
 * - Authentication operations (login, register, logout)
 */
interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<UserInfo>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 *
 * Manages authentication state and provides authentication operations
 * to child components through the AuthContext.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that will have access to auth context
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for saved user data in local storage on component mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Log in a user with credentials
   *
   * @param {LoginRequest} credentials - User login credentials (username & password)
   * @returns {Promise<UserInfo>} The logged in user data
   */
  const login = async (credentials: LoginRequest): Promise<UserInfo> => {
    setIsLoading(true);
    try {
      const response = await AuthAPI.login(credentials);
      setUser(response.user);
      // Store user data in local storage for persistence
      localStorage.setItem("user", JSON.stringify(response.user));
      return response.user; // Return the user data for immediate use
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register a new user and automatically log them in
   *
   * @param {RegisterRequest} userData - New user registration data
   */
  const register = async (userData: RegisterRequest) => {
    setIsLoading(true);
    try {
      await AuthAPI.register(userData);
      // After registration, log in the user automatically
      await login({ username: userData.username, password: userData.password });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Log out the current user
   * Removes user data from state and local storage
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Create the context value object with all authentication state and operations
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook for accessing the authentication context
 *
 * @returns {AuthContextType} The authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
