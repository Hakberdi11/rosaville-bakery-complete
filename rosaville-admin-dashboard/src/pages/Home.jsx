import React, { useState, useEffect, useMemo } from "react";
import usePolling from "@/hooks/use-polling";
import { entities } from '@/lib/api';
import {
  LayoutDashboard, DollarSign, ShoppingBag, Users, Package, AlertTriangle,
  ListTodo, ArrowUpRight
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import FeedbackWidget from "@/components/admin/FeedbackWidget";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from "recharts";

const PERIODS = {
  "Last 30 days": 30,
  "This week": 7,
  "This month": 30,
  "This year": 365,
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [desserts, setDesserts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [period, setPeriod] = useState("Last 30 days");

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [o, c, i, d, t] = await Promise.all([
        entities.Order.list("-created_date", 500),
        entities.Customer.list("-created_date", 200),
        entities.InventoryItem.list("-created_date", 200),
        entities.Dessert.list("-display_order", 200),
        entities.Task.list("-created_date", 200),
      ]);
      setOrders(o); setCustomers(c); setInventory(i); setDesserts(d); setTasks(t);
    } catch (e) { console.error(e); }
    if (!silent) setLoading(false);
  };
  useEffect(() => { load(); }, []);
  // Keep dashboard stats/recent orders fresh without a manual page refresh.
  usePolling(() => load(true), 15000);

  const periodOrders = useMemo(() => {
    const days = PERIODS[period];
    const cutoff = Date.now() - days * 86400000;
    return orders.filter((o) => o.created_at && new Date(o.created_at).getTime() >= cutoff);
  }, [orders, period]);

  const revenueTotal = periodOrders.reduce((s, o) => s + (o.total_value || 0), 0);
  const pendingOrders = periodOrders.filter((o) => ["Pending", "Confirmed", "In Production"].includes(o.status)).length;
  const completedOrders = periodOrders.filter((o) => o.status === "Completed" || o.status === "Delivered").length;
  const vipCustomers = customers.filter((c) => c.segment === "VIP").length;
  const lowStock = inventory.filter((i) => i.current_stock <= i.minimum_stock);
  const inventoryValue = inventory.reduce((s, i) => s + (i.current_stock || 0) * (i.cost_per_unit || 0), 0);
  const recentOrders = orders.slice(0, 6);

  // Real revenue/order trend for the last 6 months, derived from actual order dates.
  const revenueData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let idx = 5; idx >= 0; idx--) {
      const d = new Date(now.getFullYear(), now.getMonth() - idx, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, m: d.toLocaleString(undefined, { month: "short" }), revenue: 0, orders: 0 });
    }
    const byKey = Object.fromEntries(months.map((m) => [m.key, m]));
    orders.forEach((o) => {
      if (!o.created_at) return;
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = byKey[key];
      if (bucket) { bucket.revenue += o.total_value || 0; bucket.orders += 1; }
    });
    return months;
  }, [orders]);

  // Real task-completion rate per assignee, replaces the old fake "Team Performance" chart.
  const teamPerformance = useMemo(() => {
    const byAssignee = {};
    tasks.forEach((t) => {
      const name = t.assigned_to_name;
      if (!name) return;
      if (!byAssignee[name]) byAssignee[name] = { name, total: 0, completed: 0 };
      byAssignee[name].total += 1;
      if (t.status === "Completed") byAssignee[name].completed += 1;
    });
    return Object.values(byAssignee).map((e) => ({ name: e.name, score: Math.round((e.completed / e.total) * 100) }));
  }, [tasks]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground mb-1.5">
            <LayoutDashboard className="w-3.5 h-3.5" /> Executive Overview
          </div>
          <h1 className="text-[26px] sm:text-[30px] font-heading font-semibold tracking-tight leading-tight">
            Welcome back, <span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">Rosaville</span>
          </h1>
          <p className="text-[13.5px] text-muted-foreground mt-1">Here's how your bakery is performing today.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-card text-[13px] font-medium outline-none focus:ring-2 focus:ring-ring/40"
          >
            {Object.keys(PERIODS).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Revenue (Period)" value={`$${revenueTotal.toLocaleString()}`} icon={DollarSign} accent="emerald" sub={`${periodOrders.length} orders in period`} />
        <StatCard label="Orders Today" value={orders.filter(o => o.created_at && new Date(o.created_at) >= new Date(Date.now() - 86400000)).length} icon={ShoppingBag} accent="blue" sub={`${pendingOrders} active · ${completedOrders} completed`} />
        <StatCard label="Customers" value={customers.length} icon={Users} accent="violet" sub={`${vipCustomers} VIP · ${customers.filter(c => c.segment === "New").length} new`} />
        <StatCard label="Inventory Value" value={`$${inventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={Package} accent="amber" sub={`${lowStock.length} low-stock alerts`} />
      </div>

      {/* Revenue chart */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-heading font-semibold text-[15px]">Revenue & Orders</h3>
              <p className="text-[12px] text-muted-foreground">Last 6 months</p>
            </div>
            <div className="flex items-center gap-3 text-[11.5px]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Orders</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ord" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
              <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fontSize: 11.5, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11.5, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12.5 }} />
              <Area type="monotone" dataKey="revenue" stroke="#f43f5e" strokeWidth={2.5} fill="url(#rev)" />
              <Area type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} fill="url(#ord)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-[15px]">Recent Orders</h3>
            <a href="/orders" className="text-[12px] font-medium text-primary hover:underline flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></a>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-[13px] text-muted-foreground py-8 text-center">No orders yet — create your first order.</div>
          ) : (
            <div className="space-y-1">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/40 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500/15 to-amber-500/15 flex items-center justify-center text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                    {o.customer_name?.split(" ").map(n => n[0]).slice(0,2).join("") || "—"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{o.customer_name}</div>
                    <div className="text-[11.5px] text-muted-foreground">{o.order_number || `#${String(o.id).slice(-6)}`}</div>
                  </div>
                  <span className="text-[13px] font-semibold tabular-nums">${(o.total_value || 0).toFixed(0)}</span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap">{o.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1 rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-heading font-semibold text-[15px]">Low Stock Alerts</h3>
            </div>
            <a href="/inventory" className="text-[12px] font-medium text-primary hover:underline">Manage</a>
          </div>
          {lowStock.length === 0 ? (
            <div className="text-[13px] text-muted-foreground py-6 text-center">All ingredients are well stocked.</div>
          ) : (
            <div className="space-y-2">
              {lowStock.slice(0, 5).map((i) => (
                <div key={i.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{i.name}</div>
                    <div className="h-1.5 rounded-full bg-muted mt-1.5 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500" style={{ width: `${Math.max(8, (i.current_stock / Math.max(i.minimum_stock * 2, 1)) * 100)}%` }} />
                    </div>
                  </div>
                  <span className="text-[12px] font-semibold tabular-nums text-rose-600 dark:text-rose-400 whitespace-nowrap">{i.current_stock}{i.unit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Team performance (real, derived from Task completion rates) */}
      <div className="grid grid-cols-1 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <ListTodo className="w-4 h-4 text-blue-500" />
            <h3 className="font-heading font-semibold text-[15px]">Team Task Completion</h3>
          </div>
          {teamPerformance.length === 0 ? (
            <div className="text-[13px] text-muted-foreground py-6 text-center">No tasks assigned yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={teamPerformance} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11.5, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11.5, fill: "hsl(var(--muted-foreground))" }} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12.5 }} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} formatter={(v) => `${v}%`} />
                <Bar dataKey="score" name="Completion rate" radius={[6, 6, 0, 0]} fill="#3b82f6" barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Website feedback */}
      <div className="mt-4">
        <FeedbackWidget />
      </div>
    </div>
  );
}
