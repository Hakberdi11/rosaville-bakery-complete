import React, { useState, useEffect, useMemo } from "react";
import { entities } from '@/lib/api';
import { TrendingUp, DollarSign, ShoppingBag, Users, Star } from "lucide-react";
import PageHeader, { EmptyState } from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

export default function Analytics() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [desserts, setDesserts] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [o, c, d, f] = await Promise.all([
        entities.Order.list("-created_date", 1000),
        entities.Customer.list("-created_date", 500),
        entities.Dessert.list("-display_order", 500),
        entities.Feedback.list("-created_date", 500),
      ]);
      setOrders(o); setCustomers(c); setDesserts(d); setFeedback(f);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const revenueByMonth = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const d = o.delivery_date ? new Date(o.delivery_date) : new Date(o.created_at);
      if (!d) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      map[key] = (map[key] || 0) + (o.total_value || 0);
    });
    return Object.entries(map).sort().slice(-8).map(([k, v]) => {
      const [, m] = k.split("-");
      return { m: MONTHS[Number(m)], revenue: v };
    });
  }, [orders]);

  const statusBreakdown = useMemo(() => {
    const map = {};
    orders.forEach((o) => { map[o.status] = (map[o.status] || 0) + 1; });
    const colors = { Pending: "#f59e0b", Confirmed: "#3b82f6", "In Production": "#8b5cf6", Ready: "#06b6d4", Delivered: "#14b8a6", Completed: "#10b981", Cancelled: "#f43f5e", Refunded: "#64748b" };
    return Object.entries(map).map(([name, value]) => ({ name, value, color: colors[name] || "#94a3b8" }));
  }, [orders]);

  const topDesserts = useMemo(() => {
    const map = {};
    orders.forEach((o) => (o.items || []).forEach((it) => {
      map[it.name] = (map[it.name] || 0) + (it.quantity || 1);
    }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, qty]) => ({ name, qty }));
  }, [orders]);

  const segmentData = useMemo(() => {
    const map = { New: 0, Regular: 0, VIP: 0, "At Risk": 0 };
    customers.forEach((c) => { if (map[c.segment] !== undefined) map[c.segment]++; });
    const colors = { New: "#10b981", Regular: "#3b82f6", VIP: "#f59e0b", "At Risk": "#f43f5e" };
    return Object.entries(map).map(([name, value]) => ({ name, value, color: colors[name] }));
  }, [customers]);

  const totalRevenue = orders.reduce((s, o) => s + (o.total_value || 0), 0);
  const avgOrder = orders.length ? totalRevenue / orders.length : 0;
  const avgRating = feedback.length ? (feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.length).toFixed(1) : "—";

  if (loading) return <div className="p-12 flex justify-center"><div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader title="Analytics" description="Revenue trends, product performance & customer insights." icon={TrendingUp} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} accent="emerald" />
        <StatCard label="Avg Order Value" value={`$${avgOrder.toFixed(2)}`} icon={ShoppingBag} accent="blue" />
        <StatCard label="Customers" value={customers.length} icon={Users} accent="violet" />
        <StatCard label="Avg Rating" value={`${avgRating}★`} icon={Star} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-5">
          <h3 className="font-heading font-semibold text-[15px] mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueByMonth} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <defs><linearGradient id="rev2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" stopOpacity={0.35} /><stop offset="100%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
              <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fontSize: 11.5, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11.5, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12.5 }} />
              <Area type="monotone" dataKey="revenue" stroke="#f43f5e" strokeWidth={2.5} fill="url(#rev2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h3 className="font-heading font-semibold text-[15px] mb-4">Order Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={78} paddingAngle={3}>
                {statusBreakdown.map((e) => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12.5 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {statusBreakdown.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-[12.5px]"><span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />{s.name}</span><span className="font-semibold">{s.value}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h3 className="font-heading font-semibold text-[15px] mb-4">Top Selling Desserts</h3>
          {topDesserts.length === 0 ? <p className="text-[13px] text-muted-foreground">No sales data yet.</p> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topDesserts} layout="vertical" margin={{ left: 20, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11.5, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={90} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12.5 }} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                <Bar dataKey="qty" radius={[0, 6, 6, 0]} fill="#f43f5e" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h3 className="font-heading font-semibold text-[15px] mb-4">Customer Segments</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={segmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {segmentData.map((e) => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12.5 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}