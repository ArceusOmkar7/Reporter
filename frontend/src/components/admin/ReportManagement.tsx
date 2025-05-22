/**
 * ReportManagement Component
 *
 * Admin component for managing system reports:
 * - View all reports
 * - Manage reports
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query"; // Corrected import
import { ReportAPI, CategoryAPI } from "@/lib/api-service";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Loader2, MoreHorizontal, FileText, Trash2, Edit } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function ReportManagement() {
  const { user } = useAuth();

  // State for search, filter, sort, and pagination parameters
  const [searchParams, setSearchParams] = useState({
    query: "",
    category: "",
    location: "",
    sortBy: "createdAt_desc",
    page: 1,
    limit: 10, // Default items per page
  });

  // Fetch reports using react-query for better state management
  const {
    data: reportsData,
    isLoading: isLoadingReports,
    error: reportsError,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ["adminReports", searchParams],
    queryFn: () =>
      ReportAPI.search({
        query: searchParams.query,
        category: searchParams.category,
        location: searchParams.location,
        sortBy: searchParams.sortBy,
        page: searchParams.page,
        limit: searchParams.limit,
      }),
  });

  const reports = reportsData?.reports || [];
  const totalPages = reportsData?.totalPages || 1;
  const currentPage = reportsData?.currentPage || 1;
  const totalReports = reportsData?.totalReports || 0; // Correctly access totalReports

  // Fetch categories for filter dropdown
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: CategoryAPI.getAll,
  });

  // Handle changes in search and filter inputs
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev) => ({ ...prev, query: e.target.value, page: 1 }));
  };

  const handleCategoryChange = (value: string) => {
    setSearchParams((prev) => ({ ...prev, category: value, page: 1 }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev) => ({ ...prev, location: e.target.value, page: 1 }));
  };

  const handleSortChange = (value: string) => {
    setSearchParams((prev) => ({ ...prev, sortBy: value, page: 1 }));
  };

  const handleItemsPerPageChange = (value: string) => {
    setSearchParams((prev) => ({
      ...prev,
      limit: parseInt(value, 10),
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams((prev) => ({ ...prev, page: newPage }));
    }
  };

  const clearFilters = () => {
    setSearchParams({
      query: "",
      category: "",
      location: "",
      sortBy: "createdAt_desc",
      page: 1,
      limit: searchParams.limit,
    });
  };

  const handleDeleteReport = async (reportId: number) => {
    try {
      await ReportAPI.delete(reportId, user?.id);
      toast.success("Report deleted successfully");
      refetchReports();
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    }
  };

  if (isLoadingReports) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading reports...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Reports ({totalReports})</h2>
        <div className="flex items-center gap-2">
          <Select
            value={String(searchParams.limit)}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger className="w-[120px] bg-background border border-input text-sm rounded-md px-3 py-2">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 border rounded-md">
        <div>
          <label
            htmlFor="adminReportSearch"
            className="text-sm font-medium mb-1 block"
          >
            Search
          </label>
          <Input
            id="adminReportSearch"
            placeholder="Search by title, description..."
            value={searchParams.query}
            onChange={handleQueryChange}
            className="dark:bg-gray-800 bg-gray-100 dark:border-gray-700 border-gray-300"
          />
        </div>
        <div>
          <label
            htmlFor="adminReportCategory"
            className="text-sm font-medium mb-1 block"
          >
            Category
          </label>
          <Select
            value={searchParams.category === "" ? "all" : searchParams.category}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger
              id="adminReportCategory"
              className="dark:bg-gray-800 bg-gray-100 dark:border-gray-700 border-gray-300"
            >
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 bg-white dark:border-gray-700 border-gray-300">
              <SelectItem value="all">All Categories</SelectItem>
              {isLoadingCategories ? (
                <SelectItem value="loadingCat" disabled>
                  Loading...
                </SelectItem>
              ) : (
                categories?.map((category: any) => (
                  <SelectItem
                    key={category.categoryID}
                    value={category.categoryName}
                  >
                    {category.categoryName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label
            htmlFor="adminReportLocation"
            className="text-sm font-medium mb-1 block"
          >
            Location
          </label>
          <Input
            id="adminReportLocation"
            placeholder="Filter by city or state"
            value={searchParams.location}
            onChange={handleLocationChange}
            className="dark:bg-gray-800 bg-gray-100 dark:border-gray-700 border-gray-300"
          />
        </div>
        <div>
          <label
            htmlFor="adminReportSortBy"
            className="text-sm font-medium mb-1 block"
          >
            Sort By
          </label>
          <Select value={searchParams.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger
              id="adminReportSortBy"
              className="dark:bg-gray-800 bg-gray-100 dark:border-gray-700 border-gray-300"
            >
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 bg-white dark:border-gray-700 border-gray-300">
              <SelectItem value="createdAt_desc">Newest First</SelectItem>
              <SelectItem value="createdAt_asc">Oldest First</SelectItem>
              <SelectItem value="upvotes_desc">Most Popular</SelectItem>
              <SelectItem value="upvotes_asc">Least Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">&nbsp;</label>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full dark:bg-transparent bg-white dark:border-gray-700 border-gray-300 dark:hover:bg-gray-800 hover:bg-gray-100"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {reportsError && (
        <div className="text-center py-12 text-red-500">
          <p>Error loading reports. Please try again later.</p>
        </div>
      )}

      {!isLoadingReports && !reportsError && reports.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No reports found matching your criteria.</p>
        </div>
      )}

      {!isLoadingReports && !reportsError && reports.length > 0 && (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.reportID}>
                  <TableCell>{report.reportID}</TableCell>
                  <TableCell>{report.title}</TableCell>
                  <TableCell>{report.categoryName || "N/A"}</TableCell>
                  <TableCell>
                    {report.city && report.state
                      ? `${report.city}, ${report.state}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>{report.username || "Unknown"}</TableCell>
                  <TableCell>
                    {new Date(report.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <Link to={`/reports/${report.reportID}`}>
                          <DropdownMenuItem className="cursor-pointer">
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        </Link>
                        <Link to={`/edit/${report.reportID}`}>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Report
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                          className="cursor-pointer text-red-600"
                          onClick={() => handleDeleteReport(report.reportID)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    handlePageChange(Math.max(1, searchParams.page - 1))
                  }
                  className={
                    searchParams.page === 1
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>

              {searchParams.page > 2 && (
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(1)}>
                    1
                  </PaginationLink>
                </PaginationItem>
              )}

              {searchParams.page > 3 && (
                <PaginationItem>
                  <PaginationLink className="pointer-events-none">
                    ...
                  </PaginationLink>
                </PaginationItem>
              )}

              {searchParams.page > 1 && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageChange(searchParams.page - 1)}
                  >
                    {searchParams.page - 1}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationLink
                  isActive
                  onClick={() => handlePageChange(searchParams.page)}
                >
                  {searchParams.page}
                </PaginationLink>
              </PaginationItem>

              {searchParams.page < totalPages && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageChange(searchParams.page + 1)}
                  >
                    {searchParams.page + 1}
                  </PaginationLink>
                </PaginationItem>
              )}

              {searchParams.page < totalPages - 2 && (
                <PaginationItem>
                  <PaginationLink className="pointer-events-none">
                    ...
                  </PaginationLink>
                </PaginationItem>
              )}

              {searchParams.page < totalPages - 1 && (
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(totalPages)}>
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handlePageChange(
                      Math.min(totalPages, searchParams.page + 1)
                    )
                  }
                  className={
                    searchParams.page === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {reports.length > 0 && (
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Showing {(searchParams.page - 1) * searchParams.limit + 1}-
          {Math.min(searchParams.page * searchParams.limit, totalReports)} of{" "}
          {totalReports} reports
        </p>
      )}
    </div>
  );
}
