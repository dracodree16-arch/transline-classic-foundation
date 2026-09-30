import { ReactNode } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

type TicketField = {
  label: string;
  value: ReactNode;
};

export function PrintTicket({
  title,
  subtitle,
  reference,
  fields,
  instructions,
  footer,
}: {
  title: string;
  subtitle?: string;
  reference: string;
  fields: TicketField[];
  instructions?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="print-ticket overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-border bg-muted/30 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Transline Classic
          </p>
          <h2 className="mt-1 text-xl font-bold">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <Button variant="outline" onClick={() => window.print()} className="print:hidden">
          <Printer className="mr-2 size-4" />
          Print Ticket
        </Button>
      </div>

      <div className="p-5">
        <div className="rounded-xl border-2 border-dashed border-border p-4 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Tracking / Reference</p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-wide">{reference}</p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label} className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground">{field.label}</p>
              <p className="mt-1 break-words font-medium">{field.value || "—"}</p>
            </div>
          ))}
        </div>

        {instructions && (
          <div className="mt-5 rounded-xl bg-muted/40 p-4">
            <p className="text-sm font-semibold">Important instructions</p>
            <div className="mt-2 text-sm text-muted-foreground">{instructions}</div>
          </div>
        )}

        {footer && (
          <div className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
