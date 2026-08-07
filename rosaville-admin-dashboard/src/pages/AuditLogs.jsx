import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ScrollText, ShoppingBag, Users, Star, Package, ListTodo, Inbox } from "lucide-react";
import PageHeader, { EmptyState } from "@/components/admin/PageHeader";
import { cn } from "@/lib/utils";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [orders, customers, feedback, inventory, tasks, contacts] = await Promise.all([
          base44.entities.Order.list("-created_date", 30),
          base44.entities.Customer.list("-created_date", 20),
          base44.entities.Feedback.list("-created_date", 20),
          base44.entities.InventoryItem.list("-updated_date", 20),
          base44.entities.Task.list("-created_date", 20),
          base44.entities.ContactRequest.list("-created_date", 20),
        ]);
        const entries = [];
        const push = (arr, type, icon, color, label) => arr.forEach((r) => entries.push({
          id: type + r.id, type, icon, color,
          action: label, target: r.name || r.title || r.customer_name || r.order_number || r.id.slice(-6),
          by: r.created_by || r.updated_by || "system",
          date: r.updated_date || r.created_date,
        }));
        push(orders, "order", ShoppingBag, "blue", "Order");
        push(customers, "customer", Users, "violet", "Customer");
        push(feedback, "feedback", Star, "amber", "Feedback");
        push(inventory, "inventory", Package, "emerald", "Inventory");
        push(tasks, "task", ListTodo, "rose", "Task");
        push(contacts, "contact", Inbox, "cyan", "Contact");
        entries.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        setLogs(entries.slice(0, 60));
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const colorMap = {
    blue: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
    violet: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
    amber: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    emerald: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    rose: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
    cyan: "bg-cyan-500/12 text-cyan-600 dark:text-cyan-400",
  };

  return (
    <div className="p-5 lg:p-8 max-w-[800px] mx-auto">
      <PageHeader title="Audit Logs" description="A timeline of recent activity across the platform." icon={ScrollText} />
      {loading ? (
        <div className="p-12 flex justify-center"><div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card"><EmptyState icon={ScrollText} title="No activity yet" description="Actions across the platform will be logged here." /></div>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="relative flex items-start gap-3">
                <div className={cn("absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-background", colorMap[log.color])}>
                  <log.icon className="w-3 h-3" />
                </div>
                <div className="flex-1 rounded-xl border border-border/60 bg-card p-3">
                  <div className="text-[13px]"><span className="font-semibold">{log.action}</span> · <span className="text-muted-foreground">{log.target}</span></div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[11px] text-muted-foreground">by {log.by}</span>
                    {log.date && <span className="text-[11px] text-muted-foreground">{new Date(log.date).toLocaleString()}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}