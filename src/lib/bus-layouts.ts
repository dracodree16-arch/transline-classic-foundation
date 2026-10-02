/**
 * Bus layout engine configuration. The SeatMap component renders whatever
 * layout is returned here; it contains no per-vehicle positions itself.
 *
 * Row cell tokens:
 *  "S" passenger seat   "_" aisle   "D" door opening   "x" empty space
 * Rows may be irregular (1+aisle+2, 2+aisle+1, 3+aisle+2, ...).
 * Seats are numbered sequentially front-to-back, left-to-right.
 * Seat ids stay "1".."capacity" (the stored booking format).
 */
export type CellToken = "S" | "_" | "D" | "x";
export type Side = "left" | "right";

export interface BusRow {
  cells: CellToken[];
  /** Rear bench rows are rendered edge-to-edge across the aisle. */
  bench?: boolean;
}

export interface BusLayoutConfig {
  id: string;
  name: string;
  vehicleType: "minibus" | "midibus" | "coach";
  capacity: number;
  driverSide: Side;
  /** Passenger seats in the front cabin beside the driver (numbered first). */
  frontPassengers: number;
  rows: BusRow[];
}

export interface Seat {
  id: string;
  number: number;
  label: string;
  row: number;
  side: Side | "center";
  position: number;
  orientation: "forward";
}

const r = (s: string, bench = false): BusRow => ({ cells: s.split("") as CellToken[], bench });
const repeat = (s: string, n: number) => Array.from({ length: n }, () => r(s));

export const BUS_LAYOUTS: BusLayoutConfig[] = [
  {
    id: "minibus-14",
    name: "14-seater minibus",
    vehicleType: "minibus",
    capacity: 14,
    driverSide: "right",
    frontPassengers: 2,
    rows: [r("D_SS"), r("S_SS"), r("S_SS"), r("SSSS", true)],
  },
  {
    id: "minibus-18",
    name: "18-seater minibus",
    vehicleType: "minibus",
    capacity: 18,
    driverSide: "right",
    frontPassengers: 2,
    rows: [r("D_SS"), ...repeat("S_SS", 3), r("SSSSS", true)],
  },
  {
    id: "isuzu-33",
    name: "33-seater (Isuzu style)",
    vehicleType: "midibus",
    capacity: 33,
    driverSide: "right",
    frontPassengers: 0,
    rows: [r("SS_S"), r("SS_D"), ...repeat("SS_S", 8), r("SSSS", true)],
  },
  {
    id: "coach-64",
    name: "64-seater coach",
    vehicleType: "coach",
    capacity: 64,
    driverSide: "right",
    frontPassengers: 0,
    rows: [r("SS_DD"), ...repeat("SS_SS", 14), r("SSSSSS", true)],
  },
];

/** Generic 2+2 layout with front-right door for capacities without a preset. */
function generateLayout(capacity: number): BusLayoutConfig {
  const total = Math.max(0, capacity);
  const benchSize = total >= 12 ? 5 : 0;
  let left = total - benchSize;
  const rows: BusRow[] = [];
  const take = () => (left-- > 0 ? "S" : "x");
  if (left > 0) rows.push(r(`${take()}${take()}_DD`));
  while (left > 0) rows.push(r(`${take()}${take()}_${take()}${take()}`));
  if (benchSize) rows.push(r("S".repeat(benchSize), true));
  return {
    id: `custom-${total}`,
    name: `${total}-seater`,
    vehicleType: total <= 20 ? "minibus" : total <= 40 ? "midibus" : "coach",
    capacity: total,
    driverSide: "right",
    frontPassengers: 0,
    rows,
  };
}

export function getBusLayout(capacity: number): BusLayoutConfig {
  return BUS_LAYOUTS.find((l) => l.capacity === capacity) ?? generateLayout(capacity);
}

export interface ResolvedLayout {
  config: BusLayoutConfig;
  frontSeats: Seat[];
  rows: Array<{ bench: boolean; cells: Array<{ token: CellToken; seat?: Seat }> }>;
  columns: number;
}

/** Turns a config into numbered seats. Doors/aisles never receive a seat. */
export function resolveLayout(config: BusLayoutConfig): ResolvedLayout {
  let n = 1;
  const make = (row: number, side: Seat["side"], position: number): Seat => {
    const number = n++;
    return { id: String(number), number, label: String(number).padStart(2, "0"), row, side, position, orientation: "forward" };
  };
  const passengerSide: Side = config.driverSide === "right" ? "left" : "right";
  const frontSeats = Array.from({ length: config.frontPassengers }, (_, i) => make(0, passengerSide, i));
  const rows = config.rows.map((row, ri) => {
    const aisleAt = row.cells.indexOf("_");
    return {
      bench: !!row.bench,
      cells: row.cells.map((token, ci) =>
        token === "S"
          ? { token, seat: make(ri + 1, row.bench || aisleAt < 0 ? "center" : ci < aisleAt ? "left" : "right", ci) }
          : { token },
      ),
    };
  });
  const columns = Math.max(1, ...config.rows.filter((x) => !x.bench).map((x) => x.cells.length));
  return { config, frontSeats, rows, columns };
}
