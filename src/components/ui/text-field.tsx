import * as React from "react";

import { cn } from "@/lib/utils";

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
}

export const Input = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
      <div className="space-y-2">
        <label htmlFor={inputId} className="eyebrow block text-muted-foreground">
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-12 w-full rounded-sm border border-input bg-card px-4 text-sm text-foreground transition-colors placeholder:text-muted-foreground/70 focus:border-foreground focus:outline-none",
            error && "border-live focus:border-live",
            className,
          )}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} role="alert" className="text-xs font-medium text-live">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
