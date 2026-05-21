import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

// ──────────────────────────────────────────────
// Variant & Size Definitions
// ──────────────────────────────────────────────

const variants = {
  primary:
    "bg-brand-600 hover:bg-brand-500 text-white shadow-glow/50 hover:shadow-glow",
  secondary:
    "bg-surface-700 hover:bg-surface-600 text-slate-200 border border-white/10",
  accent:
    "bg-accent-600 hover:bg-accent-500 text-white shadow-glow-accent/50 hover:shadow-glow-accent",
  ghost:
    "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white",
  danger:
    "bg-red-600/90 hover:bg-red-500 text-white",
  outline:
    "bg-transparent border border-brand-500/50 text-brand-400 hover:bg-brand-500/10 hover:border-brand-400",
} as const;

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-7 py-3 text-base rounded-xl",
} as const;

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────

type ButtonVariant = keyof typeof variants;
type ButtonSize = keyof typeof sizes;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center gap-2 font-medium",
          "transition-all duration-200 ease-out",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          "active:scale-[0.98]",
          // Variant & size
          variants[variant],
          sizes[size],
          // Modifiers
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize };
