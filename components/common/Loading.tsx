import React from "react";
import clsx from "clsx";

type LoadingProps = {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots";
  className?: string;
  label?: string;
  color?: string;
};

const sizeMap = {
  sm: "h-3 w-3 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-10 w-10 border-4"
};

const Loading: React.FC<LoadingProps> = ({
  size = "md",
  variant = "spinner",
  className,
  label = "Đang tải...",
  color
}) => {
  if (variant === "dots") {
    return (
      <div
        className={clsx("flex items-center gap-1", className)}
        aria-label={label}
      >
        <span className="sr-only">{label}</span>
        <span className="dot" style={{ animationDelay: "0s" }} />
        <span className="dot" style={{ animationDelay: "0.2s" }} />
        <span className="dot" style={{ animationDelay: "0.4s" }} />
        <style jsx>{`
          .dot {
            width: 0.5rem;
            height: 0.5rem;
            border-radius: 9999px;
            background-color: ${color ?? 'white'}; /* rgb(99 102 241); indigo-500 */
            display: inline-block;
            animation: dotPulse 0.9s ease-in-out infinite;
          }

          @keyframes dotPulse {
            0%, 80%, 100% {
              transform: scale(0.4);
              opacity: 0.4;
            }
            40% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  // spinner
  return (
    <div
      role="status"
      aria-label={label}
      className={clsx(
        "inline-block animate-spin rounded-full border-indigo-500/30 border-t-indigo-500",
        sizeMap[size],
        className
      )}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default Loading;
