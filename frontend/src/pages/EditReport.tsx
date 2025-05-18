import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ReportAPI } from "@/lib/api-service";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { EditReportForm } from "@/components/report-edit/EditReportForm";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const EditReport = () => {
  const { id } = useParams<{ id: string }>();
  const reportId = parseInt(id || "0");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch report details
  const {
    data: report,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["report", reportId],
    queryFn: () => ReportAPI.getDetails(reportId),
    enabled: !!reportId,
  });

  // Display loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="container px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-1/2 mb-6 bg-gray-800" />
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <Skeleton className="h-8 w-1/3 bg-gray-800" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full bg-gray-800" />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Display error state
  if (error || !report) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <main className="flex-1 container px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle size={64} className="mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Report Not Found</h1>
            <p className="text-gray-400 mb-6">
              The report you're trying to edit doesn't exist or has been
              removed.
            </p>
            <Button
              onClick={() => navigate("/browse")}
              className="bg-white text-black hover:bg-gray-200"
            >
              Browse Reports
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Check if user is authorized to edit (is report owner)
  const isOwner = user?.id === report.userID;
  const isAdmin = user?.role === "Administrator";

  if (!isOwner && !isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <main className="flex-1 container px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle size={64} className="mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Not Authorized</h1>
            <p className="text-gray-400 mb-6">
              You don't have permission to edit this report.
            </p>
            <Button
              onClick={() => navigate(`/reports/${reportId}`)}
              className="bg-white text-black hover:bg-gray-200"
            >
              Back to Report
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="container px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Edit Report</h1>
          <EditReportForm report={report} reportId={reportId} />
        </div>
      </main>
    </div>
  );
};

export default EditReport;
