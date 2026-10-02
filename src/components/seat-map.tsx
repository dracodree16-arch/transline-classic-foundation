import { useEffect, useMemo, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getBusLayout, resolveLayout } from "@/lib/bus-layouts";

type SeatStatus = "available" | "taken" | "reserved" | "selected";

interface SeatMapProps {
  capacity: number;
  taken: Set<string> | string[];
  reserved?: string[];
  selected?: string | null | undefined;
  onSelect: (seat: string) => void;
  onContinue?: () => void;
}

const SEAT_W = "w-12 sm:w-14";
const SEAT_H = "h-14 sm:h-16";

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
  const layout = useMemo(() => resolveLayout(getBusLayout(capacity)), [capacity]);
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

          {layout.frontSeats.length > 0 && (
            <div className="mb-3 flex gap-1.5 border-b-2 border-dashed border-border pb-3">
              {layout.frontSeats.map((seat) => (
                <Seat key={seat.id} n={seat.number} status={statusOf(seat.number)} onSelect={() => onSelect(seat.id)} />
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2">
            {layout.rows.map((row, r) => (
              <div
                key={r}
                className={cn("grid gap-x-1.5", row.bench && "mt-1 border-t-2 border-dashed border-border pt-2")}
                style={{ gridTemplateColumns: row.bench ? `repeat(${row.cells.length}, minmax(0, 1fr))` : row.cells.map((t) => (t.token === "_" ? "2.5rem" : "auto")).join(" ") }}
              >
                {row.cells.map((cell, c) => {
                  const key = `${r}-${c}`;
                  if (cell.seat) return <Seat key={key} n={cell.seat.number} status={statusOf(cell.seat.number)} onSelect={() => onSelect(cell.seat!.id)} />;
                  if (cell.token === "_")
                    return <div key={key} className={cn(SEAT_H, "bg-muted/60")} aria-hidden />;
                  if (cell.token === "D")
                    return (
                      <div key={key} className={cn(SEAT_W, SEAT_H, "relative flex items-center justify-center")} aria-label="Entrance door">
                        <span className={cn("absolute inset-y-0 w-1.5 rounded-full bg-seat-available", c === 0 ? "-left-3 sm:-left-4" : "-right-3 sm:-right-4")} />
                        <span className="absolute inset-1 rounded-md border-2 border-dashed border-seat-available/70 bg-seat-available/10" />
                        <span className="relative text-[10px] font-bold uppercase text-seat-available-foreground">Door</span>
                      </div>
                    );
                  return <div key={key} className={cn(SEAT_W, SEAT_H)} aria-hidden />;
                })}
              </div>
            ))}
          </div>

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
