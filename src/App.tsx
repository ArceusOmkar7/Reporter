/**
 * Main App Component
 *
 * This component serves as the application root and sets up:
 * 1. React Query for data fetching
 * 2. UI providers (tooltip, toast notifications)
 * 3. Authentication context provider
 * 4. Theme context provider
 * 5. Routing configuration with React Router
 */
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import BrowseReports from "./pages/BrowseReports";
import ReportDetails from "./pages/ReportDetails";
import CreateReport from "./pages/CreateReport";
import EditReport from "./pages/EditReport";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/ReportCard";
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/admin/Dashboard";

// Initialize React Query client for data fetching
const queryClient = new QueryClient();

/**
 * App Component
 *
 * Configures the application with necessary providers and routing setup.
 * The component tree is structured as follows:
 * - QueryClientProvider: Manages API data fetching and caching
 * - TooltipProvider: Provides tooltip functionality
 * - AuthProvider: Manages user authentication state
 * - ThemeProvider: Manages theme preferences (light/dark)
 * - Notification systems (Toaster, Sonner)
 * - Routing configuration
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ThemeProvider>
          {/* Toast notification systems */}
          <Toaster />
          <Sonner position="top-center" />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/browse" element={<BrowseReports />} />
              <Route path="/reports/:id" element={<ReportDetails />} />

              {/* Report creation/editing routes */}
              <Route path="/new" element={<CreateReport />} />
              <Route path="/edit/:id" element={<EditReport />} />

              {/* Authentication routes */}
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />

              {/* Profile route */}
              <Route path="/profile/:userId" element={<UserProfile />} />

              {/* Admin routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

              {/* Fallback for unmatched routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
