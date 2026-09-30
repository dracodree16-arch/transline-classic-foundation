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
  const handlePrint = () => window.print();

  return (
    <div className="print-ticket">
      <div className="print-ticket-screen">
        <div className="flex items-start justify-between gap-4 border-b border-border bg-muted/30 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Transline Classic</p>
            <h2 className="mt-1 text-xl font-bold">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 size-4" />
            Print Ticket
          </Button>
        </div>
      </div>

      <div className="thermal-ticket">
        <header className="ticket-header">
          <div className="ticket-brand">TRANSLINE CLASSIC</div>
          <div className="ticket-type">{title}</div>
          {subtitle && <div className="ticket-subtitle">{subtitle}</div>}
        </header>
        <div className="ticket-reference">
          <div className="ticket-label">REFERENCE</div>
          <div className="ticket-reference-value">{reference}</div>
        </div>
        <div className="ticket-fields">
          {fields.map((field) => (
            <div className="ticket-row" key={field.label}>
              <span className="ticket-label">{field.label}</span>
              <span className="ticket-value">{field.value || "—"}</span>
            </div>
          ))}
        </div>
        {instructions && (
          <div className="ticket-instructions">
            <div className="ticket-label">IMPORTANT</div>
            <div>{instructions}</div>
          </div>
        )}
        {footer && <div className="ticket-footer">{footer}</div>}
      </div>
    </div>
  );
}
