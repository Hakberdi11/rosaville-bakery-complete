import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag, Users, Cake, Image, FileText, Inbox,
  Package, Factory, ChefHat, Megaphone, UserCog, ListTodo,
  Bell, FileBarChart, Settings, ScrollText, TrendingUp, Moon, Sun,
  Menu, Search, LogOut, Sparkles, Users2, Gift, Truck, ClipboardList, Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { entities } from "@/lib/api";
import { StatusBadge } from "@/components/admin/PageHeader";
import usePolling from "@/hooks/use-polling";

// Roles: admin (full), manager (operations), employee (tasks + production only)
const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", path: "/", icon: LayoutDashboard, roles: ["admin", "manager", "employee"] },
      { label: "Analytics", path: "/analytics", icon: TrendingUp, roles: ["admin", "manager"] },
      { label: "Reports", path: "/reports", icon: FileBarChart, roles: ["admin", "manager"] },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Orders", path: "/orders", icon: ShoppingBag, roles: ["admin", "manager"] },
      { label: "Custom Cake Orders", path: "/custom-cake-orders", icon: Cake, roles: ["admin", "manager"] },
      { label: "Gift Cards", path: "/gift-cards", icon: Gift, roles: ["admin", "manager"] },
      { label: "Customers", path: "/customers", icon: Users, roles: ["admin", "manager"] },
      { label: "Contact Requests", path: "/contact", icon: Inbox, roles: ["admin", "manager"] },
    ],
  },
  {
    label: "Catalog",
    items: [
      { label: "Desserts", path: "/desserts", icon: Cake, roles: ["admin", "manager", "employee"] },
      { label: "Gallery", path: "/gallery", icon: Image, roles: ["admin", "manager"] },
      { label: "Special of the Month", path: "/special-of-month", icon: Sparkles, roles: ["admin", "manager"] },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Inventory", path: "/inventory", icon: Package, roles: ["admin", "manager"] },
      { label: "Suppliers", path: "/suppliers", icon: Truck, roles: ["admin", "manager"] },
      { label: "Purchase Orders", path: "/purchase-orders", icon: ClipboardList, roles: ["admin", "manager"] },
      { label: "Production", path: "/production", icon: Factory, roles: ["admin", "manager", "employee"] },
      { label: "Recipes", path: "/recipes", icon: ChefHat, roles: ["admin", "manager"] },
    ],
  },
  {
    label: "Team",
    items: [
      { label: "Employees", path: "/employees", icon: UserCog, roles: ["admin"] },
      { label: "Tasks", path: "/tasks", icon: ListTodo, roles: ["admin", "manager", "employee"] },
    ],
  },
  {
    label: "Growth",
    items: [
      { label: "Marketing", path: "/marketing", icon: Megaphone, roles: ["admin", "manager"] },
      { label: "Newsletter", path: "/newsletter", icon: Mail, roles: ["admin", "manager"] },
      { label: "Website CMS", path: "/cms", icon: FileText, roles: ["admin", "manager"] },
      { label: "Team Page", path: "/team", icon: Users2, roles: ["admin", "manager"] },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Notifications", path: "/notifications", icon: Bell, roles: ["admin", "manager", "employee"] },
      { label: "Audit Logs", path: "/audit-logs", icon: ScrollText, roles: ["admin"] },
      { label: "Loyalty Program", path: "/loyalty", icon: Gift, roles: ["admin"] },
      { label: "Settings", path: "/settings", icon: Settings, roles: ["admin"] },
    ],
  },
];

