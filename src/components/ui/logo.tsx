import {cn} from "@/lib/utils"
import type {LogoProps, LogoSize} from "@types"

const sizeClasses: Record<LogoSize, string> = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
  xl: "h-20 w-20",
  full: "h-full w-full",
}

export function Logo({size = "full", className, animated = false}: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "text-[var(--primary-color)]",
        sizeClasses[size],
        animated && "melodot-logo-animated",
        className
      )}>
      <circle
        cx="24"
        cy="24"
        r="22"
        stroke="currentColor"
        strokeWidth="2"
        className={animated ? "melodot-circle" : ""}/>

      {animated ? (
        <>
          <line x1="12" y1="28" x2="16" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="melodot-line melodot-line-1" />
          <line x1="16" y1="20" x2="20" y2="26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="melodot-line melodot-line-2" />
          <line x1="20" y1="26" x2="24" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="melodot-line melodot-line-3" />
          <line x1="24" y1="18" x2="28" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="melodot-line melodot-line-4" />
          <line x1="28" y1="24" x2="32" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="melodot-line melodot-line-5" />
          <line x1="32" y1="16" x2="36" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="melodot-line melodot-line-6" />
        </>
      ) : (
        <path
          d="M 12 28 L 16 20 L 20 26 L 24 18 L 28 24 L 32 16 L 36 28"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"/>
      )}

      <circle
        cx="12"
        cy="28"
        r="2.5"
        fill="currentColor"
        className={animated ? "melodot-dot melodot-dot-1" : ""}/>
      <circle
        cx="24"
        cy="18"
        r="2.5"
        fill="currentColor"
        className={animated ? "melodot-dot melodot-dot-2" : ""}/>
      <circle
        cx="36"
        cy="28"
        r="2.5"
        fill="currentColor"
        className={animated ? "melodot-dot melodot-dot-3" : ""}/>
    </svg>
  )
}
