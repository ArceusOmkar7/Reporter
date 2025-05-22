import React from "react";

interface UserAvatarProps {
  firstName: string;
  lastName: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function UserAvatar({
  firstName,
  lastName,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const getInitials = () => {
    const firstInitial = firstName.charAt(0);
    const lastInitial = lastName.charAt(0);
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-xl",
    xl: "w-32 h-32 text-4xl",
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold dark:bg-gray-700 bg-gray-300 dark:text-white text-gray-800 border-2 dark:border-primary border-primary-light ${sizeClasses[size]} ${className}`}
    >
      {getInitials()}
    </div>
  );
}
