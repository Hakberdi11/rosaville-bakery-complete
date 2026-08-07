import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ label, value, sub, trend, trendUp, icon: Icon, accent = "default" }) {
  const accents = {
    default: "from-slate-500/10 to-slate-500/5 text-slate-600 dark:text-slate-300",
    rose: "from-rose-500/10 to-rose-500/5 text-rose-600 dark:text-rose-400",
    amber: "from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400",
    emerald: "from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    blue: "from-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400",
    violet: "from-violet-500/10 to-violet-500/5 text-violet-600 dark:text-violet-400",
  };
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] font-medium text-muted-foreground mb-1.5">{label}</div>
          <div className="text-[26px] font-heading font-semibold tracking-tight leading-none">{value}</div>
          {sub && <div className="text-[11.5px] text-muted-foreground mt-1.5">{sub}</div>}
        </div>
        {Icon && (
          <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0", accents[accent])}>
            <Icon className="w-[18px] h-[18px]" strokeWidth={2.1} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1.5 mt-3.5 pt-3.5 border-t border-border/40">
          {trendUp !== undefined && (
            trendUp
              ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              : <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
          )}
          <span className={cn("text-[12px] font-semibold", trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
            {trend}
          </span>
          <span className="text-[11.5px] text-muted-foreground">vs last period</span>
        </div>
      )}
    </div>
  );
}