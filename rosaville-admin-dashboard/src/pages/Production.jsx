import React, { useState, useEffect, useMemo } from "react";
import { entities } from '@/lib/api';
import { Factory, Clock, ArrowRight, ChefHat, AlertTriangle, CalendarDays, Layers, ListChecks } from "lucide-react";
import PageHeader, { EmptyState } from "@/components/admin/PageHeader";
import { cn } from "@/lib/utils";
import { summarizeIngredients } from "@/lib/ingredientCalc";

const ACTIVE = ["Confirmed", "In Production", "Ready"];
const NEXT = { Confirmed: "In Production", "In Production": "Ready", Ready: "Delivered" };
const BOARD_COLUMNS = [
  { status: "Confirmed", label: "Confirmed", accent: "border-blue-500/40" },
  { status: "In Production", label: "In Production", accent: "border-violet-500/40" },
  { status: "Ready", label: "Ready", accent: "border-emerald-500/40" },
];

function parsePrepHours(str) {
  if (!str) return 1.5;
  let total = 0;
  const h = str.match(/(\d+(?:\.\d+)?)\s*(?:hr|hour)/i);
  const m = str.match(/(\d+)\s*min/i);
  if (h) total += parseFloat(h[1]);
  if (m) total += parseInt(m[1]) / 60;
  return total || 1.5;
}
function fmtTime(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function Production() {
  const [tab, setTab] = useState("schedule");
  const [orders, setOrders] = useState([]);
  const [desserts, setDesserts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [o, d, i] = await Promise.all([
        entities.Order.list("-delivery_date", 500),
        entities.Dessert.list("-display_order", 500),
        entities.InventoryItem.list("-created_date", 500),
      ]);
      setOrders(o); setDesserts(d); setInventory(i);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const advance = async (order) => {
    const next = NEXT[order.status];
    if (!next) return;
    await entities.Order.update(order.id, { status: next });
    setOrders((p) => p.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
  };

  const activeOrders = orders.filter((o) => ACTIVE.includes(o.status));

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader title="Production" description="Plan daily output, organize baking batches, and track orders through the kitchen." icon={Factory} />

      <div className="flex items-center gap-1 mb-5 border-b border-border/60 overflow-x-auto">
        {[
          { id: "schedule", label: "Daily Schedule", icon: CalendarDays },
          { id: "batches", label: "Batch Planner", icon: Layers },
          { id: "board", label: "Status Board", icon: ListChecks },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px whitespace-nowrap transition-colors",
              tab === t.id ? "border-rose-500 text-rose-600 dark:text-rose-400" : "border-transparent text-muted-foreground hover:text-foreground")}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
      ) : activeOrders.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card"><EmptyState icon={Factory} title="Nothing in production" description="Confirmed orders will appear here automatically." /></div>
      ) : tab === "schedule" ? (
        <ScheduleView orders={activeOrders} desserts={desserts} onAdvance={advance} />
      ) : tab === "batches" ? (
        <BatchView orders={activeOrders} desserts={desserts} inventory={inventory} />
      ) : (
        <BoardView orders={activeOrders} desserts={desserts} inventory={inventory} onAdvance={advance} />
      )}
    </div>
  );
}

