import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function DemoNotice({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
      <Badge variant="secondary" className="uppercase tracking-wide">
        Demo data
      </Badge>
      <span>{children ?? "Sample content for Phase 1. Live functionality arrives in a later phase."}</span>
    </div>
  );
}

export function SectionCard({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className} style={{ boxShadow: "var(--shadow-card)" }}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function Page({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 md:p-6">
      <PageHeader title={title} description={description} actions={actions} />
      {children}
    </div>
  );
}
