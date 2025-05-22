/**
 * Layout Component
 *
 * This component provides the shared layout structure for all pages.
 * It includes:
 * - Header navigation
 * - Content container
 * - Footer with copyright
 *
 * Uses React Router's <Outlet> to render child routes' content.
 */
import React from "react";
import { Header } from "./Header";
import { Outlet } from "react-router-dom";

/**
 * Layout component that wraps all page content with common UI elements
 *
 * @returns {JSX.Element} Layout wrapper with header, main content area, and footer
 */
export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-950 bg-white dark:text-white text-gray-900">
      {/* Global navigation header */}
      <Header />

      {/* Main content area - renders child route components */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer with copyright */}
      <footer className="border-t dark:border-gray-800 border-gray-200 py-6 mt-12 dark:bg-gray-950 bg-white">
        <div className="container text-center text-sm dark:text-gray-500 text-gray-400">
          © {new Date().getFullYear()} Reportr. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