function normalizeRole(role) {
  return role === "admin" ? "admin" : role === "manager" ? "manager" : "employee";
}

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("rv-theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("rv-theme", dark ? "dark" : "light");
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// No backend notification/read-state model exists, so there's no real
// "unread count" to show. Instead the bell dot reflects whether there's
// any actual attention-worthy state right now (mirrors Notifications.jsx's
// own event conditions) rather than always showing on regardless of data.
function useHasAlerts() {
  const [hasAlerts, setHasAlerts] = useState(false);

  const check = () => {
    Promise.all([
      entities.InventoryItem.list("-created_date", 500),
      entities.ContactRequest.list("-created_date", 20),
      entities.Order.list("-created_date", 20),
    ])
      .then(([inventory, contacts, orders]) => {
        const lowStock = inventory.some((i) => i.current_stock <= i.minimum_stock);
        const newContacts = contacts.some((c) => c.status === "New");
        const recentOrder = orders.some((o) => o.created_at && Date.now() - new Date(o.created_at).getTime() <= 86400000);
        setHasAlerts(lowStock || newContacts || recentOrder);
      })
      .catch(() => {});
  };

  useEffect(() => { check(); }, []);
  usePolling(check, 30000);

  return hasAlerts;
}

function RecentOrderWidget() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => entities.Order.list("-created_date", 1).then((orders) => setOrder(orders[0] || null)).catch(() => {});

  useEffect(() => {
    let cancelled = false;
    entities.Order.list("-created_date", 1)
      .then((orders) => { if (!cancelled) setOrder(orders[0] || null); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  // Mounted on every page via Layout — polling here surfaces new orders
  // app-wide without needing a manual refresh.
  usePolling(load, 15000);

  if (loading || !order) return null;

  return (
    <NavLink
      to="/orders"
      className="block rounded-xl border border-border/60 bg-card p-3.5 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">Most Recent Order</span>
        <StatusBadge status={order.status} />
      </div>
      <div className="text-[13px] font-semibold truncate">{order.customer_name || "Unnamed customer"}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">
        ${Number(order.total_value || 0).toFixed(2)} · {timeAgo(order.created_at)}
      </div>
    </NavLink>
  );
}

function SidebarContent({ role, onNavigate }) {
  const visibleGroups = navGroups
    .map((g) => ({ ...g, items: g.items.filter((it) => it.roles.includes(role)) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border/60">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-sm">
          <Cake className="w-[18px] h-[18px] text-white" strokeWidth={2.2} />
        </div>
        <div className="leading-tight">
          <div className="font-heading font-semibold text-[15px] tracking-tight">Rosaville</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Desserts OS</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )
                  }
                >
                  <item.icon className="w-[17px] h-[17px] shrink-0" strokeWidth={2} />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-border/60 p-4">
        <RecentOrderWidget />
      </div>
    </div>
  );
}

function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSearch = async (q) => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    try {
      const [orders, customers, desserts] = await Promise.all([
        entities.Order.list("-created_date", 200),
        entities.Customer.list("-created_date", 200),
        entities.Dessert.list("-display_order", 200),
      ]);
      const term = q.toLowerCase();
      setResults({
        orders: orders.filter((o) => o.customer_name?.toLowerCase().includes(term) || o.order_number?.toLowerCase().includes(term) || o.email?.toLowerCase().includes(term)).slice(0, 5),
        customers: customers.filter((c) => c.name?.toLowerCase().includes(term) || c.email?.toLowerCase().includes(term)).slice(0, 5),
        desserts: desserts.filter((d) => d.name?.toLowerCase().includes(term)).slice(0, 5),
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    const id = setTimeout(() => runSearch(query), 250);
    return () => clearTimeout(id);
  }, [query]);

  const goTo = (path) => {
    setQuery("");
    setResults(null);
    navigate(path);
  };

  const hasResults = results && (results.orders.length || results.customers.length || results.desserts.length);

  return (
    <div className="relative w-full">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => setTimeout(() => setResults(null), 150)}
        placeholder="Search orders, customers, products…"
        className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted/60 text-[13px] outline-none focus:bg-muted focus:ring-2 focus:ring-ring/40 transition"
      />
      {query.trim() && results && (
        <div className="absolute top-11 left-0 w-full max-w-md rounded-xl border border-border/60 bg-card shadow-lg z-40 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-[12.5px] text-muted-foreground text-center">Searching…</div>
          ) : !hasResults ? (
            <div className="p-4 text-[12.5px] text-muted-foreground text-center">No matches for "{query}"</div>
          ) : (
            <div className="py-1.5">
              {results.orders.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground/70">Orders</div>
                  {results.orders.map((o) => (
                    <button key={o.id} onMouseDown={() => goTo("/orders")} className="w-full text-left px-3 py-2 text-[13px] hover:bg-muted/50">
                      {o.order_number || `#${String(o.id).slice(-6)}`} — {o.customer_name}
                    </button>
                  ))}
                </div>
              )}
              {results.customers.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground/70">Customers</div>
                  {results.customers.map((c) => (
                    <button key={c.id} onMouseDown={() => goTo("/customers")} className="w-full text-left px-3 py-2 text-[13px] hover:bg-muted/50">
                      {c.name} {c.email ? `— ${c.email}` : ""}
                    </button>
                  ))}
                </div>
              )}
              {results.desserts.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground/70">Desserts</div>
                  {results.desserts.map((d) => (
                    <button key={d.id} onMouseDown={() => goTo("/desserts")} className="w-full text-left px-3 py-2 text-[13px] hover:bg-muted/50">
                      {d.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dark, toggle } = useDarkMode();
  const { user, logout } = useAuth();
  const location = useLocation();
  const hasAlerts = useHasAlerts();
  const role = normalizeRole(user?.role);
  const roleLabel = role === "admin" ? "Admin" : role === "manager" ? "Manager" : "Employee";
  const initials = (user?.full_name || user?.email || "?").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="hidden lg:flex w-[252px] shrink-0 flex-col border-r border-border/60 bg-sidebar sticky top-0 h-screen">
        <SidebarContent role={role} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 w-[260px] bg-sidebar border-r border-border/60 lg:hidden"
            >
              <SidebarContent role={role} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 lg:px-7 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
            <GlobalSearch />
          </div>
          <div className="flex-1 md:hidden" />
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {dark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </Button>
            <Button variant="ghost" size="icon" className="relative" onClick={() => (window.location.href = "/notifications")}>
              <Bell className="w-[18px] h-[18px]" />
              {hasAlerts && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />}
            </Button>
            <div className="w-px h-6 bg-border mx-1.5 hidden sm:block" />
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-[12px] font-semibold">
                {initials}
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="text-[12.5px] font-semibold">{user?.full_name || user?.email?.split("@")[0] || "User"}</div>
                <div className="text-[10.5px] text-muted-foreground">{roleLabel}</div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => logout()} aria-label="Sign out">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0">
          <div key={location.pathname} className="animate-in fade-in duration-300">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}