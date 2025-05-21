import { useState } from "react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  categoryName?: string;
  isHomePage?: boolean;
}

export const ImageWithFallback = ({
  src,
  alt,
  className,
  categoryName,
  isHomePage = false,
}: ImageWithFallbackProps) => {
  const [error, setError] = useState(false);

  // Function to try different URL formats if the original fails
  const handleError = () => {
    if (!error) {
      setError(true);
    }
  };

  // If we're on the home page and either there's an error loading the image or the image is the placeholder SVG,
  // and a category name is provided, use placehold.co
  if (
    (error || src === "/placeholder-report.svg") &&
    isHomePage &&
    categoryName
  ) {
    // Use placehold.co with the category name and a nice color scheme
    const encodedCategoryName = encodeURIComponent(categoryName);
    return (
      <img
        src={`https://placehold.co/600x400/1f2937/ffffff?text=${encodedCategoryName}`}
        alt={`${categoryName} category`}
        className={className || "w-full h-auto object-cover"}
      />
    );
  }

  // If the image src is just a filename or a relative path, try to construct a full URL
  let imageSrc = src;

  // If we already had an error with the original URL, try to fix it
  if (error) {
    // Check if it's a backend path without the full URL
    if (src.startsWith("/backend/uploads/")) {
      // Add the localhost URL
      imageSrc = `http://localhost:8000${src}`;
    } else if (src.startsWith("backend/uploads/")) {
      // Add the localhost URL with leading slash
      imageSrc = `http://localhost:8000/${src}`;
    } else {
      // Just try with the filename directly
      const filename = src.split("/").pop();
      if (filename) {
        imageSrc = `http://localhost:8000/backend/uploads/${filename}`;
      }
    }
  }

  return error ? (
    <div className="flex items-center justify-center w-full h-48 bg-gray-800 rounded-md">
      <div className="text-gray-500">
        <svg
          className="h-12 w-12 mx-auto"
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
        <p className="mt-2 text-sm">Image could not be loaded</p>
      </div>
    </div>
  ) : (
    <img
      src={imageSrc}
      alt={alt}
      className={className || "w-full h-auto object-cover"}
      onError={handleError}
    />
  );
};
