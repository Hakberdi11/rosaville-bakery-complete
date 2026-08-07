import React from "react";
import { Construction } from "lucide-react";
import PageHeader from "./PageHeader";

export default function Placeholder({ title, description, icon: Icon = Construction }) {
  return (
    <div className="p-5 lg:p-8">
      <PageHeader title={title} description={description} icon={Icon} />
      <div className="rounded-2xl border border-dashed border-border/70 bg-card/50 p-16 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/10 to-amber-500/10 flex items-center justify-center mb-5">
          <Icon className="w-7 h-7 text-rose-500" strokeWidth={1.8} />
        </div>
        <h2 className="font-heading text-[18px] font-semibold mb-2">{title} — Coming Next</h2>
        <p className="text-[13.5px] text-muted-foreground max-w-md leading-relaxed mb-6">
          This module is part of the Rosaville Desserts operating system and will be wired up as we continue building.
          The data layer and navigation are already in place.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {["Data model", "Navigation", "Permissions", "Integrations"].map((t) => (
            <span key={t} className="px-2.5 py-1 rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
              {t} ready
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}