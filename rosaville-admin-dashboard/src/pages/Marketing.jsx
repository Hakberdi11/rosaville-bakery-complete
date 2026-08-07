import React, { useState, useEffect, useMemo } from "react";
import { entities } from '@/lib/api';
import { Megaphone, TrendingUp, MousePointerClick, Eye, DollarSign } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

const trafficData = [
  { source: "Instagram", value: 38, color: "#ec4899" },
  { source: "Google", value: 27, color: "#3b82f6" },
  { source: "Direct", value: 18, color: "#10b981" },
  { source: "Facebook", value: 11, color: "#6366f1" },
  { source: "TikTok", value: 6, color: "#f59e0b" },
];

const campaignData = [
  { name: "Summer Cakes", spend: 240, revenue: 1820, roas: 7.6 },
  { name: "Wedding Promo", spend: 180, revenue: 980, roas: 5.4 },
  { name: "Instagram Ads", spend: 320, revenue: 2640, roas: 8.3 },
  { name: "Loyalty Email", spend: 40, revenue: 760, roas: 19 },
];

export default function Marketing() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setOrders(await entities.Order.list("-created_date", 500)); }
    catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const channelData = useMemo(() => {
    const map = {};
    orders.forEach((o) => { map[o.channel] = (map[o.channel] || 0) + (o.total_value || 0); });
    const colors = { Website: "#3b82f6", Phone: "#10b981", "Walk-in": "#f59e0b", Wholesale: "#8b5cf6" };
    return Object.entries(map).map(([name, value]) => ({ name, value, color: colors[name] || "#94a3b8" }));
  }, [orders]);

  const totalRevenue = orders.reduce((s, o) => s + (o.total_value || 0), 0);

  if (loading) return <div className="p-12 flex justify-center"><div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader title="Marketing" description="Campaign performance, traffic sources & channel revenue." icon={Megaphone} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Website Visitors" value="4,820" trend="+22%" trendUp icon={Eye} accent="blue" />
        <StatCard label="Conversion Rate" value="3.8%" trend="+0.6pt" trendUp icon={MousePointerClick} accent="emerald" />
        <StatCard label="Revenue (Period)" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} accent="violet" />
        <StatCard label="Avg ROAS" value="7.6×" trend="+1.2×" trendUp icon={TrendingUp} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h3 className="font-heading font-semibold text-[15px] mb-4">Campaign Performance</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={campaignData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10.5, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11.5, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12.5 }} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
              <Bar dataKey="spend" radius={[6, 6, 0, 0]} fill="#94a3b8" barSize={14} />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="#f43f5e" barSize={14} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 text-[11.5px] mt-2"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Spend</span><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Revenue</span></div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h3 className="font-heading font-semibold text-[15px] mb-4">Traffic Sources</h3>
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
              <div key={t.source} className="flex items-center justify-between text-[12.5px]"><span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />{t.source}</span><span className="font-semibold">{t.value}%</span></div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-5">
          <h3 className="font-heading font-semibold text-[15px] mb-4">Revenue by Channel</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={channelData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11.5, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11.5, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12.5 }} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#8b5cf6" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}