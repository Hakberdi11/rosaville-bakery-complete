import React, { useState, useEffect, useMemo } from "react";
import { entities } from '@/lib/api';
import { Megaphone, DollarSign, ShoppingBag, Users } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const CHANNEL_COLORS = { Website: "#3b82f6", Phone: "#10b981", "Walk-in": "#f59e0b", Wholesale: "#8b5cf6" };

export default function Marketing() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [o, c] = await Promise.all([
        entities.Order.list("-created_date", 500),
        entities.Customer.list("-created_date", 500),
      ]);
      setOrders(o); setCustomers(c);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const channelData = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      if (!map[o.channel]) map[o.channel] = { name: o.channel, revenue: 0, orders: 0 };
      map[o.channel].revenue += o.total_value || 0;
      map[o.channel].orders += 1;
    });
    return Object.values(map).map((c) => ({ ...c, color: CHANNEL_COLORS[c.name] || "#94a3b8" }));
  }, [orders]);

  const totalRevenue = orders.reduce((s, o) => s + (o.total_value || 0), 0);
  const repeatCustomers = customers.filter((c) => (c.total_orders || 0) > 1).length;

  if (loading) return <div className="p-12 flex justify-center"><div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader title="Marketing" description="Channel revenue & customer acquisition, from real order data." icon={Megaphone} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Revenue (All Time)" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} accent="emerald" />
        <StatCard label="Total Orders" value={orders.length} icon={ShoppingBag} accent="blue" />
        <StatCard label="Customers" value={customers.length} icon={Users} accent="violet" sub={`${repeatCustomers} repeat`} />
        <StatCard label="Active Channels" value={channelData.length} icon={Megaphone} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h3 className="font-heading font-semibold text-[15px] mb-4">Revenue by Channel</h3>
          {channelData.length === 0 ? (
            <div className="text-[13px] text-muted-foreground py-8 text-center">No orders yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={channelData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11.5, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11.5, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12.5 }} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="#8b5cf6" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h3 className="font-heading font-semibold text-[15px] mb-4">Orders by Channel</h3>
          {channelData.length === 0 ? (
            <div className="text-[13px] text-muted-foreground py-8 text-center">No orders yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={channelData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11.5, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11.5, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12.5 }} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                <Bar dataKey="orders" radius={[6, 6, 0, 0]} fill="#f43f5e" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
