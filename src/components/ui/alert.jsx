// @ts-check

import {forwardRef} from "react";
import {cva} from "class-variance-authority";
import {clsx} from "clsx";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-green-500/50 text-green-600 dark:border-green-500 [&>svg]:text-green-600 bg-green-500/10",
        warning:
          "border-yellow-500/50 text-yellow-600 dark:border-yellow-500 [&>svg]:text-yellow-600 bg-yellow-500/10",
        info:
          "border-blue-500/50 text-blue-600 dark:border-blue-500 [&>svg]:text-blue-600 bg-blue-500/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/** @param {{className?: string, variant?: string}} props */
const Alert = forwardRef(function Alert({ className = "", variant = "default", ...props }, ref) {
  return (
    <div
      ref={ref}
      role="alert"
      className={clsx(alertVariants({ variant }), className)}
      {...props}
    />
  );
});

/** @param {{className?: string}} props */
const AlertTitle = forwardRef(function AlertTitle({ className = "", ...props }, ref) {
  return (
    <h5
      ref={ref}
      className={clsx("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  );
});

/** @param {{className?: string}} props */
const AlertDescription = forwardRef(function AlertDescription({ className = "", ...props }, ref) {
  return (
    <div
      ref={ref}
      className={clsx("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
});

export { Alert, AlertTitle, AlertDescription };
