import React, { useState, useEffect } from "react";
import { entities } from '@/lib/api';
import { Bell, ShoppingBag, Star, Inbox, AlertTriangle, ListTodo, Clock } from "lucide-react";
import PageHeader, { EmptyState } from "@/components/admin/PageHeader";
import { cn } from "@/lib/utils";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [orders, feedback, contacts, inventory, tasks] = await Promise.all([
          entities.Order.list("-created_date", 20),
          entities.Feedback.list("-created_date", 10),
          entities.ContactRequest.list("-created_date", 10),
          entities.InventoryItem.list("-created_date", 500),
          entities.Task.list("-created_date", 50),
        ]);
        const events = [];
        orders.forEach((o) => events.push({ id: "o" + o.id, type: "order", icon: ShoppingBag, color: "blue", title: `New order ${o.order_number || ""} from ${o.customer_name}`, sub: `$${(o.total_value || 0).toFixed(0)} · ${o.status}`, date: o.created_at }));
        feedback.forEach((f) => events.push({ id: "f" + f.id, type: "feedback", icon: Star, color: "amber", title: `${f.rating}★ review from ${f.customer_name}`, sub: f.dessert_name || f.message?.slice(0, 60), date: f.created_at }));
        contacts.filter((c) => c.status === "New").forEach((c) => events.push({ id: "c" + c.id, type: "contact", icon: Inbox, color: "violet", title: `New inquiry from ${c.name}`, sub: c.subject || c.message?.slice(0, 60), date: c.created_at }));
        inventory.filter((i) => i.current_stock <= i.minimum_stock).forEach((i) => events.push({ id: "i" + i.id, type: "stock", icon: AlertTriangle, color: "rose", title: `Low stock: ${i.name}`, sub: `${i.current_stock} ${i.unit} left (min ${i.minimum_stock})`, date: i.updated_at || i.created_at }));
        tasks.filter((t) => t.status !== "Completed" && t.due_date).forEach((t) => {
          const due = new Date(t.due_date);
          const soon = (due - new Date()) / 86400000 <= 3;
          if (soon) events.push({ id: "t" + t.id, type: "task", icon: ListTodo, color: soon ? "amber" : "blue", title: `Task due: ${t.title}`, sub: t.assigned_to_name ? `Assigned to ${t.assigned_to_name}` : "Unassigned", date: t.due_date });
        });
        events.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        setItems(events.slice(0, 40));
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const colorMap = {
    blue: "from-blue-500/15 to-blue-500/5 text-blue-600 dark:text-blue-400",
    amber: "from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400",
    rose: "from-rose-500/15 to-rose-500/5 text-rose-600 dark:text-rose-400",
    violet: "from-violet-500/15 to-violet-500/5 text-violet-600 dark:text-violet-400",
  };

  return (
    <div className="p-5 lg:p-8 max-w-[800px] mx-auto">
      <PageHeader title="Notifications" description="Recent activity across your bakery — orders, reviews, alerts & deadlines." icon={Bell} />
      {loading ? (
        <div className="p-12 flex justify-center"><div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card"><EmptyState icon={Bell} title="All caught up" description="No recent activity to show." /></div>
      ) : (
        <div className="space-y-2">
          {items.map((ev) => (
            <div key={ev.id} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5 hover:shadow-sm transition-shadow">
              <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0", colorMap[ev.color])}>
                <ev.icon className="w-4 h-4" strokeWidth={2.1} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium leading-snug">{ev.title}</div>
                {ev.sub && <div className="text-[12px] text-muted-foreground truncate">{ev.sub}</div>}
              </div>
              {ev.date && <div className="flex items-center gap-1 text-[11px] text-muted-foreground whitespace-nowrap"><Clock className="w-3 h-3" /> {new Date(ev.date).toLocaleDateString()}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}