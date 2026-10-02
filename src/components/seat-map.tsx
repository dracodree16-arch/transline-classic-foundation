import { useEffect, useMemo, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SeatStatus = "available" | "taken" | "reserved" | "selected";

interface SeatMapProps {
  capacity: number;
  taken: Set<string> | string[];
  reserved?: string[];
  selected?: string | null;
  onSelect: (seat: string) => void;
  onContinue?: () => void;
}

/** A row cell: seat number, aisle, door or empty spacer. */
type Cell = { kind: "seat"; n: number } | { kind: "aisle" } | { kind: "door" } | { kind: "empty" };

const SEAT_W = "w-12 sm:w-14";
const SEAT_H = "h-14 sm:h-16";

/**
 * Builds a top-down layout. Seat ids stay "1".."capacity" (stored format);
 * only the label is zero-padded.
 * - 33 seats: Kenyan/Isuzu 2+1 with front-right door and 4-seat rear bench.
 * - Other capacities: 2+2 with front-right door and rear bench of 5.
 */
function buildLayout(capacity: number): { cols: number; aisleCol: number; rows: Cell[][]; bench: number[] } {
  const total = Math.max(0, capacity);
  let n = 1;
  const next = () => ({ kind: "seat", n: n++ }) as Cell;

  if (total === 33) {
    const rows: Cell[][] = [];
    rows.push([next(), next(), { kind: "aisle" }, next()]); // before door
    rows.push([next(), next(), { kind: "aisle" }, { kind: "door" }]); // door gap
    for (let r = 0; r < 8; r++) rows.push([next(), next(), { kind: "aisle" }, next()]);
    const bench = [n, n + 1, n + 2, n + 3];
    return { cols: 4, aisleCol: 2, rows, bench };
  }

  const benchSize = total >= 10 ? 5 : 0;
  let remaining = total - benchSize;
  const rows: Cell[][] = [];
  const take = () => (remaining-- > 0 ? next() : ({ kind: "empty" } as Cell));
  // door row: 2 seats left, door right
  if (remaining > 0) rows.push([take(), take(), { kind: "aisle" }, { kind: "door" }, { kind: "empty" }]);
  while (remaining > 0) rows.push([take(), take(), { kind: "aisle" }, take(), take()]);
  const bench = Array.from({ length: benchSize }, (_, i) => n + i);
  return { cols: 5, aisleCol: 2, rows, bench };
}

function Seat({ n, status, onSelect }: { n: number; status: SeatStatus; onSelect: () => void }) {
  const disabled = status === "taken" || status === "reserved";
  const label = String(n).padStart(2, "0");
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      data-seat={n}
      aria-pressed={status === "selected"}
      aria-label={`Seat ${label}, ${status === "taken" ? "occupied" : status === "reserved" ? "unavailable" : status}`}
      className={cn(
        "group relative shrink-0 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        SEAT_W,
        SEAT_H,
        status === "available" && "hover:-translate-y-0.5 active:scale-95",
        status === "selected" && "scale-105 animate-in zoom-in-95",
        disabled && "cursor-not-allowed",
      )}
    >
      {/* Backrest (front-facing: backrest at the rear edge of the seat) */}
      <span
        className={cn(
          "absolute inset-x-1 bottom-0.5 h-3 rounded-b-lg rounded-t-sm border shadow-sm",
          status === "available" && "border-seat-available bg-seat-available/70",
          status === "selected" && "border-seat-selected bg-seat-selected",
          status === "taken" && "border-seat-booked/40 bg-seat-booked/40",
          status === "reserved" && "border-border bg-seat-blocked",
        )}
      />
      {/* Armrests */}
      {["left-0", "right-0"].map((side) => (
        <span
          key={side}
          className={cn(
            "absolute top-3 bottom-2 w-1.5 rounded-full",
            side,
            status === "selected" ? "bg-seat-selected/80" : status === "available" ? "bg-seat-available/60" : "bg-muted-foreground/20",
          )}
        />
      ))}
      {/* Cushion */}
      <span
        className={cn(
          "absolute inset-x-2 top-1 bottom-4 flex items-center justify-center rounded-lg border text-xs font-bold tabular-nums shadow-[inset_0_-2px_0_rgb(0_0_0/0.08)] transition-colors",
          status === "available" && "border-seat-available bg-card text-foreground group-hover:bg-seat-available/15",
          status === "selected" && "border-seat-selected bg-seat-selected text-seat-selected-foreground shadow-md",
          status === "taken" && "border-seat-booked/40 bg-seat-booked/15 text-muted-foreground line-through",
          status === "reserved" && "border-border bg-seat-blocked text-seat-blocked-foreground",
        )}
      >
        {label}
      </span>
    </button>
  );
}

