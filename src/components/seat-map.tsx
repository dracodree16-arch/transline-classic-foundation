import { DoorOpen, LifeBuoy } from "lucide-react";

export type SeatState = "available" | "booked" | "selected" | "blocked";

/**
 * Builds a realistic coach layout from the bus capacity:
 * rows of 4 (2 + aisle + 2) and, where the capacity allows it, a 5-seat back row.
 */
export function buildSeatLayout(capacity: number): { rows: string[][]; backRow: string[] } {
  const total = Math.max(0, Math.floor(capacity));
  const hasBackRow = total >= 9 && (total - 5) % 4 === 0;
  const frontCount = hasBackRow ? total - 5 : total;

  const rows: string[][] = [];
  for (let i = 0; i < frontCount; i += 4) {
    rows.push(
      Array.from({ length: Math.min(4, frontCount - i) }, (_, j) => String(i + j + 1)),
    );
  }

  const backRow = hasBackRow
    ? Array.from({ length: 5 }, (_, i) => String(frontCount + i + 1))
    : [];

  return { rows, backRow };
}

const seatClass: Record<SeatState, string> = {
  available: "bg-seat-available text-seat-available-foreground hover:brightness-105",
  booked: "bg-seat-booked text-seat-booked-foreground cursor-not-allowed",
  selected: "bg-seat-selected text-seat-selected-foreground",
  blocked: "bg-seat-blocked text-seat-blocked-foreground cursor-not-allowed",
};

/** An armchair-shaped seat: two armrests, a padded back and the seat number. */
function Seat({
  seat,
  state,
  onSelect,
}: {
  seat: string;
  state: SeatState;
  onSelect?: ((seat: string) => void) | undefined;
}) {
  const interactive = (state === "available" || state === "selected") && !!onSelect;
  return (
    <button
      type="button"
      aria-label={`Seat ${seat} — ${state}`}
      aria-pressed={state === "selected"}
      disabled={!interactive}
      onClick={interactive ? () => onSelect?.(seat) : undefined}
      className={[
        "group relative flex h-11 w-12 flex-col items-center justify-end transition-transform",
        interactive ? "cursor-pointer hover:-translate-y-0.5" : "cursor-not-allowed",
        state === "selected" ? "drop-shadow-[0_0_0.35rem_hsl(var(--seat-selected)/0.7)]" : "",
      ].join(" ")}
    >
      {/* backrest with the seat label */}
      <span className="relative z-10 -mb-1 flex h-5 w-7 items-center justify-center rounded-t-md border border-border/60 bg-card text-[10px] font-semibold text-foreground">
        {seat}
      </span>
      {/* armrests + cushion */}
      <span
        className={[
          "flex h-6 w-full items-end justify-between rounded-md px-0 shadow-sm",
          seatClass[state],
        ].join(" ")}
      >
        <span className="h-6 w-2 rounded-l-md bg-current opacity-100" />
        <span className="mb-0 h-3 flex-1 rounded-sm bg-card/90" />
        <span className="h-6 w-2 rounded-r-md bg-current opacity-100" />
      </span>
    </button>
  );
}


export function SeatLegend() {
  const items: { label: string; state: SeatState }[] = [
    { label: "Available", state: "available" },
    { label: "Booked", state: "booked" },
    { label: "Selected", state: "selected" },
    { label: "Unavailable", state: "blocked" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-2">
          <span className={`inline-block size-3.5 rounded ${seatClass[i.state].split(" ")[0]}`} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

export function SeatMap({
  capacity,
  taken,
  blocked,
  selected,
  onSelect,
  plate,
}: {
  capacity: number;
  taken: Set<string>;
  blocked?: Set<string> | undefined;
  selected?: string | undefined;
  onSelect?: ((seat: string) => void) | undefined;
  plate?: string | null | undefined;
}) {
  const { rows, backRow } = buildSeatLayout(capacity);

  const stateOf = (seat: string): SeatState =>
    selected === seat
      ? "selected"
      : taken.has(seat)
        ? "booked"
        : blocked?.has(seat)
          ? "blocked"
          : "available";

  return (
    <div className="space-y-4">
      <div className="mx-auto w-fit rounded-[2.5rem] border-2 border-border bg-secondary/40 p-4 shadow-[var(--shadow-card)]">
        {/* Driver cabin */}
        <div className="mb-4 flex items-center justify-between gap-6 rounded-t-[2rem] border-b-2 border-dashed border-border bg-card px-4 py-3">
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <CircleDot className="size-5" /> Driver
          </span>
          <span className="text-[11px] font-mono uppercase tracking-wide text-muted-foreground">
            {plate ?? "Coach"}
          </span>
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <DoorOpen className="size-5" /> Door
          </span>
        </div>

        <div className="space-y-2">
          {rows.map((row, idx) => (
            <div key={idx} className="flex items-center justify-center gap-2">
              <div className="flex gap-2">
                {row.slice(0, 2).map((seat) => (
                  <Seat key={seat} seat={seat} state={stateOf(seat)} onSelect={onSelect} />
                ))}
              </div>
              <span className="w-8 text-center text-[10px] uppercase text-muted-foreground/50">
                {idx + 1}
              </span>
              <div className="flex gap-2">
                {row.slice(2).map((seat) => (
                  <Seat key={seat} seat={seat} state={stateOf(seat)} onSelect={onSelect} />
                ))}
              </div>
            </div>
          ))}

          {backRow.length > 0 && (
            <div className="flex items-center justify-center gap-2 border-t border-dashed border-border pt-3">
              {backRow.map((seat) => (
                <Seat key={seat} seat={seat} state={stateOf(seat)} onSelect={onSelect} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 rounded-b-[2rem] border-t-2 border-dashed border-border pt-3 text-[11px] text-muted-foreground">
          <CircleUserRound className="size-4" /> Rear of bus
        </div>
      </div>

      <SeatLegend />
    </div>
  );
}
