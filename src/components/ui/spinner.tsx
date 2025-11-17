import {clsx} from "clsx"
import type {SpinnerProps} from "@types"
import {Logo} from "@/components/ui/logo"

export function Spinner({size = "md", className}: SpinnerProps) {
  const sizeClasses: Record<NonNullable<SpinnerProps["size"]>, string> = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-16 w-16",
    full: "w-full h-full",
  }

  return (
    <div
      className={clsx(
        "inline-flex items-center justify-center",
        size !== "full" ? sizeClasses[size] : sizeClasses.full,
        className
      )}
      role="status"
      aria-label="Loading">
      <Logo size="full" className="w-full h-full text-black dark:text-white" animated />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
