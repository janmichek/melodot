// @ts-check

import {forwardRef} from "react";
import {clsx} from "clsx";

const Card = forwardRef(function Card({ className = "", ...props }, ref) {
  return (
    <div
      ref={ref}
      className={clsx(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  );
});

const CardHeader = forwardRef(function CardHeader({ className = "", ...props }, ref) {
  return (
    <div
      ref={ref}
      className={clsx("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
});

const CardTitle = forwardRef(function CardTitle({ className = "", ...props }, ref) {
  return (
    <div
      ref={ref}
      className={clsx("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
});

const CardDescription = forwardRef(function CardDescription({ className = "", ...props }, ref) {
  return (
    <div
      ref={ref}
      className={clsx("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});

const CardContent = forwardRef(function CardContent({ className = "", ...props }, ref) {
  return (
    <div
      ref={ref}
      className={clsx("p-6 pt-0", className)}
      {...props}
    />
  );
});

const CardFooter = forwardRef(function CardFooter({ className = "", ...props }, ref) {
  return (
    <div
      ref={ref}
      className={clsx("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
});

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
