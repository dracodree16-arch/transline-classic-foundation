export const KES = (value: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

export const dateTime = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" }) : "—";

export const dateOnly = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString("en-KE", { dateStyle: "medium" }) : "—";
