import React from "react";
import clsx from "clsx";

type SkeletonProps = {
  className?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  children?: never;
};

const roundedClasses: Record<NonNullable<SkeletonProps["rounded"]>, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

const Skeleton: React.FC<SkeletonProps> = ({ className = "", rounded = "md" }) => {
  return (
    <div
      className={clsx(
        "bg-gray-200 animate-pulse",
        roundedClasses[rounded],
        className
      )}
      aria-hidden="true"
    />
  );
};

export default Skeleton;

