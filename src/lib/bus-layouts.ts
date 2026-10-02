/**
 * Research-based bus layout engine for the Transline seat selector.
 *
 * Kenyan reference capacities used here are based on Isuzu East Africa's
 * current Kenya bus range: 25, 33, 50 and 67 seats, plus a 29-seat NQR
 * body variant documented by a Kenyan Isuzu dealer. 14- and 18-seat layouts
 * are retained as configurable minibus templates because Transline may use
 * smaller vehicles that are not part of that Isuzu range.
 *
 * Row cell tokens:
 *   "S" passenger seat
 *   "_" central aisle
 *   "D" side entrance/door opening
 *   "x" empty/non-seat space
 *
 * Important: the seat-map UI is deliberately data-driven. Real bus bodies
 * can vary even on the same chassis, so these are reference configurations,
 * not a claim that every Kenyan body builder uses an identical interior.
 */
export type CellToken = "S" | "_" | "D" | "x";
export type Side = "left" | "right";

export interface BusRow {
  cells: CellToken[];
  /** Rear bench rows are rendered edge-to-edge across the cabin. */
  bench?: boolean;
}

export interface BusLayoutConfig {
  id: string;
  name: string;
  vehicleType: "minibus" | "midibus" | "coach";
  capacity: number;
  driverSide: Side;
  /** Passenger seats in a front cabin area, numbered before normal rows. */
  frontPassengers: number;
  /** Human-readable reference for staff/admin tooling. */
  reference?: string;
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

const r = (s: string, bench = false): BusRow => ({
  cells: s.split("") as CellToken[],
  bench,
});

const repeat = (s: string, n: number) =>
  Array.from({ length: n }, () => r(s));

/*
 * Door convention:
 *   SS_D = two seats on the left, central aisle, right-side entrance.
 *
 * This deliberately puts the entrance on the bus's right side near the
 * front. The following row resumes passenger seating on the right, which
 * produces the irregular front/door arrangement seen in many PSV-style
 * layouts instead of forcing every row into a perfect 2+2 grid.
 */
export const BUS_LAYOUTS: BusLayoutConfig[] = [
  {
    id: "minibus-14",
    name: "14-seater minibus",
    vehicleType: "minibus",
    capacity: 14,
    driverSide: "right",
    frontPassengers: 0,
    reference: "Compact PSV/minibus reference layout",
    rows: [r("SS_D"), ...repeat("SS_S", 3), r("SSS", true)],
  },
  {
    id: "minibus-18",
    name: "18-seater minibus",
    vehicleType: "minibus",
    capacity: 18,
    driverSide: "right",
    frontPassengers: 0,
    reference: "Compact PSV/minibus reference layout",
    rows: [r("SS_D"), ...repeat("SS_S", 4), r("SSSS", true)],
  },
  {
    id: "isuzu-nmr-25",
    name: "25-seater Isuzu NMR",
    vehicleType: "midibus",
    capacity: 25,
    driverSide: "right",
    frontPassengers: 0,
    reference: "Isuzu East Africa NMR85 / 25-seat reference",
    rows: [r("SS_D"), ...repeat("SS_S", 6), r("SSSSS", true)],
  },
  {
    id: "isuzu-nqr-29",
    name: "29-seater Isuzu NQR",
    vehicleType: "midibus",
    capacity: 29,
    driverSide: "right",
    frontPassengers: 0,
    reference: "NQR Yagura / 29-seat reference",
    rows: [r("SS_D"), ...repeat("SS_S", 7), r("SSSSSS", true)],
  },
  {
    id: "isuzu-nqr-33",
    name: "33-seater Isuzu NQR / PSV",
    vehicleType: "midibus",
    capacity: 33,
    driverSide: "right",
    frontPassengers: 0,
    reference:
      "Isuzu East Africa NQR81M 33-seat reference; right-side front entrance adapted for Transline's requested view",
    rows: [r("SS_D"), ...repeat("SS_S", 9), r("SSSS", true)],
  },
  {
    id: "isuzu-frr-50",
    name: "50-seater Isuzu FRR",
    vehicleType: "coach",
    capacity: 50,
    driverSide: "right",
    frontPassengers: 0,
    reference:
      "Isuzu East Africa FRR90 50-seat reference; body-builder layouts may vary",
    rows: [r("SS_D"), ...repeat("SS_S", 16)],
  },
  {
    id: "isuzu-frr-51",
    name: "51-seater Isuzu FRR",
    vehicleType: "coach",
    capacity: 51,
    driverSide: "right",
    frontPassengers: 0,
    reference: "Kenya fleet/PSV reference configuration",
    rows: [r("SS_D"), ...repeat("SS_S", 15), r("SSSS", true)],
  },
  {
    id: "isuzu-fvr-67",
    name: "67-seater Isuzu FVR",
    vehicleType: "coach",
    capacity: 67,
    driverSide: "right",
    frontPassengers: 0,
    reference:
      "Isuzu East Africa FVR34S 67-seat reference; larger coach-style 3+3 cabin rows",
    rows: [r("SS_D"), ...repeat("SSS_SSS", 10), r("SSSSS", true)],
  },
];

/** Count only passenger seats; doors, aisles and empty cells are ignored. */
function countConfiguredSeats(config: BusLayoutConfig): number {
  return (
    config.frontPassengers +
    config.rows.reduce(
      (total, row) => total + row.cells.filter((cell) => cell === "S").length,
      0,
    )
  );
}

/**
 * Generic fallback for capacities not yet assigned a real vehicle layout.
 * It always produces exactly the requested capacity and keeps a right-front
 * entrance. Admins can later replace this with the actual body configuration.
 */
function generateLayout(capacity: number): BusLayoutConfig {
  const total = Math.max(0, Math.floor(capacity));

  if (total === 0) {
    return {
      id: "custom-0",
      name: "0-seater",
      vehicleType: "minibus",
      capacity: 0,
      driverSide: "right",
      frontPassengers: 0,
      reference: "Empty fallback layout",
      rows: [],
    };
  }

  const rows: BusRow[] = [];
  let remaining = total;

  // Put the requested right-side entrance at the front.
  if (remaining >= 2) {
    rows.push(r("SS_D"));
    remaining -= 2;
  } else {
    rows.push(r("S"));
    remaining -= 1;
  }

  // Use 2+aisle+1 rows until the final remainder.
  while (remaining >= 3) {
    rows.push(r("SS_S"));
    remaining -= 3;
  }

  if (remaining > 0) {
    rows.push(r("S".repeat(remaining), true));
  }

  return {
    id: `custom-${total}`,
    name: `${total}-seater custom layout`,
    vehicleType:
      total <= 20 ? "minibus" : total <= 40 ? "midibus" : "coach",
    capacity: total,
    driverSide: "right",
    frontPassengers: 0,
    reference: "Generated fallback; replace with actual vehicle configuration",
    rows,
  };
}

export function getBusLayout(capacity: number): BusLayoutConfig {
  const layout =
    BUS_LAYOUTS.find((candidate) => candidate.capacity === capacity) ??
    generateLayout(capacity);

  // Fail loudly during development if a configuration is accidentally edited
  // to contain the wrong number of passenger seats.
  if (countConfiguredSeats(layout) !== layout.capacity) {
    throw new Error(
      `Invalid bus layout "${layout.id}": configured ${countConfiguredSeats(layout)} seats but capacity is ${layout.capacity}.`,
    );
  }

  return layout;
}

export interface ResolvedLayout {
  config: BusLayoutConfig;
  frontSeats: Seat[];
  rows: Array<{
    bench: boolean;
    cells: Array<{ token: CellToken; seat?: Seat }>;
  }>;
  columns: number;
}

/** Turns a configuration into numbered seats. Doors/aisles never receive a seat. */
export function resolveLayout(config: BusLayoutConfig): ResolvedLayout {
  let n = 1;

  const make = (
    row: number,
    side: Seat["side"],
    position: number,
  ): Seat => {
    const number = n++;
    return {
      id: String(number),
      number,
      label: String(number).padStart(2, "0"),
      row,
      side,
      position,
      orientation: "forward",
    };
  };

  const passengerSide: Side =
    config.driverSide === "right" ? "left" : "right";

  const frontSeats = Array.from(
    { length: config.frontPassengers },
    (_, i) => make(0, passengerSide, i),
  );

  const rows = config.rows.map((row, ri) => {
    const aisleAt = row.cells.indexOf("_");

    return {
      bench: !!row.bench,
      cells: row.cells.map((token, ci) =>
        token === "S"
          ? {
              token,
              seat: make(
                ri + 1,
                row.bench || aisleAt < 0
                  ? "center"
                  : ci < aisleAt
                    ? "left"
                    : "right",
                ci,
              ),
            }
          : { token },
      ),
    };
  });

  const columns = Math.max(
    1,
    ...config.rows
      .filter((row) => !row.bench)
      .map((row) => row.cells.length),
  );

  // Keep this invariant explicit so a future configuration cannot silently
  // render a different number of seats than the selected bus advertises.
  if (n - 1 !== config.capacity) {
    throw new Error(
      `Resolved bus layout "${config.id}" produced ${n - 1} seats; expected ${config.capacity}.`,
    );
  }

  return { config, frontSeats, rows, columns };
}
