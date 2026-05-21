import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, type = "text", ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            // Base
            "w-full px-4 py-2.5 rounded-xl text-sm",
            "bg-surface-800/80 border border-white/10",
            "text-slate-200 placeholder:text-slate-500",
            // Focus
            "focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50",
            // Transitions
            "transition-all duration-200",
            // Error state
            error &&
              "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400 mt-1">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-slate-500 mt-1">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, type InputProps };
