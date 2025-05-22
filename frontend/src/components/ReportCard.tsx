import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "@/components/ImageWithFallback";

export interface ReportCardProps {
  id: number;
  title: string;
  description: string;
  location: string;
  category: string;
  date: string;
  votes?: number;
  upvotes: number;
  downvotes: number;
  image?: string;
  showDetailsButton?: boolean;
  showOnlyButton?: boolean;
  onVote?: (id: number, type: "upvote" | "downvote") => void;
  onShowOnly?: (category: string) => void;
  userVote?: "upvote" | "downvote" | null;
  isHomePage?: boolean;
}

export const ReportCard = ({
  id,
  title,
  description,
  location,
  category,
  date,
  votes,
  upvotes = 0,
  downvotes = 0,
  image,
  showDetailsButton = false,
  showOnlyButton = false,
  onVote,
  onShowOnly,
  userVote,
  isHomePage = false,
}: ReportCardProps) => {
  const normalizedVote = userVote
    ? (userVote.toLowerCase() as "upvote" | "downvote")
    : null;

  const handleVote = (e: React.MouseEvent, type: "upvote" | "downvote") => {
    e.stopPropagation();
    e.preventDefault();
    if (onVote) {
      onVote(id, type);
    }
  };

  const handleShowOnly = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onShowOnly) {
      onShowOnly(category);
    }
  };

  return (
    <div className="flex flex-col h-full dark:bg-gray-900/30 bg-gray-100/80 rounded-lg overflow-hidden hover:dark:bg-gray-900/40 hover:bg-gray-200/70 border dark:border-gray-700/60 border-gray-200">
      <div className="overflow-hidden mb-4 h-48">
        {image ? (
          <ImageWithFallback
            src={image}
            alt={title}
            className="h-full w-full object-cover"
            categoryName={category}
            isHomePage={isHomePage}
          />
        ) : (
          <div className="image-placeholder h-full w-full dark:bg-gray-800/50 bg-gray-300/50 flex items-center justify-center">
            <svg
              className="h-12 w-12 dark:text-gray-400 text-gray-500"
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
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between text-xs dark:text-gray-500 text-gray-400 mb-1">
          <span className="capitalize">{category}</span>
          <span>{date}</span>
        </div>
        <h3 className="text-lg font-semibold mb-2 dark:text-gray-100 text-gray-900">
          {title}
        </h3>
        <p className="text-sm dark:text-gray-400 text-gray-600 mb-2 line-clamp-2">
          {description}
        </p>
        <p className="text-xs dark:text-gray-500 text-gray-400 mb-4">
          Location: {location}
        </p>

        {/* Votes and Details Button */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onVote && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleVote(e, "upvote")}
                  className={`p-1 h-auto dark:text-gray-400 text-gray-600 hover:dark:text-green-400 hover:text-green-500 ${
                    normalizedVote === "upvote"
                      ? "dark:text-green-400 text-green-500"
                      : ""
                  }`}
                >
                  <ThumbsUp size={16} />
                  <span className="ml-1 text-xs">{upvotes}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleVote(e, "downvote")}
                  className={`p-1 h-auto dark:text-gray-400 text-gray-600 hover:dark:text-red-400 hover:text-red-500 ${
                    normalizedVote === "downvote"
                      ? "dark:text-red-400 text-red-500"
                      : ""
                  }`}
                >
                  <ThumbsDown size={16} />
                  <span className="ml-1 text-xs">{downvotes}</span>
                </Button>
              </>
            )}
            {votes !== undefined && !onVote && (
              <span className="text-xs dark:text-gray-400 text-gray-600">
                {votes} Votes
              </span>
            )}
          </div>

          {showDetailsButton && (
            <Link to={`/reports/${id}`}>
              <Button
                variant="outline"
                size="sm"
                className="dark:border-gray-700 border-gray-300 dark:text-gray-300 text-gray-700 dark:hover:bg-gray-700 hover:bg-gray-200"
              >
                <Eye size={14} className="mr-1" />
                Details
              </Button>
            </Link>
          )}
          {showOnlyButton && onShowOnly && (
            <Button
              variant="link"
              size="sm"
              onClick={handleShowOnly}
              className="text-xs dark:text-blue-400 text-blue-600 hover:dark:text-blue-300 hover:text-blue-700 p-0 h-auto"
            >
              Show only {category}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