function ScheduleView({ orders, desserts, onAdvance }) {
  const byDate = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const key = o.delivery_date || "Undated";
      if (!map[key]) map[key] = [];
      map[key].push(o);
    });
    return Object.entries(map).sort((a, b) => {
      if (a[0] === "Undated") return 1;
      if (b[0] === "Undated") return -1;
      return new Date(a[0]) - new Date(b[0]);
    });
  }, [orders]);

  return (
    <div className="space-y-5">
      {byDate.map(([date, dayOrders]) => {
        const allItems = dayOrders.flatMap((o) => o.items || []);
        const totalItems = allItems.reduce((s, i) => s + (i.quantity || 0), 0);
        const prepHours = allItems.reduce((s, it) => {
          const d = desserts.find((x) => x.id === it.dessert_id);
          return s + parsePrepHours(d?.preparation_time) * (it.quantity || 1);
        }, 0);
        const startHour = Math.max(0, 17 - prepHours);
        return (
          <div key={date} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-muted/40 border-b border-border/60 gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <CalendarDays className="w-4 h-4 text-rose-500 shrink-0" />
                <div className="min-w-0">
                  <div className="font-heading font-semibold text-[14.5px] truncate">{date === "Undated" ? "Undated orders" : new Date(date).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</div>
                  <div className="text-[11.5px] text-muted-foreground">{dayOrders.length} orders · {totalItems} items</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-right shrink-0">
                <div><div className="text-[10px] uppercase tracking-wide text-muted-foreground">Est. prep</div><div className="text-[13px] font-semibold tabular-nums">{prepHours.toFixed(1)}h</div></div>
                <div><div className="text-[10px] uppercase tracking-wide text-muted-foreground">Start by</div><div className="text-[13px] font-semibold tabular-nums">{fmtTime(startHour)}</div></div>
              </div>
            </div>
            <div className="divide-y divide-border/40">
              {dayOrders.map((o) => (
                <div key={o.id} className="px-5 py-3 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[12.5px] font-semibold">{o.order_number || `#${String(o.id).slice(-6)}`}</span>
                      <span className="text-[13px] font-medium">{o.customer_name}</span>
                      <span className="text-[10.5px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{o.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-muted-foreground">
                      {(o.items || []).map((it, i) => (
                        <span key={i}>{it.quantity}× {it.name}{it.size && it.size !== "Standard" ? ` (${it.size})` : ""}</span>
                      ))}
                    </div>
                  </div>
                  {NEXT[o.status] && (
                    <button onClick={() => onAdvance(o)} className="shrink-0 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium flex items-center gap-1.5 hover:bg-primary/90">
                      <ArrowRight className="w-3.5 h-3.5" /> {NEXT[o.status]}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BatchView({ orders, desserts, inventory }) {
  const dates = useMemo(() => Array.from(new Set(orders.map((o) => o.delivery_date).filter(Boolean))).sort((a, b) => new Date(a) - new Date(b)), [orders]);
  const [date, setDate] = useState(dates[0] || "");
  useEffect(() => { if (!date && dates.length) setDate(dates[0]); }, [dates, date]);

  const dayOrders = orders.filter((o) => o.delivery_date === date);
  const allItems = dayOrders.flatMap((o) => (o.items || []));

  const batches = useMemo(() => {
    const map = {};
    allItems.forEach((it) => {
      const key = `${it.dessert_id}__${it.size || "Standard"}`;
      if (!map[key]) map[key] = { name: it.name, size: it.size || "Standard", qty: 0 };
      map[key].qty += it.quantity || 1;
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty);
  }, [allItems]);

  const ingredients = useMemo(() => summarizeIngredients(allItems, desserts, inventory), [allItems, desserts, inventory]);
  const shortfalls = ingredients.filter((i) => !i.sufficient);
  const totalToBake = batches.reduce((s, b) => s + b.qty, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <CalendarDays className="w-4 h-4 text-rose-500" />
          <select value={date} onChange={(e) => setDate(e.target.value)} className="h-9 px-3 rounded-lg border border-input bg-card text-[13px]">
            {dates.length === 0 && <option value="">No dated orders</option>}
            {dates.map((d) => <option key={d} value={d}>{new Date(d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</option>)}
          </select>
          <span className="text-[12px] text-muted-foreground">{dayOrders.length} orders · {totalToBake} items to bake</span>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          <div className="px-4 py-2.5 bg-muted/40 border-b border-border/60 text-[11.5px] uppercase tracking-wide text-muted-foreground font-semibold flex items-center gap-2"><Layers className="w-3.5 h-3.5" /> Bake List</div>
          {batches.length === 0 ? <div className="p-6 text-center text-[13px] text-muted-foreground">No orders for this date.</div> : (
            <div className="divide-y divide-border/40">
              {batches.map((b, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-medium truncate">{b.name}</div>
                    <div className="text-[11.5px] text-muted-foreground">{b.size}</div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="text-[20px] font-heading font-bold tabular-nums leading-none">{b.qty}</div>
                    <div className="text-[10px] text-muted-foreground uppercase mt-0.5">to bake</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ChefHat className="w-4 h-4 text-rose-500" />
          <h3 className="font-heading font-semibold text-[14px]">Combined Ingredient Needs</h3>
          {shortfalls.length > 0 && <span className="flex items-center gap-1 text-[11.5px] text-amber-600 dark:text-amber-400 ml-auto"><AlertTriangle className="w-3 h-3" /> {shortfalls.length} short</span>}
        </div>
        <div className={cn("rounded-2xl border p-4", shortfalls.length ? "border-amber-500/30 bg-amber-500/5" : "border-emerald-500/30 bg-emerald-500/5")}>
          {ingredients.length === 0 ? <p className="text-[13px] text-muted-foreground">No ingredient data linked to these recipes.</p> : (
            <div className="space-y-2.5">
              {ingredients.map((s) => (
                <div key={s.inventory_item_id} className="flex items-center justify-between text-[12.5px]">
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className={cn("font-medium tabular-nums", s.sufficient ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                    {s.needed.toFixed(2)} {s.unit} <span className="text-muted-foreground font-normal">(have {s.available})</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">Quantities use each size's own recipe when set, otherwise the base recipe scaled by the size multiplier.</p>
      </div>
    </div>
  );
}

function BoardView({ orders, desserts, inventory, onAdvance }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {BOARD_COLUMNS.map((col) => {
        const items = orders.filter((o) => o.status === col.status);
        return (
          <div key={col.status} className={cn("rounded-2xl border-2 bg-muted/20 p-3", col.accent)}>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[13px] font-semibold">{col.label}</span>
              <span className="text-[11px] font-medium text-muted-foreground bg-card rounded-full px-2 py-0.5">{items.length}</span>
            </div>
            <div className="space-y-3">
              {items.map((o) => {
                const needs = summarizeIngredients(o.items || [], desserts, inventory);
                const shortfalls = needs.filter((n) => !n.sufficient);
                return (
                  <div key={o.id} className="rounded-xl border border-border/60 bg-card p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] font-semibold">{o.order_number || `#${String(o.id).slice(-6)}`}</span>
                      {o.delivery_date && <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Clock className="w-3 h-3" /> {new Date(o.delivery_date).toLocaleDateString()}</span>}
                    </div>
                    <div className="text-[13px] font-medium mb-1">{o.customer_name}</div>
                    <div className="space-y-0.5 mb-2.5">
                      {(o.items || []).map((it, i) => (
                        <div key={i} className="text-[12px] text-muted-foreground">{it.quantity}× {it.name}{it.size && it.size !== "Standard" ? ` (${it.size})` : ""}</div>
                      ))}
                    </div>
                    {needs.length > 0 && (
                      <div className="rounded-lg bg-muted/40 p-2 mb-2.5">
                        <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-muted-foreground mb-1"><ChefHat className="w-3 h-3" /> Ingredients</div>
                        <div className="space-y-0.5">
                          {needs.slice(0, 4).map((n) => (
                            <div key={n.inventory_item_id} className="flex justify-between text-[11px]">
                              <span className="text-muted-foreground">{n.name}</span>
                              <span className={n.sufficient ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>{n.needed.toFixed(2)} {n.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {shortfalls.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[10.5px] text-amber-600 dark:text-amber-400 mb-2.5"><AlertTriangle className="w-3 h-3" /> {shortfalls.length} ingredient(s) short</div>
                    )}
                    {NEXT[o.status] && (
                      <button onClick={() => onAdvance(o)} className="w-full h-8 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium flex items-center justify-center gap-1.5 hover:bg-primary/90">
                        Move to {NEXT[o.status]} <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
              {items.length === 0 && <div className="text-[11px] text-muted-foreground/60 text-center py-6">No orders</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}