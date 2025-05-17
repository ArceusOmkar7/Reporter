import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { ReportListItem } from "../../lib/api-types";
import { CalendarIcon, Clock, MapPin, Plus } from "lucide-react";
import { Badge } from "../ui/badge";

// Interface for component props
interface UserReportsProps {
  reports: ReportListItem[];
  isCurrentUser: boolean;
}

export default function UserReports({
  reports,
  isCurrentUser,
}: UserReportsProps) {
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popularity">(
    "newest"
  );

  // Sort reports based on the selected criteria
  const sortedReports = [...reports].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === "popularity") {
      const aPopularity = (a.upvotes || 0) - (a.downvotes || 0);
      const bPopularity = (b.upvotes || 0) - (b.downvotes || 0);
      return bPopularity - aPopularity;
    }
    return 0;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>
              {isCurrentUser ? "Your Reports" : "User Reports"}
            </CardTitle>
            <CardDescription>
              {reports.length} report{reports.length !== 1 ? "s" : ""} submitted
            </CardDescription>
          </div>

          <div className="flex items-center space-x-2">
            {isCurrentUser && (
              <Button asChild>
                <Link to="/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Report
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center">
          <span className="text-sm mr-2">Sort by:</span>
          <div className="flex gap-2">
            <Button
              variant={sortBy === "newest" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSortBy("newest")}
            >
              Newest
            </Button>
            <Button
              variant={sortBy === "oldest" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSortBy("oldest")}
            >
              Oldest
            </Button>
            <Button
              variant={sortBy === "popularity" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSortBy("popularity")}
            >
              Most Popular
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">No reports found</p>
            {isCurrentUser && (
              <Button asChild>
                <Link to="/create-report">Create your first report</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedReports.map((report) => (
              <Card
                key={report.reportID}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <Link to={`/reports/${report.reportID}`} className="block">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold line-clamp-2">
                        {report.title}
                      </h3>
                      {report.categoryName && (
                        <Badge variant="outline" className="ml-2">
                          {report.categoryName}
                        </Badge>
                      )}
                    </div>
                    <p className="line-clamp-2 text-muted-foreground mb-3">
                      {report.description}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <CalendarIcon className="mr-1 h-4 w-4" />
                        <span>{formatDate(report.createdAt)}</span>
                      </div>

                      {report.city && report.state && (
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4" />
                          <span>
                            {report.city}, {report.state}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center ml-auto">
                        <span className="text-green-600 mr-2">
                          ↑ {report.upvotes || 0}
                        </span>
                        <span className="text-red-600">
                          ↓ {report.downvotes || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
