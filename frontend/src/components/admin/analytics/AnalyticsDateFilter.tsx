/**
 * Analytics Date Filter Component
 *
 * Provides common UI for filtering analytics by time period and date range
 */
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, RefreshCcw } from "lucide-react";

export type TimePeriod =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly";

interface AnalyticsDateFilterProps {
  period: TimePeriod;
  startDate: string;
  endDate: string;
  loading: boolean;
  onPeriodChange: (period: TimePeriod) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onApplyFilters: () => void;
  onReset: () => void;
}

export function AnalyticsDateFilter({
  period,
  startDate,
  endDate,
  loading,
  onPeriodChange,
  onStartDateChange,
  onEndDateChange,
  onApplyFilters,
  onReset,
}: AnalyticsDateFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end">
      <div className="grid gap-2">
        <Label htmlFor="period">Time Period</Label>
        <Select
          value={period}
          onValueChange={(value: TimePeriod) => onPeriodChange(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="start-date">Start Date</Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-[180px]"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="end-date">End Date</Label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-[180px]"
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onApplyFilters}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Calendar className="h-4 w-4 mr-1" />
          )}
          Apply Filters
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={loading || (!startDate && !endDate)}
        >
          <RefreshCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  );
}
