import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold uppercase tracking-[0.14em] transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        solid: "bg-primary text-primary-foreground hover:bg-primary/88 active:scale-[0.99]",
        outline:
          "border border-foreground/25 text-foreground hover:border-foreground hover:bg-foreground hover:text-primary-foreground",
        live: "bg-live text-live-foreground hover:brightness-110 active:scale-[0.99]",
        ghost: "text-foreground hover:bg-secondary",
        link: "text-foreground underline underline-offset-4 hover:opacity-70 tracking-normal normal-case",
      },
      size: {
        sm: "h-9 px-4 text-[0.68rem] rounded-sm",
        md: "h-11 px-6 text-[0.72rem] rounded-sm",
        lg: "h-14 px-9 text-[0.78rem] rounded-sm",
        icon: "h-10 w-10 rounded-sm",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "solid", size: "md", block: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, asChild, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, block }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Please wait</span>
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
