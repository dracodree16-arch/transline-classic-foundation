import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Search, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export function AppTopbar({
  email,
  role,
  branch,
}: {
  email: string;
  role: string;
  branch?: string | null;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [alerts, setAlerts] = useState<Array<{ id: string; title: string; message: string | null }>>([]);

  useEffect(() => {
    let active = true;
    void supabase
      .from("notifications")
      .select("id, title, message")
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (active) setAlerts(data ?? []);
      });
    return () => {
      active = false;
    };
  }, []);

  const initials = email.slice(0, 2).toUpperCase();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-card/90 px-3 backdrop-blur md:px-6">
      <SidebarTrigger />

      <div className="relative ml-1 hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search bookings, parcels, trips…"
          className="h-10 rounded-xl border-border bg-secondary/60 pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-1 md:gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search">
          <Search className="size-4" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="size-4" />
               {alerts.length > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="border-b border-border px-4 py-3 text-sm font-semibold">Notifications</div>
            <ul className="max-h-80 divide-y divide-border overflow-y-auto">
              {alerts.map((a) => (
                <li key={a.id} className="px-4 py-3">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.message}</p>
                </li>
              ))}
              {alerts.length === 0 && <li className="px-4 py-5 text-sm text-muted-foreground">No new notifications.</li>}
            </ul>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-secondary">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block max-w-[160px] truncate text-sm font-medium">{email}</span>
                <span className="mt-0.5 flex items-center gap-1">
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-medium">
                    {role}
                  </Badge>
                  {branch && (
                    <Badge variant="outline" className="h-4 px-1.5 text-[10px] font-medium">
                      {branch}
                    </Badge>
                  )}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings/profile">
                <User className="mr-2 size-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut}>
              <LogOut className="mr-2 size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
