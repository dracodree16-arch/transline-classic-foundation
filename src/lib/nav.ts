import {
  LayoutDashboard,
  Ticket,
  Bus,
  Map,
  Package,
  Wallet,
  BarChart3,
  Scale,
  Users,
  Settings,
  CalendarClock,
  ShieldCheck,
} from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
  children?: { title: string; url: string; adminOnly?: boolean }[];
};

export const navItems: NavItem[] = [
  { title: "Admin Console", url: "/admin", icon: ShieldCheck, adminOnly: true },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  {
    title: "Bookings",
    url: "/bookings",
    icon: Ticket,
    children: [
      { title: "All Bookings", url: "/bookings" },
      { title: "New Booking", url: "/bookings/new" },
      { title: "Manifest", url: "/bookings/manifest" },
      { title: "Bus Dispatch", url: "/bookings/dispatch" },
    ],
  },
  {
    title: "Trips",
    url: "/trips",
    icon: CalendarClock,
    children: [
      { title: "All Trips", url: "/trips" },
      { title: "Create Trip", url: "/trips/new", adminOnly: true },
    ],
  },
  {
    title: "Fleet",
    adminOnly: true,
    url: "/fleet",
    icon: Bus,
    children: [
      { title: "All Buses", url: "/fleet" },
      { title: "Add Bus", url: "/fleet/new" },
    ],
  },
  {
    title: "Routes",
    adminOnly: true,
    url: "/routes",
    icon: Map,
    children: [
      { title: "All Routes", url: "/routes" },
      { title: "Add Route", url: "/routes/new" },
    ],
  },
  {
    title: "Parcels",
    url: "/parcels",
    icon: Package,
    children: [
      { title: "All Parcels", url: "/parcels" },
      { title: "Book Parcel", url: "/parcels/new" },
      { title: "Loading Sheet", url: "/parcels/loading-sheet" },
      { title: "Parcel Tracking", url: "/parcels/tracking" },
    ],
  },
  {
    title: "Finance",
    adminOnly: true,
    url: "/finance",
    icon: Wallet,
    children: [
      { title: "Financial Overview", url: "/finance" },
      { title: "Cash Forward", url: "/finance/cash-forward" },
      { title: "Expenses", url: "/finance/expenses" },
      { title: "Banking", url: "/finance/banking" },
      { title: "Cash Received", url: "/finance/cash-received" },
      { title: "Mobile Money", url: "/finance/mobile-money" },
      { title: "Statements", url: "/finance/statements" },
    ],
  },
  {
    title: "Reports",
    adminOnly: true,
    url: "/reports",
    icon: BarChart3,
    children: [
      { title: "Ticket Sales", url: "/reports/ticket-sales" },
      { title: "Parcel Sales", url: "/reports/parcel-sales" },
      { title: "Revenue", url: "/reports/revenue" },
      { title: "Expenses", url: "/reports/expenses" },
      { title: "Branch Reports", url: "/reports/branches" },
    ],
  },
  { title: "Reconciliation", url: "/reconciliation", icon: Scale, adminOnly: true },
  {
    title: "Staff",
    adminOnly: true,
    url: "/admin/staff",
    icon: Users,
    children: [
      { title: "Clerks", url: "/admin/staff" },
      { title: "Add Clerk", url: "/admin/staff/new" },
      { title: "Roles & Permissions", url: "/admin/staff/roles" },
    ],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    children: [
      { title: "Profile", url: "/settings/profile" },
      { title: "System Settings", url: "/settings/system", adminOnly: true },
    ],
  },
];

export const APP_ROLES = [
  { value: "super_admin", label: "Super Admin", description: "Full system control, including security and configuration." },
  { value: "administrator", label: "Administrator", description: "Manages branches, staff, fleet and operations." },
  { value: "manager", label: "Manager", description: "Oversees branch performance, reports and approvals." },
  { value: "booking_agent", label: "Booking Agent", description: "Sells tickets and manages passenger bookings." },
  { value: "dispatcher", label: "Dispatcher", description: "Manages trips, manifests and bus dispatch." },
  { value: "parcel_staff", label: "Parcel Staff", description: "Handles parcel booking, loading and delivery." },
  { value: "finance_staff", label: "Finance Staff", description: "Handles cash, banking, expenses and reconciliation." },
  { value: "branch_staff", label: "Branch Staff", description: "General branch operations with limited access." },
] as const;

export const roleLabel = (role?: string | null) =>
  APP_ROLES.find((r) => r.value === role)?.label ?? "Branch Staff";

export function visibleNavItems(role: "admin" | "clerk"): NavItem[] {
  if (role === "admin") return navItems;
  return navItems
    .filter((item) => !item.adminOnly)
    .map((item) =>
      item.children
        ? { ...item, children: item.children.filter((c) => !c.adminOnly) }
        : item,
    );
}
