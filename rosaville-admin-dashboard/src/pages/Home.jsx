import React, { useState, useEffect } from "react";
import usePolling from "@/hooks/use-polling";
import { entities } from '@/lib/api';
import {
  LayoutDashboard, DollarSign, ShoppingBag, Users, Package, AlertTriangle,
  ListTodo, TrendingUp, ArrowUpRight, Cake, Eye, MousePointerClick, Zap
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import FeedbackWidget from "@/components/admin/FeedbackWidget";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend
} from "recharts";

const revenueData = [
  { m: "Feb", revenue: 8200, orders: 42 },
  { m: "Mar", revenue: 9100, orders: 48 },
  { m: "Apr", revenue: 10400, orders: 53 },
  { m: "May", revenue: 9800, orders: 51 },
  { m: "Jun", revenue: 12600, orders: 61 },
  { m: "Jul", revenue: 14200, orders: 68 },
  { m: "Aug", revenue: 13100, orders: 64 },
];

const trafficData = [
  { source: "Instagram", value: 38, color: "#ec4899" },
  { source: "Google", value: 27, color: "#3b82f6" },
  { source: "Direct", value: 18, color: "#10b981" },
  { source: "Facebook", value: 11, color: "#6366f1" },
  { source: "TikTok", value: 6, color: "#f59e0b" },
];

const aiInsights = [
  { icon: TrendingUp, tone: "emerald", title: "Lavender Dream Cake is trending", body: "Sales up 42% this month — consider featuring it on the homepage hero." },
  { icon: AlertTriangle, tone: "amber", title: "Inventory risk: Belgian chocolate", body: "Stock at 18% of capacity with 3 large custom orders scheduled this week." },
  { icon: Users, tone: "blue", title: "Retention opportunity", body: "14 VIP customers haven't ordered in 45+ days. A re-engagement email could recover ~$3,400." },
  { icon: Zap, tone: "violet", title: "Marketing opportunity", body: "Instagram traffic converts 2.3× higher than other channels — boost ad spend there." },
];

const toneMap = {
  emerald: "from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
  amber: "from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400",
  blue: "from-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400",
  violet: "from-violet-500/10 to-violet-500/5 text-violet-600 dark:text-violet-400",
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [desserts, setDesserts] = useState([]);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [o, c, i, d] = await Promise.all([
        entities.Order.list("-created_date", 200),
        entities.Customer.list("-created_date", 200),
        entities.InventoryItem.list("-created_date", 200),
        entities.Dessert.list("-display_order", 200),
      ]);
      setOrders(o); setCustomers(c); setInventory(i); setDesserts(d);
    } catch (e) { console.error(e); }
    if (!silent) setLoading(false);
  };
  useEffect(() => { load(); }, []);
  // Keep dashboard stats/recent orders fresh without a manual page refresh.
  usePolling(() => load(true), 15000);

  const revenueTotal = orders.reduce((s, o) => s + (o.total_value || 0), 0);
  const pendingOrders = orders.filter((o) => ["Pending", "Confirmed", "In Production"].includes(o.status)).length;
  const completedOrders = orders.filter((o) => o.status === "Completed" || o.status === "Delivered").length;
  const vipCustomers = customers.filter((c) => c.segment === "VIP").length;
  const lowStock = inventory.filter((i) => i.current_stock <= i.minimum_stock);
  const inventoryValue = inventory.reduce((s, i) => s + (i.current_stock || 0) * (i.cost_per_unit || 0), 0);
  const recentOrders = orders.slice(0, 6);

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
          <select className="h-9 px-3 rounded-lg border border-border bg-card text-[13px] font-medium outline-none focus:ring-2 focus:ring-ring/40">
            <option>Last 30 days</option>
            <option>This week</option>
            <option>This month</option>
            <option>This year</option>
          </select>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Revenue (Period)" value={`$${revenueTotal.toLocaleString()}`} trend="+18.2%" trendUp icon={DollarSign} accent="emerald" sub={`${orders.length} orders total`} />
        <StatCard label="Orders Today" value={orders.filter(o => new Date(o.delivery_date) >= new Date(Date.now() - 86400000)).length || orders.length} trend="+12.4%" trendUp icon={ShoppingBag} accent="blue" sub={`${pendingOrders} active · ${completedOrders} completed`} />
        <StatCard label="Customers" value={customers.length} trend="+8.1%" trendUp icon={Users} accent="violet" sub={`${vipCustomers} VIP · ${customers.filter(c => c.segment === "New").length} new`} />
        <StatCard label="Inventory Value" value={`$${inventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} trend="-3.2%" trendUp={false} icon={Package} accent="amber" sub={`${lowStock.length} low-stock alerts`} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-heading font-semibold text-[15px]">Revenue & Orders</h3>
              <p className="text-[12px] text-muted-foreground">Last 7 months</p>
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

        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h3 className="font-heading font-semibold text-[15px] mb-1">Traffic Sources</h3>
          <p className="text-[12px] text-muted-foreground mb-3">Visitor acquisition</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={trafficData} dataKey="value" nameKey="source" cx="50%" cy="50%" innerRadius={48} outerRadius={78} paddingAngle={3}>
                {trafficData.map((e) => <Cell key={e.source} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12.5 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {trafficData.map((t) => (
              <div key={t.source} className="flex items-center justify-between text-[12.5px]">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />{t.source}</span>
                <span className="font-semibold">{t.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Website metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Website Visitors" value="4,820" trend="+22%" trendUp icon={Eye} accent="blue" />
        <StatCard label="Conversion Rate" value="3.8%" trend="+0.6pt" trendUp icon={MousePointerClick} accent="emerald" />
        <StatCard label="Bounce Rate" value="38.2%" trend="-4.1pt" trendUp icon={TrendingUp} accent="violet" />
        <StatCard label="Avg. Session" value="3m 42s" trend="+18s" trendUp icon={Zap} accent="amber" />
      </div>

      {/* AI Insights + Recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-1 rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-heading font-semibold text-[15px]">AI Insights</h3>
          </div>
          <div className="space-y-3">
            {aiInsights.map((ins, idx) => (
              <div key={idx} className="flex gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${toneMap[ins.tone]} flex items-center justify-center shrink-0`}>
                  <ins.icon className="w-4 h-4" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-semibold leading-snug">{ins.title}</div>
                  <div className="text-[11.5px] text-muted-foreground leading-relaxed mt-0.5">{ins.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
      </div>

      {/* Bottom row: inventory alerts + team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5">
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

        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <ListTodo className="w-4 h-4 text-blue-500" />
            <h3 className="font-heading font-semibold text-[15px]">Team Performance</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={[
              { name: "Maria", score: 92 }, { name: "James", score: 78 },
              { name: "Emma", score: 85 }, { name: "David", score: 67 },
              { name: "Lisa", score: 88 },
            ]} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11.5, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11.5, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12.5 }} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="#3b82f6" barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Website feedback */}
      <div className="mt-4">
        <FeedbackWidget />
      </div>
    </div>
  );
}