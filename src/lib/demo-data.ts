/**
 * DEMO DATA — Phase 1 placeholder content for Transline Classic TMS.
 * All figures below are illustrative sample data, not live operational records.
 */

export const KES = (value: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value);

export const branches = [
  { id: "b1", name: "Nairobi CBD", town: "Nairobi", phone: "+254 700 100 101" },
  { id: "b2", name: "Kisii Town", town: "Kisii", phone: "+254 700 100 102" },
  { id: "b3", name: "Oyugis", town: "Oyugis", phone: "+254 700 100 103" },
  { id: "b4", name: "Kisumu", town: "Kisumu", phone: "+254 700 100 104" },
  { id: "b5", name: "Kericho", town: "Kericho", phone: "+254 700 100 105" },
  { id: "b6", name: "Nakuru", town: "Nakuru", phone: "+254 700 100 106" },
];

export const buses = [
  { id: "v1", plate: "KDU 995Y", model: "Isuzu Master", capacity: 49, status: "Active", branch: "Nairobi CBD" },
  { id: "v2", plate: "KDT 567A", model: "Scania Marcopolo", capacity: 51, status: "Active", branch: "Kisii Town" },
  { id: "v3", plate: "KDA 220X", model: "Isuzu FRR", capacity: 44, status: "Maintenance", branch: "Kisumu" },
  { id: "v4", plate: "KCX 781B", model: "Yutong ZK", capacity: 53, status: "Active", branch: "Nakuru" },
  { id: "v5", plate: "KDD 410M", model: "Isuzu Master", capacity: 49, status: "Active", branch: "Kericho" },
];

export const routes = [
  { id: "r1", origin: "Nairobi", destination: "Kisii", fare: 1500, distanceKm: 305, duration: "6h 30m" },
  { id: "r2", origin: "Nairobi", destination: "Kisumu", fare: 1400, distanceKm: 350, duration: "7h 00m" },
  { id: "r3", origin: "Kisii", destination: "Nairobi", fare: 1500, distanceKm: 305, duration: "6h 30m" },
  { id: "r4", origin: "Nakuru", destination: "Kisii", fare: 1200, distanceKm: 210, duration: "4h 20m" },
  { id: "r5", origin: "Kericho", destination: "Nairobi", fare: 1100, distanceKm: 258, duration: "5h 10m" },
  { id: "r6", origin: "Oyugis", destination: "Nairobi", fare: 1600, distanceKm: 330, duration: "7h 15m" },
];

export const trips = [
  { id: "t1", route: "Nairobi → Kisii", bus: "KDU 995Y", departure: "08:30", seats: 49, booked: 32, status: "Scheduled" },
  { id: "t2", route: "Nairobi → Kisumu", bus: "KCX 781B", departure: "11:00", seats: 53, booked: 18, status: "Scheduled" },
  { id: "t3", route: "Kisii → Nairobi", bus: "KDT 567A", departure: "14:15", seats: 51, booked: 44, status: "Boarding" },
  { id: "t4", route: "Kericho → Nairobi", bus: "KDD 410M", departure: "21:30", seats: 49, booked: 9, status: "Scheduled" },
  { id: "t5", route: "Oyugis → Nairobi", bus: "KDA 220X", departure: "22:00", seats: 44, booked: 27, status: "Scheduled" },
];

export const bookings = [
  { ref: "TC-DEMO-0001", passenger: "Wanjiru Kamau", phone: "+254 712 345 601", route: "Nairobi → Kisii", seat: "12", fare: 1500, status: "Paid", agent: "Nairobi CBD" },
  { ref: "TC-DEMO-0002", passenger: "Otieno Ochieng", phone: "+254 712 345 602", route: "Nairobi → Kisii", seat: "13", fare: 1500, status: "Paid", agent: "Nairobi CBD" },
  { ref: "TC-DEMO-0003", passenger: "Chepkoech Rono", phone: "+254 712 345 603", route: "Nairobi → Kisumu", seat: "07", fare: 1400, status: "Pending", agent: "Nairobi CBD" },
  { ref: "TC-DEMO-0004", passenger: "Mercy Nyaboke", phone: "+254 712 345 604", route: "Kisii → Nairobi", seat: "21", fare: 1500, status: "Paid", agent: "Kisii Town" },
  { ref: "TC-DEMO-0005", passenger: "Brian Kiplagat", phone: "+254 712 345 605", route: "Kericho → Nairobi", seat: "03", fare: 1100, status: "Paid", agent: "Kericho" },
  { ref: "TC-DEMO-0006", passenger: "Faith Achieng", phone: "+254 712 345 606", route: "Oyugis → Nairobi", seat: "16", fare: 1600, status: "Cancelled", agent: "Oyugis" },
];

