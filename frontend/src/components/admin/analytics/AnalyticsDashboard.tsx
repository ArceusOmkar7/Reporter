/**
 * Analytics Dashboard
 *
 * Main component that combines all analytics sections:
 * - Report statistics
 * - User analytics
 * - Location-based insights
 * - Category analysis
 * - System performance
 */
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportStatistics } from "./ReportStatistics";
import { UserAnalytics } from "./UserAnalytics";
import { LocationInsights } from "./LocationInsights";
import { CategoryAnalysis } from "./CategoryAnalysis";
import { SystemPerformance } from "./SystemPerformance";

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<string>("reports");

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      <Tabs
        defaultValue="reports"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-6">
          <ReportStatistics />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserAnalytics />
        </TabsContent>

        <TabsContent value="locations" className="mt-6">
          <LocationInsights />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoryAnalysis />
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <SystemPerformance />
        </TabsContent>
      </Tabs>
    </div>
  );
}
