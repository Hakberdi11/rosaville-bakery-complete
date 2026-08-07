import React from "react";
import { cn } from "@/lib/utils";

export default function PageHeader({ title, description, actions, icon: Icon }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-primary/5 border border-border/60 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>
        )}
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-heading font-semibold tracking-tight leading-tight">{title}</h1>
          {description && <p className="text-[13px] text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
      <h3 className="font-heading font-semibold text-[15px] mb-1">{title}</h3>
      {description && <p className="text-[13px] text-muted-foreground max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    Pending: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    Confirmed: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
    "In Production": "bg-violet-500/12 text-violet-600 dark:text-violet-400",
    Ready: "bg-cyan-500/12 text-cyan-600 dark:text-cyan-400",
    Delivered: "bg-teal-500/12 text-teal-600 dark:text-teal-400",
    Completed: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    Cancelled: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
    Refunded: "bg-slate-500/12 text-slate-600 dark:text-slate-400",
    New: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
    Open: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    Assigned: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
    Resolved: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    Closed: "bg-slate-500/12 text-slate-600 dark:text-slate-400",
    "To Do": "bg-slate-500/12 text-slate-600 dark:text-slate-400",
    "In Progress": "bg-blue-500/12 text-blue-600 dark:text-blue-400",
    Waiting: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    VIP: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    Regular: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
    New: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    "At Risk": "bg-rose-500/12 text-rose-600 dark:text-rose-400",
    Paid: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    Unpaid: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
    "Partially Paid": "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap", map[status] || "bg-muted text-muted-foreground")}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}