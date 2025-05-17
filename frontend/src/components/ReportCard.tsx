import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import { useState } from "react";

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
}: ReportCardProps) => {
  const [imageError, setImageError] = useState(false);

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

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/30 rounded-lg overflow-hidden hover:bg-gray-900/40">
      <div className="overflow-hidden mb-4 h-48">
        {image && !imageError ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="image-placeholder h-full w-full bg-gray-800/50 flex items-center justify-center">
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
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span className="capitalize">{category}</span>
          <span>{date}</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-2 line-clamp-2">{description}</p>
        <p className="text-xs text-gray-500 mb-4">Location: {location}</p>
        <div className="mt-auto flex items-center justify-around">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="sm"
                className={`p-2 h-auto hover:bg-gray-800/50 rounded-full ${
                  normalizedVote === "upvote"
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
                onClick={(e) => handleVote(e, "upvote")}
              >
                <ThumbsUp
                  size={20}
                  className={
                    normalizedVote === "upvote" ? "fill-green-500" : ""
                  }
                />
              </Button>
              <div className="text-center mt-1">
                <span className="text-sm font-semibold text-green-400">
                  {upvotes}
                </span>
                <span className="block text-xs text-gray-500">Upvotes</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="sm"
                className={`p-2 h-auto hover:bg-gray-800/50 rounded-full ${
                  normalizedVote === "downvote"
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
                onClick={(e) => handleVote(e, "downvote")}
              >
                <ThumbsDown
                  size={20}
                  className={
                    normalizedVote === "downvote" ? "fill-red-500" : ""
                  }
                />
              </Button>
              <div className="text-center mt-1">
                <span className="text-sm font-semibold text-red-400">
                  {downvotes}
                </span>
                <span className="block text-xs text-gray-500">Downvotes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
