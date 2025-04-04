"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

// Alert Component
const Alert = React.forwardRef(({ className, variant = "default", children, ...props }, ref) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
    destructive: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-l-4 border-red-500",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 border-l-4 border-yellow-500",
    success: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-l-4 border-green-500",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-l-4 border-blue-500",
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative flex flex-col gap-1 rounded-lg p-4",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Alert.displayName = "Alert";

// Alert Title Component
const AlertTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("font-medium leading-none tracking-tight", className)}
    {...props}
  >
    {children}
  </h5>
));
AlertTitle.displayName = "AlertTitle";

// Alert Description Component
const AlertDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  >
    {children}
  </div>
));
AlertDescription.displayName = "AlertDescription";

// Collapsible Component
const Collapsible = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("overflow-hidden", className)}
    {...props}
  >
    {children}
  </div>
));
Collapsible.displayName = "Collapsible";

// CollapsibleTrigger Component
const CollapsibleTrigger = React.forwardRef(({ className, children, asChild, ...props }, ref) => {
  const Comp = asChild ? React.cloneElement(React.Children.only(children), {
    ref,
    ...props
  }) : (
    <button
      ref={ref}
      className={cn("flex items-center justify-between w-full p-2", className)}
      {...props}
    >
      {children}
    </button>
  );
  
  return Comp;
});
CollapsibleTrigger.displayName = "CollapsibleTrigger";

// CollapsibleContent Component
const CollapsibleContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("overflow-hidden transition-all", className)}
    {...props}
  >
    {children}
  </div>
));
CollapsibleContent.displayName = "CollapsibleContent";

export {
  Alert,
  AlertTitle,
  AlertDescription,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  ChevronDown
}; 