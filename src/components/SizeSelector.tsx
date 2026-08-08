import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  sizes: number[];
  value: number | null;
  onChange: (size: number) => void;
  error?: string | undefined;
}

export function SizeSelector({ sizes, value, onChange, error }: SizeSelectorProps) {
  return (
    <fieldset>
      <legend className="eyebrow mb-3 text-muted-foreground">Select size (UK)</legend>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const selected = value === size;
          return (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(size)}
              className={cn(
                "h-12 min-w-14 rounded-sm border px-4 text-sm font-semibold transition-colors duration-200",
                selected
                  ? "border-foreground bg-foreground text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-foreground",
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-xs font-medium text-live">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
