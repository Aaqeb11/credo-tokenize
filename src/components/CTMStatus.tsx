"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";

type Status = "online" | "degraded" | "offline" | "unauthenticated" | "loading";

const config: Record<
  Status,
  {
    label: string;
    dot: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  online: { label: "CTM Online", dot: "bg-green-500", variant: "outline" },
  degraded: {
    label: "CTM Degraded",
    dot: "bg-yellow-400 animate-pulse",
    variant: "outline",
  },
  offline: { label: "CTM Offline", dot: "bg-red-500", variant: "destructive" },
  unauthenticated: {
    label: "Not Signed In",
    dot: "bg-gray-400",
    variant: "secondary",
  },
  loading: {
    label: "Checking...",
    dot: "bg-gray-300 animate-pulse",
    variant: "secondary",
  },
};

async function fetchStatus(): Promise<Status> {
  try {
    const res = await fetch("/api/ctm-status", { cache: "no-store" });
    const data = await res.json();
    return data.status as Status;
  } catch {
    return "offline";
  }
}

export default function CTMStatus() {
  const [status, setStatus] = useState<Status>("loading");
  const refreshRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const result = await fetchStatus();
      if (!cancelled) setStatus(result);
    };

    refreshRef.current = () => {
      setStatus("loading");
      run();
    };

    run();
    const interval = setInterval(run, 30_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const { label, dot, variant } = config[status];

  return (
    <Badge variant={variant} className="gap-1.5 px-3 py-1 text-sm font-medium">
      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
      {label}
      <button
        onClick={() => refreshRef.current?.()}
        title="Refresh"
        className="ml-0.5 opacity-40 hover:opacity-80 transition-opacity"
      >
        ↻
      </button>
    </Badge>
  );
}
