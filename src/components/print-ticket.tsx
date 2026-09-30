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
    <div className="print-ticket mx-auto w-full max-w-[380px] overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-dashed border-border px-4 py-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
            TRANSLINE CLASSIC
          </p>
          <h2 className="mt-1 text-lg font-black leading-tight">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-xs font-medium text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="shrink-0 print:hidden"
        >
          <Printer className="mr-1.5 size-4" />
          Print
        </Button>
      </div>

      <div className="px-4 py-4">
        <div className="rounded-xl border border-border px-3 py-3 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            BOOKING REF
          </p>
          <p className="mt-1 font-mono text-xl font-black tracking-wider">{reference}</p>
        </div>

        <div className="mt-4 space-y-2.5">
          {fields.slice(0, 7).map((field) => (
            <div
              key={field.label}
              className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2 last:border-0"
            >
              <span className="shrink-0 text-[10px] font-semibold uppercase text-muted-foreground">
                {field.label}
              </span>
              <span className="min-w-0 text-right text-xs font-bold leading-tight">
                {field.value || "—"}
              </span>
            </div>
          ))}
        </div>

        {instructions && (
          <div className="mt-3 border-t border-dashed border-border pt-3 text-center">
            <p className="text-[10px] font-semibold">{instructions}</p>
          </div>
        )}

        {footer && (
          <div className="mt-3 border-t border-border pt-3 text-center text-[8px] leading-tight text-muted-foreground">
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 3mm;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
          }

          body * {
            visibility: hidden !important;
          }

          .print-ticket,
          .print-ticket * {
            visibility: visible !important;
          }

          .print-ticket {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 74mm !important;
            max-width: 74mm !important;
            margin: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            font-family: Arial, sans-serif !important;
          }

          .print-ticket button {
            display: none !important;
          }

          .print-ticket .border-b,
          .print-ticket .border-t {
            border-color: #000 !important;
          }
        }
      `}</style>
    </div>
  );
}
