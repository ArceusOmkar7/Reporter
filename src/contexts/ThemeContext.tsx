/**
 * ThemeContext
 *
 * Context for managing light/dark theme preferences:
 * - Tracks user theme preference
 * - Provides functions to toggle between light and dark themes
 * - Persists theme preference in localStorage
 */
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// ThemeProvider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize theme state from localStorage or system preference
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check for saved theme preference in localStorage
    const savedTheme = localStorage.getItem("theme") as Theme | null;

    if (savedTheme) {
      return savedTheme;
    }

    // If no saved preference, check system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }

    // Default to dark theme
    return "dark";
  });

  // Update theme when it changes
  useEffect(() => {
    // Remove both classes first
    document.documentElement.classList.remove("light", "dark");
    // Add the current theme class
    document.documentElement.classList.add(theme);
    // Save theme preference to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Function to set theme
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
