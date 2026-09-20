import React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-blue-700 text-white hover:bg-blue-800 shadow-sm": variant === "primary",
            "bg-orange-500 text-white hover:bg-orange-600 shadow-sm": variant === "secondary",
            "border border-slate-200 bg-white hover:bg-slate-100 text-slate-900": variant === "outline",
            "hover:bg-slate-100 text-slate-900": variant === "ghost",
            "h-9 px-4 text-sm": size === "sm",
            "h-10 px-6 py-2": size === "md",
            "h-11 px-8 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
