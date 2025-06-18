"use client";

import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

const LoadingSpinner = ({ size = "md", text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} border-4 border-zinc-700 border-t-emerald-500 rounded-full animate-spin`}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`${
              size === "sm" ? "h-1 w-1" : size === "md" ? "h-2 w-2" : "h-3 w-3"
            } bg-transparent`}
          ></div>
        </div>
      </div>
      {text && <p className="text-zinc-400 text-sm">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
