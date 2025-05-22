import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth

const AdminQueryPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth(); // Use AuthContext
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // This is for the fetch operation

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true); // For the fetch operation
    setError(null);
    setResults(null);
    setMessage(null);

    if (authIsLoading) {
      setError("Authenticating user...");
      setIsLoading(false);
      return;
    }

    if (!isAuthenticated) {
      setError("User not authenticated. Please log in.");
      setIsLoading(false);
      return;
    }

    // Ensure 'Administrator' matches the role string in your UserInfo type
    if (user?.role !== "Administrator") {
      setError("You are not authorized to perform this action.");
      setIsLoading(false);
      return;
    }

    // This authToken is likely null if AuthContext doesn't set it.
    // The Authorization header will be added conditionally.
    const authToken = localStorage.getItem("authToken");

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const response = await fetch(
        "http://localhost:8000/api/admin/execute-query",
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ query }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setResults(data.results || []); // Ensure results is an array
        setMessage(data.message);
      } else {
        setError(data.error || data.message || "An unknown error occurred.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to execute query. Check network or server."
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin SQL Query Executor</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label
            htmlFor="sqlQuery"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            SQL Query:
          </label>
          <textarea
            id="sqlQuery"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={5}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="SELECT * FROM Users;"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? "Executing..." : "Execute Query"}
        </button>
      </form>

      {message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          Error: {error}
        </div>
      )}

      {results && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Results:</h2>
          {results.length === 0 ? (
            <p>No results returned for this query.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(results[0]).map((key) => (
                      <th
                        key={key}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                        >
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminQueryPage;
