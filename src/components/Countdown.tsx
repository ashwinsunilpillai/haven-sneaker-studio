import { useEffect, useState } from "react";

import { formatCountdown } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CountdownProps {
  endsAt: string;
  className?: string | undefined;
  label?: string | undefined;
}

/** Renders after mount only, so SSR output stays stable. */
export function Countdown({ endsAt, className, label }: CountdownProps) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(endsAt).getTime();
    const tick = () => setRemaining(target - Date.now());
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [endsAt]);

  const ended = remaining !== null && remaining <= 0;

  return (
    <span className={cn("tabular-nums", className)}>
      {label ? <span className="sr-only">{label}: </span> : null}
      {remaining === null ? "--:--:--" : ended ? "Auction ended" : formatCountdown(remaining)}
    </span>
  );
}
