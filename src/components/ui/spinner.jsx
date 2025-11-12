// @ts-check

import {clsx} from "clsx";

/**
 * @param {{size?: "sm"|"md"|"lg", className?: string}} props
 */
export function Spinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  return (
    <div
      className={clsx(
        "animate-spin rounded-full border-solid border-primary border-t-transparent",
        sizeClasses[size] ?? sizeClasses.md,
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
