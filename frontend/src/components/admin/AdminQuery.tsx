import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth

const AdminQueryPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const [query, setQuery] = useState<string>("");
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState<string>(""); // New state for NL query
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiSqlError, setAiSqlError] = useState<string | null>(null); // New state for AI specific errors
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingSql, setIsGeneratingSql] = useState<boolean>(false); // New state for AI loading

  const handleGenerateSql = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsGeneratingSql(true);
    setAiSqlError(null);
    setError(null); // Clear general errors as well
    setMessage(null); // Clear messages

    if (authIsLoading) {
      setAiSqlError("Authenticating user...");
      setIsGeneratingSql(false);
      return;
    }

    if (!isAuthenticated) {
      setAiSqlError("User not authenticated. Please log in.");
      setIsGeneratingSql(false);
      return;
    }

    if (user?.role !== "Administrator") {
      setAiSqlError("You are not authorized to perform this action.");
      setIsGeneratingSql(false);
      return;
    }

    const authToken = localStorage.getItem("authToken");
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const response = await fetch(
        "http://localhost:8000/api/admin/generate-sql-from-natural-language",
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            natural_language_query: naturalLanguageQuery,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success && data.suggested_sql) {
        setQuery(data.suggested_sql); // Populate the SQL query textarea
        setMessage(data.message || "SQL query generated successfully.");
      } else {
        setAiSqlError(data.error || data.message || "Failed to generate SQL.");
      }
    } catch (err) {
      setAiSqlError(
        err instanceof Error
          ? err.message
          : "Failed to generate SQL. Check network or server."
      );
    }
    setIsGeneratingSql(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults(null);
    setMessage(null);
    setAiSqlError(null); // Clear AI errors when executing manually

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

    if (user?.role !== "Administrator") {
      setError("You are not authorized to perform this action.");
      setIsLoading(false);
      return;
    }

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
        setResults(data.results || []);
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
      <h1 className="text-2xl font-bold mb-4 text-foreground">
        Admin SQL Query Executor
      </h1>

      {/* AI SQL Generation Form */}
      <form
        onSubmit={handleGenerateSql}
        className="mb-6 p-4 border border-primary/30 rounded-md bg-primary/10"
      >
        <h2 className="text-xl font-semibold mb-3 text-primary">
          Generate SQL with AI{" "}
          <span className="text-red-600 text-sm">(For testing purposes)</span>
        </h2>
        <div className="mb-4">
          <label
            htmlFor="naturalLanguageQuery"
            className="block text-sm font-medium text-muted-foreground mb-1"
          >
            Describe what you want to query:
          </label>
          <textarea
            id="naturalLanguageQuery"
            value={naturalLanguageQuery}
            onChange={(e) => setNaturalLanguageQuery(e.target.value)}
            rows={3}
            className="w-full p-2 border border-input rounded-md shadow-sm focus:ring-ring focus:border-ring bg-background text-foreground"
            placeholder="e.g., Show me all users who registered in the last month and live in 'Mumbai'"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isGeneratingSql || authIsLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
        >
          {authIsLoading
            ? "Authenticating..."
            : isGeneratingSql
            ? "Generating SQL..."
            : "Generate SQL with AI"}
        </button>
        {aiSqlError && (
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-md">
            AI Error: {aiSqlError}
          </div>
        )}
      </form>

      {/* Manual SQL Execution Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label
            htmlFor="sqlQuery"
            className="block text-sm font-medium text-muted-foreground mb-1"
          >
            SQL Query:
          </label>
          <textarea
            id="sqlQuery"
            value={query} // This will now be populated by AI or manual input
            onChange={(e) => setQuery(e.target.value)}
            rows={5}
            className="w-full p-2 border border-input rounded-md shadow-sm focus:ring-ring focus:border-ring bg-background text-foreground"
            placeholder="SELECT * FROM Users;"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || authIsLoading}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
        >
          {authIsLoading
            ? "Authenticating..."
            : isLoading
            ? "Executing..."
            : "Execute Query"}
        </button>
      </form>

      {message &&
        !aiSqlError && ( // Ensure AI error doesn't get overwritten by a success message from AI generation if SQL field is populated
          <div className="mb-4 p-3 bg-accent/20 border border-accent/40 text-accent-foreground rounded-md">
            {message}
          </div>
        )}

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-md">
          Execution Error: {error}
        </div>
      )}

      {results && (
        <div>
          <h2 className="text-xl font-semibold mb-2 text-foreground">
            Results:
          </h2>
          {results.length === 0 ? (
            <p className="text-muted-foreground">
              No results returned for this query.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border border border-border">
                <thead className="bg-muted/50">
                  <tr>
                    {Object.keys(results[0]).map((key) => (
                      <th
                        key={key}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {results.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-muted/30">
                      {Object.values(row).map((value, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-foreground"
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
