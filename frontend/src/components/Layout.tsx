import React from "react";
import { Header } from "./Header";
import { Outlet } from "react-router-dom";

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-gray-800 py-6 mt-12">
        <div className="container text-center text-sm text-gray-500">
          © {new Date().getFullYear()} PetitionHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
