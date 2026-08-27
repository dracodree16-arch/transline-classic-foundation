import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export function QueryState({
  isLoading,
  error,
  isEmpty,
  emptyMessage = "No records yet.",
  children,
}: {
  isLoading: boolean;
  error?: unknown;
  isEmpty?: boolean | undefined;
  emptyMessage?: string | undefined;
  children: ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading…
      </div>
    );
  }
  if (error) {
    return (
      <p className="py-6 text-sm text-destructive">
        {(error as Error)?.message ?? "Failed to load data."}
      </p>
    );
  }
  if (isEmpty) {
    return <p className="py-8 text-sm text-muted-foreground">{emptyMessage}</p>;
  }
  return <>{children}</>;
}
