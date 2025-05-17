/**
 * Main entry point for the Reporter application
 * This file initializes React and renders the main App component
 * into the root DOM element.
 */
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Create and render the React application in the root element
createRoot(document.getElementById("root")!).render(<App />);
