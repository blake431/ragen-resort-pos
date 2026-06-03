import {
  BarChart3,
  CreditCard,
  Users,
  Package,
  ArrowLeftRight,
  BedDouble,
  TrendingUp,
  Receipt,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

export type ReportModuleId =
  | "sales"
  | "payment"
  | "cashier"
  | "inventory"
  | "stock-movement"
  | "occupancy"
  | "profit"
  | "expense"
  | "product-performance";

export type ReportModule = {
  id: ReportModuleId;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const REPORT_MODULES: ReportModule[] = [
  {
    id: "sales",
    title: "Sales Report",
    description: "Revenue trends, category mix, top products, and order detail.",
    icon: BarChart3,
  },
  {
    id: "payment",
    title: "Payment Method Report",
    description: "Cash, M-Pesa, card, and bank totals with method breakdown.",
    icon: CreditCard,
  },
  {
    id: "cashier",
    title: "Cashier Performance Report",
    description: "Sales and orders per cashier with payment split.",
    icon: Users,
  },
  {
    id: "inventory",
    title: "Inventory Report",
    description: "Stock levels, low-stock alerts, and value by category.",
    icon: Package,
  },
  {
    id: "stock-movement",
    title: "Stock Movement Report",
    description: "Inventory adjustments and movements in the selected period.",
    icon: ArrowLeftRight,
  },
  {
    id: "occupancy",
    title: "Room Occupancy Report",
    description: "Room status, bookings, and room-attributed revenue.",
    icon: BedDouble,
  },
  {
    id: "profit",
    title: "Profit Report",
    description: "Revenue, COGS, expenses, and net profit summary.",
    icon: TrendingUp,
  },
  {
    id: "expense",
    title: "Expense Report",
    description: "Operating expenses logged in the selected period.",
    icon: Receipt,
  },
  {
    id: "product-performance",
    title: "Product Performance Report",
    description: "Units sold, revenue, cost, and margin by product.",
    icon: ShoppingBag,
  },
];

export function getDateRangeLabel(
  filter: string,
  customStart?: string,
  customEnd?: string
): string {
  switch (filter) {
    case "today":
      return "Today";
    case "week":
      return "This Week";
    case "month":
      return "This Month";
    case "custom":
      if (customStart && customEnd) return `${customStart} to ${customEnd}`;
      return "Custom range";
    default:
      return filter;
  }
}