export const parcels = [
  { code: "TCP-DEMO-1001", sender: "Peter Mwangi", receiver: "Jane Moraa", from: "Nairobi CBD", to: "Kisii Town", weight: 1.5, fare: 300, status: "In transit" },
  { code: "TCP-DEMO-1002", sender: "Alice Atieno", receiver: "Samuel Kariuki", from: "Kisumu", to: "Nairobi CBD", weight: 8, fare: 1200, status: "Booked" },
  { code: "TCP-DEMO-1003", sender: "Grace Wairimu", receiver: "Dennis Omondi", from: "Nakuru", to: "Oyugis", weight: 25, fare: 900, status: "Delivered" },
  { code: "TCP-DEMO-1004", sender: "Kevin Barasa", receiver: "Lilian Kerubo", from: "Kericho", to: "Nairobi CBD", weight: 3.2, fare: 450, status: "In transit" },
];

export const expenses = [
  { id: "e1", branch: "Nairobi CBD", category: "Fuel", description: "Diesel top-up KDU 995Y", amount: 18500, date: "Today" },
  { id: "e2", branch: "Kisii Town", category: "Maintenance", description: "Brake pads replacement", amount: 7400, date: "Yesterday" },
  { id: "e3", branch: "Kisumu", category: "Office", description: "Branch airtime & stationery", amount: 2300, date: "2 days ago" },
];

export const staff = [
  { id: "s1", name: "Andrew Waweru", role: "Super Admin", branch: "Head Office", phone: "+254 711 000 001", status: "Active" },
  { id: "s2", name: "Caroline Nekesa", role: "Administrator", branch: "Nairobi CBD", phone: "+254 711 000 002", status: "Active" },
  { id: "s3", name: "Joseph Mutiso", role: "Manager", branch: "Kisii Town", phone: "+254 711 000 003", status: "Active" },
  { id: "s4", name: "Everlyne Kwamboka", role: "Booking Agent", branch: "Oyugis", phone: "+254 711 000 004", status: "Active" },
  { id: "s5", name: "Dennis Kiprop", role: "Dispatcher", branch: "Kericho", phone: "+254 711 000 005", status: "Active" },
  { id: "s6", name: "Sylvia Adhiambo", role: "Parcel Staff", branch: "Kisumu", phone: "+254 711 000 006", status: "On leave" },
  { id: "s7", name: "Martin Njoroge", role: "Finance Staff", branch: "Head Office", phone: "+254 711 000 007", status: "Active" },
  { id: "s8", name: "Purity Chelangat", role: "Branch Staff", branch: "Nakuru", phone: "+254 711 000 008", status: "Active" },
];

export const revenueSeries = [
  { day: "Mon", tickets: 182000, parcels: 34000 },
  { day: "Tue", tickets: 164500, parcels: 28500 },
  { day: "Wed", tickets: 210300, parcels: 41200 },
  { day: "Thu", tickets: 198700, parcels: 36800 },
  { day: "Fri", tickets: 264100, parcels: 52400 },
  { day: "Sat", tickets: 289600, parcels: 47900 },
  { day: "Sun", tickets: 221400, parcels: 30100 },
];

export const alerts = [
  { id: "n1", title: "Bus KDA 220X in maintenance", message: "Kisumu workshop — expected back Friday.", type: "warning", time: "12 min ago" },
  { id: "n2", title: "Kisii 14:15 trip almost full", message: "44 of 51 seats sold.", type: "info", time: "40 min ago" },
  { id: "n3", title: "Pending payments", message: "7 bookings awaiting M-Pesa confirmation.", type: "alert", time: "1 hr ago" },
  { id: "n4", title: "Cash forward submitted", message: "Nakuru branch forwarded KES 84,200.", type: "success", time: "3 hrs ago" },
];

export const dashboardStats = [
  { key: "bookings", label: "Today's Bookings", value: "148", delta: "+12% vs yesterday" },
  { key: "revenue", label: "Today's Revenue", value: KES(264100), delta: "+8% vs yesterday" },
  { key: "buses", label: "Available Buses", value: "18", delta: "3 in maintenance" },
  { key: "trips", label: "Active Trips", value: "11", delta: "4 departing soon" },
  { key: "parcels", label: "Parcels", value: "63", delta: "9 awaiting collection" },
  { key: "pending", label: "Pending Payments", value: KES(38700), delta: "7 transactions" },
];