function Legend() {
  const items = [
    { label: "Available", cls: "border-seat-available bg-card" },
    { label: "Selected", cls: "border-seat-selected bg-seat-selected" },
    { label: "Occupied", cls: "border-seat-booked/40 bg-seat-booked/15" },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={cn("size-4 rounded-md border-2", i.cls)} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

export function SeatMap({ capacity, taken, reserved = [], selected, onSelect, onContinue }: SeatMapProps) {
  const layout = useMemo(() => buildLayout(capacity), [capacity]);
  const mapRef = useRef<HTMLDivElement>(null);

  const statusOf = (n: number): SeatStatus => {
    const id = String(n);
    if (selected === id) return "selected";
    if (taken instanceof Set ? taken.has(id) : taken.includes(id)) return "taken";
    if (reserved.includes(id)) return "reserved";
    return "available";
  };

  useEffect(() => {
    if (!selected) return;
    mapRef.current
      ?.querySelector(`[data-seat="${selected}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [selected]);

  const gridCols = layout.cols === 4 ? "grid-cols-[auto_auto_2.5rem_auto]" : "grid-cols-[auto_auto_2.5rem_auto_auto]";
  const selectedLabel = selected ? String(selected).padStart(2, "0") : null;

  return (
    <div className="space-y-4">
      <Legend />

      <div ref={mapRef} className="overflow-x-auto pb-2">
        {/* Bus shell */}
        <div className="relative mx-auto w-fit rounded-t-[3.5rem] rounded-b-[2rem] border-[3px] border-foreground/70 bg-secondary/50 p-3 shadow-[var(--shadow-card)] sm:p-4">
          {/* Mirrors */}
          <span className="absolute -left-2.5 top-10 h-6 w-2 rounded-l-md bg-foreground/60" aria-hidden />
          <span className="absolute -right-2.5 top-10 h-6 w-2 rounded-r-md bg-foreground/60" aria-hidden />

          <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">▲ Front</p>

          {/* Windscreen + dashboard */}
          <div className="mb-3 rounded-t-[2.5rem] rounded-b-lg border-2 border-border bg-card px-3 pb-2 pt-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex size-9 items-center justify-center rounded-full border-[3px] border-foreground/70" aria-hidden>
                  <span className="size-2 rounded-full bg-foreground/70" />
                  <span className="absolute h-[3px] w-full bg-foreground/70" />
                </span>
                <span className="text-xs font-semibold text-muted-foreground">Driver</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Dashboard</span>
            </div>
          </div>

          {/* Seating deck */}
          <div className={cn("grid gap-x-1.5 gap-y-2", gridCols)}>
            {layout.rows.map((row, r) =>
              row.map((cell, c) => {
                const key = `${r}-${c}`;
                if (cell.kind === "seat") return <Seat key={key} n={cell.n} status={statusOf(cell.n)} onSelect={() => onSelect(String(cell.n))} />;
                if (cell.kind === "aisle")
                  return <div key={key} className={cn(SEAT_H, "bg-muted/60 bg-[repeating-linear-gradient(0deg,transparent_0_6px,hsl(0_0%_50%/0.08)_6px_7px)]")} aria-hidden />;
                if (cell.kind === "door")
                  return (
                    <div key={key} className={cn(SEAT_W, SEAT_H, "relative -mr-3 flex items-center justify-center sm:-mr-4")} aria-label="Entrance door">
                      <span className="absolute inset-y-0 right-0 w-1.5 rounded-full bg-seat-available" />
                      <span className="absolute inset-y-1 left-1 right-2 rounded-md border-2 border-dashed border-seat-available/70 bg-seat-available/10" />
                      <span className="relative text-[10px] font-bold uppercase text-seat-available-foreground">Door</span>
                    </div>
                  );
                return <div key={key} className={cn(SEAT_W, SEAT_H)} aria-hidden />;
              }),
            )}
          </div>

          {/* Rear bench */}
          {layout.bench.length > 0 && (
            <div className="mt-2 flex justify-between gap-1 rounded-b-2xl border-t-2 border-dashed border-border pt-2">
              {layout.bench.map((n) => (
                <Seat key={n} n={n} status={statusOf(n)} onSelect={() => onSelect(String(n))} />
              ))}
            </div>
          )}

          <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Rear ▼</p>
        </div>
      </div>

      {/* Sticky selection summary */}
      <div className="sticky bottom-2 z-20 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Selected seats</p>
          <p className="truncate text-sm font-semibold">
            {selectedLabel ? (
              <>
                Seat <span className="text-seat-selected">{selectedLabel}</span> · 1 passenger
              </>
            ) : (
              <span className="font-normal text-muted-foreground">Tap a seat to select</span>
            )}
          </p>
        </div>
        {onContinue && (
          <Button size="sm" disabled={!selected} onClick={onContinue}>
            Continue <ArrowRight className="ml-1 size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default SeatMap;
