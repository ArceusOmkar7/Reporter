import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, ThumbsUp } from "lucide-react";
import { useState } from "react";

export interface ReportCardProps {
  id: number;
  title: string;
  description: string;
  location: string;
  category: string;
  date: string;
  votes: number;
  showDetailsButton?: boolean;
  showOnlyButton?: boolean;
  onVote?: (id: number) => void;
  onShowOnly?: (category: string) => void;
}

export const ReportCard = ({
  id,
  title,
  description,
  location,
  category,
  date,
  votes,
  showDetailsButton = true,
  showOnlyButton = true,
  onVote,
  onShowOnly,
}: ReportCardProps) => {
  const handleVote = () => {
    if (onVote) {
      onVote(id);
    }
  };

  const handleShowOnly = () => {
    if (onShowOnly) {
      onShowOnly(category);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="rounded-md overflow-hidden mb-4">
        <div className="image-placeholder h-48 w-full bg-gray-800/50 flex items-center justify-center">
          <svg
            className="h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span className="capitalize">{category}</span>
        <span>{date}</span>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-2 line-clamp-2">{description}</p>
      <p className="text-xs text-gray-500 mb-4">Location: {location}</p>
      <div className="mt-auto flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:bg-transparent"
            onClick={handleVote}
          >
            <ThumbsUp
              size={15}
              className="text-gray-400 hover:text-white transition-colors"
            />
          </Button>
          <span className="text-sm">{votes} votes</span>
        </div>
        <div className="flex gap-2">
          {showOnlyButton && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 bg-transparent border-gray-700 hover:bg-gray-800"
              onClick={handleShowOnly}
            >
              Show Only
            </Button>
          )}
          {showDetailsButton && (
            <Link to={`/reports/${id}`}>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 bg-transparent border-gray-700 hover:bg-gray-800"
              >
                View Details
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
