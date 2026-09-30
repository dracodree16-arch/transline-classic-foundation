import { CircleUserRound, DoorOpen } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface SeatMapProps {
  capacity: number;
  taken: string[];
  reserved?: string[];
  selected: string | null;
  onSelect: (seat: string) => void;
}

function LegendDot({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className={cn("h-4 w-4 rounded-md border-2", className)} />
      {label}
    </span>
  );
}

function Seat({
  number,
  status,
  onSelect,
}: {
  number: string;
  status: "available" | "taken" | "reserved" | "selected";
  onSelect: () => void;
}) {
  const disabled = status === "taken" || status === "reserved";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-label={`Seat ${number}`}
      className={cn(
        "group relative h-[58px] w-[48px] rounded-lg transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        disabled && "cursor-not-allowed",
        status === "available" &&
          "bg-background hover:-translate-y-0.5 hover:shadow-md",
        status === "taken" &&
          "cursor-not-allowed bg-muted opacity-70",
        status === "reserved" &&
          "cursor-not-allowed bg-amber-100 opacity-80",
        status === "selected" &&
          "bg-primary text-primary-foreground shadow-md"
      )}
    >
      {/* Seat back */}
      <span
        className={cn(
          "absolute left-[7px] right-[7px] top-[4px] h-[25px] rounded-t-[8px] rounded-b-[5px] border-2",
          status === "available" &&
            "border-emerald-500 bg-emerald-50",
          status === "taken" &&
            "border-muted-foreground/40 bg-muted-foreground/20",
          status === "reserved" &&
            "border-amber-500 bg-amber-100",
          status === "selected" &&
            "border-primary-foreground/80 bg-primary"
        )}
      />

      {/* Left armrest */}
      <span
        className={cn(
          "absolute left-[2px] top-[29px] h-[17px] w-[7px] rounded-full border",
          status === "available" && "border-emerald-500 bg-emerald-100",
          status === "taken" && "border-muted-foreground/30 bg-muted-foreground/20",
          status === "reserved" && "border-amber-500 bg-amber-200",
          status === "selected" &&
            "border-primary-foreground/70 bg-primary"
        )}
      />

      {/* Right armrest */}
      <span
        className={cn(
          "absolute right-[2px] top-[29px] h-[17px] w-[7px] rounded-full border",
          status === "available" && "border-emerald-500 bg-emerald-100",
          status === "taken" && "border-muted-foreground/30 bg-muted-foreground/20",
          status === "reserved" && "border-amber-500 bg-amber-200",
          status === "selected" &&
            "border-primary-foreground/70 bg-primary"
        )}
      />

      {/* Seat cushion */}
      <span
        className={cn(
          "absolute bottom-[5px] left-[8px] right-[8px] h-[14px] rounded-md border",
          status === "available" && "border-emerald-500 bg-emerald-200",
          status === "taken" && "border-muted-foreground/30 bg-muted-foreground/20",
          status === "reserved" && "border-amber-500 bg-amber-200",
          status === "selected" &&
            "border-primary-foreground/70 bg-primary"
        )}
      />

      {/* Seat number */}
      <span
        className={cn(
          "absolute inset-0 z-10 flex items-center justify-center pt-1 text-[11px] font-semibold",
          status === "available" && "text-emerald-700",
          status === "taken" && "text-muted-foreground",
          status === "reserved" && "text-amber-800",
          status === "selected" && "text-primary-foreground"
        )}
      >
        {number}
      </span>
    </button>
  );
}

export function SeatMap({
  capacity,
  taken,
  reserved = [],
  selected,
  onSelect,
}: SeatMapProps) {
  const seats = useMemo(() => {
    const total = Math.max(0, capacity);

    return Array.from({ length: total }, (_, index) => {
      const number = String(index + 1);

      let status: "available" | "taken" | "reserved" | "selected" =
        "available";

      if (taken.includes(number)) {
        status = "taken";
      } else if (reserved.includes(number)) {
        status = "reserved";
      }

      if (selected === number) {
        status = "selected";
      }

      return {
        number,
        status,
      };
    });
  }, [capacity, taken, reserved, selected]);

  /*
   * Standard bus layout:
   *
   *  Driver
   *
   *  1  2     3  4
   *  5  6     7  8
   *  9 10    11 12
   *
   * The middle space represents the aisle.
   */
  const rows = useMemo(() => {
    const result: Array<
      Array<{
        number: string;
        status: "available" | "taken" | "reserved" | "selected";
      } | null>
    > = [];

    for (let i = 0; i < seats.length; i += 4) {
      result.push([
        seats[i] ?? null,
        seats[i + 1] ?? null,
        seats[i + 2] ?? null,
        seats[i + 3] ?? null,
      ]);
    }

    return result;
  }, [seats]);

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="mb-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <LegendDot
          className="border-emerald-500 bg-emerald-50"
          label="Available"
        />

        <LegendDot
          className="border-primary bg-primary"
          label="Selected"
        />

        <LegendDot
          className="border-muted-foreground/40 bg-muted"
          label="Booked"
        />

        <LegendDot
          className="border-amber-500 bg-amber-100"
          label="Reserved"
        />
      </div>

      {/* Bus body */}
      <div className="mx-auto w-full max-w-[360px] rounded-[42px] border-2 border-border bg-muted/30 p-4 shadow-sm">
        {/* Front / Driver */}
        <div className="mb-6 rounded-2xl border border-border bg-background p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <CircleUserRound className="h-5 w-5" />
              <span>Driver</span>
            </div>

            <DoorOpen className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {/* Seats */}
        <div className="flex flex-col items-center gap-3">
          {rows.map((row, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="flex items-center justify-center gap-2"
            >
              {/* Left pair */}
              <div className="flex gap-1">
                {row.slice(0, 2).map((seat) =>
                  seat ? (
                    <Seat
                      key={seat.number}
                      number={seat.number}
                      status={seat.status}
                      onSelect={() => onSelect(seat.number)}
                    />
                  ) : (
                    <div
                      key={`empty-${rowIndex}-${Math.random()}`}
                      className="h-[58px] w-[48px]"
                    />
                  )
                )}
              </div>

              {/* Aisle */}
              <div className="w-5 shrink-0" />

              {/* Right pair */}
              <div className="flex gap-1">
                {row.slice(2, 4).map((seat) =>
                  seat ? (
                    <Seat
                      key={seat.number}
                      number={seat.number}
                      status={seat.status}
                      onSelect={() => onSelect(seat.number)}
                    />
                  ) : (
                    <div
                      key={`empty-right-${rowIndex}-${Math.random()}`}
                      className="h-[58px] w-[48px]"
                    />
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Rear */}
        <div className="mt-6 flex justify-center">
          <div className="rounded-xl border border-border bg-background px-5 py-2 text-xs text-muted-foreground">
            Rear
          </div>
        </div>
      </div>

      {/* Selected seat */}
      <div className="mt-4 text-center">
        {selected ? (
          <p className="text-sm font-medium">
            Selected seat:{" "}
            <span className="text-primary">{selected}</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a seat to continue
          </p>
        )}
      </div>
    </div>
  );
}

export default SeatMap;
