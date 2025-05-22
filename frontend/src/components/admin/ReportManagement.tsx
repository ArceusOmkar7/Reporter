/**
 * ReportManagement Component
 *
 * Admin component for managing system reports:
 * - View all reports
 * - Manage reports
 */
import { useState, useEffect } from "react";
import { ReportAPI } from "@/lib/api-service";
import { ReportListItem } from "@/lib/api-types";
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
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const allReports = await ReportAPI.search();
        setReports(allReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast.error("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleDeleteReport = async (reportId: number) => {
    try {
      // Call the API to delete the report
      await ReportAPI.delete(reportId, user?.id);

      // Update local state
      setReports(reports.filter((report) => report.reportID !== reportId));
      toast.success("Report deleted successfully");
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    }
  };

  // Calculate pagination
  const pageCount = Math.ceil(reports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = reports.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
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
        <h2 className="text-xl font-bold">Reports ({reports.length})</h2>
        <div className="flex items-center gap-2">
          <select 
            className="bg-background border border-input text-sm rounded-md px-3 py-2"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing items per page
            }}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

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
            {currentReports.map((report) => (
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

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {/* First page */}
              {currentPage > 2 && (
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(1)}>
                    1
                  </PaginationLink>
                </PaginationItem>
              )}
              
              {/* Ellipsis if needed */}
              {currentPage > 3 && (
                <PaginationItem>
                  <PaginationLink className="pointer-events-none">
                    ...
                  </PaginationLink>
                </PaginationItem>
              )}
              
              {/* Previous page if not first */}
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(currentPage - 1)}>
                    {currentPage - 1}
                  </PaginationLink>
                </PaginationItem>
              )}
              
              {/* Current page */}
              <PaginationItem>
                <PaginationLink isActive onClick={() => handlePageChange(currentPage)}>
                  {currentPage}
                </PaginationLink>
              </PaginationItem>
              
              {/* Next page if not last */}
              {currentPage < pageCount && (
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(currentPage + 1)}>
                    {currentPage + 1}
                  </PaginationLink>
                </PaginationItem>
              )}
              
              {/* Ellipsis if needed */}
              {currentPage < pageCount - 2 && (
                <PaginationItem>
                  <PaginationLink className="pointer-events-none">
                    ...
                  </PaginationLink>
                </PaginationItem>
              )}
              
              {/* Last page */}
              {currentPage < pageCount - 1 && (
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(pageCount)}>
                    {pageCount}
                  </PaginationLink>
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(Math.min(pageCount, currentPage + 1))}
                  className={currentPage === pageCount ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      
      {reports.length > 0 && (
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Showing {startIndex + 1}-{Math.min(endIndex, reports.length)} of {reports.length} reports
        </p>
      )}
    </div>
  );
}
