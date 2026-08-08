import React, { useState, useEffect, useMemo } from "react";
import { entities } from '@/lib/api';
import { Package, Plus, Search, Pencil, Trash2, AlertTriangle, TrendingDown, DollarSign, Eye, EyeOff, PackageX, Clock } from "lucide-react";
import PageHeader, { EmptyState } from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { calculateProjectedStock, calculateWasteRisk, UNITS } from "@/lib/ingredientCalc";

const CATEGORIES = ["Flour & Grains", "Dairy", "Sugar & Sweeteners", "Chocolate", "Fruits", "Flavorings", "Packaging", "Other"];
const EXPIRING_SOON_DAYS = 7;

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const ms = new Date(dateStr).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / 86400000);
}

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [desserts, setDesserts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [showProjected, setShowProjected] = useState(false);
  const [showWasteRisk, setShowWasteRisk] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [i, o, d, s] = await Promise.all([
        entities.InventoryItem.list("-created_date", 500),
        entities.Order.list("-created_date", 500),
        entities.Dessert.list("-display_order", 500),
        entities.Supplier.list("name", 500),
      ]);
      setItems(i); setOrders(o); setDesserts(d); setSuppliers(s);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const wasteRiskById = useMemo(() => {
    const map = {};
    calculateWasteRisk(items, orders, desserts).forEach((w) => { map[w.id] = w; });
    return map;
  }, [items, orders, desserts]);

  const enriched = useMemo(() => {
    const base = showProjected ? calculateProjectedStock(items, orders, desserts) : items;
    return base.map((it) => ({ ...it, ...wasteRiskById[it.id] }));
  }, [showProjected, items, orders, desserts, wasteRiskById]);

  const filtered = useMemo(
    () => enriched.filter((i) => !search || i.name?.toLowerCase().includes(search.toLowerCase())),
    [enriched, search]
  );

  const lowStock = items.filter((i) => i.current_stock <= i.minimum_stock);
  const totalValue = items.reduce((s, i) => s + (i.current_stock || 0) * (i.cost_per_unit || 0), 0);
  const shortfallCount = showProjected ? enriched.filter((i) => i.projected_stock < i.minimum_stock).length : 0;
  const overstockedCount = Object.values(wasteRiskById).filter((w) => w.overstocked).length;
  const expiringSoonCount = items.filter((i) => { const d = daysUntil(i.expiry_date); return d !== null && d <= EXPIRING_SOON_DAYS; }).length;

  const remove = async (item) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    await entities.InventoryItem.delete(item.id);
    setItems((p) => p.filter((x) => x.id !== item.id));
  };

  const adjustStock = async (item, delta) => {
    const newStock = Math.max(0, (item.current_stock || 0) + delta);
    await entities.InventoryItem.update(item.id, { current_stock: newStock });
    setItems((p) => p.map((x) => (x.id === item.id ? { ...x, current_stock: newStock } : x)));
  };

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Inventory"
        description="Track ingredients, suppliers, and stock — with projected usage from active orders."
        icon={Package}
        actions={
          <>
            <Button variant={showProjected ? "default" : "outline"} size="sm" className="gap-2" onClick={() => setShowProjected((v) => !v)}>
              {showProjected ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showProjected ? "Hide Projected" : "Show Projected Stock"}
            </Button>
            <Button variant={showWasteRisk ? "default" : "outline"} size="sm" className="gap-2" onClick={() => setShowWasteRisk((v) => !v)}>
              <PackageX className="w-4 h-4" />
              {showWasteRisk ? "Hide Waste Risk" : "Show Waste Risk"}
            </Button>
            <Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Add Item</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Items" value={items.length} icon={Package} accent="blue" />
        <StatCard label="Inventory Value" value={`$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={DollarSign} accent="emerald" />
        <StatCard label="Low Stock Alerts" value={lowStock.length} icon={AlertTriangle} accent={lowStock.length ? "rose" : "default"} />
        <StatCard label={showProjected ? "Projected Shortfalls" : "Out of Stock"} value={showProjected ? shortfallCount : items.filter((i) => i.current_stock <= 0).length} icon={TrendingDown} accent={showProjected && shortfallCount ? "rose" : "amber"} sub={showProjected ? "after active orders" : undefined} />
      </div>

      {showProjected && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 px-4 py-2.5 mb-4 text-[12.5px] text-blue-700 dark:text-blue-300">
          Showing <strong>projected stock</strong> = current stock minus ingredients needed for all active orders (Pending → Ready).
        </div>
      )}

      {showWasteRisk && (
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 px-4 py-2.5 mb-4 text-[12.5px] text-violet-700 dark:text-violet-300">
          Showing <strong>weeks of supply</strong> = current stock ÷ average weekly usage over the last 4 weeks. Items stocked beyond 6 weeks of actual demand are flagged as overstocked ({overstockedCount} found) — items with no recent sales history aren't flagged, since that's a different signal than over-ordering.
        </div>
      )}

      <div className="relative mb-5 max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ingredients…" className="pl-9 h-10" />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Package} title="No inventory items" description="Add your first ingredient to start tracking stock." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border/60 text-left text-[11.5px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Ingredient</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Current Stock</th>
                  {showProjected && <th className="px-4 py-3 font-medium">Predicted Usage</th>}
                  {showProjected && <th className="px-4 py-3 font-medium">Projected Stock</th>}
                  {showWasteRisk && <th className="px-4 py-3 font-medium">Weeks of Supply</th>}
                  <th className="px-4 py-3 font-medium">Min</th>
                  <th className="px-4 py-3 font-medium">Cost/Unit</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">Supplier</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => {
                  const isLow = i.current_stock <= i.minimum_stock;
                  const isOut = i.current_stock <= 0;
                  const projectedLow = showProjected && i.projected_stock < i.minimum_stock;
                  const projectedOut = showProjected && i.projected_stock <= 0;
                  const expiryDays = daysUntil(i.expiry_date);
                  const isExpired = expiryDays !== null && expiryDays < 0;
                  const isExpiringSoon = expiryDays !== null && expiryDays >= 0 && expiryDays <= EXPIRING_SOON_DAYS;
                  return (
                    <tr key={i.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={cn("w-2 h-2 rounded-full", projectedOut ? "bg-rose-600" : projectedLow ? "bg-amber-500" : isOut ? "bg-rose-500" : isLow ? "bg-amber-500" : "bg-emerald-500")} />
                          <span className="font-medium">{i.name}</span>
                          {(isExpired || isExpiringSoon) && (
                            <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10.5px] font-semibold",
                              isExpired ? "bg-rose-500/12 text-rose-600 dark:text-rose-400" : "bg-amber-500/12 text-amber-600 dark:text-amber-400")}>
                              <Clock className="w-3 h-3" />
                              {isExpired ? "Expired" : expiryDays === 0 ? "Expires today" : `Expires in ${expiryDays}d`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{i.category}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => adjustStock(i, -1)} className="w-6 h-6 rounded border border-border text-muted-foreground hover:bg-muted flex items-center justify-center text-[14px]">−</button>
                          <span className={cn("font-semibold tabular-nums w-14 text-center", isOut ? "text-rose-500" : isLow ? "text-amber-500" : "")}>{i.current_stock} {i.unit}</span>
                          <button onClick={() => adjustStock(i, 1)} className="w-6 h-6 rounded border border-border text-muted-foreground hover:bg-muted flex items-center justify-center text-[14px]">+</button>
                        </div>
                      </td>
                      {showProjected && <td className="px-4 py-3 tabular-nums text-amber-600 dark:text-amber-400">{(i.predicted_usage || 0) > 0 ? `−${(i.predicted_usage || 0).toFixed(2)} ${i.unit}` : "—"}</td>}
                      {showProjected && (
                        <td className="px-4 py-3">
                          <span className={cn("font-semibold tabular-nums", projectedOut ? "text-rose-500" : projectedLow ? "text-amber-500" : "text-emerald-600 dark:text-emerald-400")}>
                            {(i.projected_stock || 0).toFixed(2)} {i.unit}
                          </span>
                        </td>
                      )}
                      {showWasteRisk && (
                        <td className="px-4 py-3">
                          {i.weeks_of_supply === null || i.weeks_of_supply === undefined ? (
                            <span className="text-muted-foreground">No recent sales</span>
                          ) : (
                            <span className={cn("font-semibold tabular-nums flex items-center gap-1", i.overstocked ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground")}>
                              {i.overstocked && <PackageX className="w-3.5 h-3.5" />}
                              {i.weeks_of_supply.toFixed(1)} wks
                            </span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">{i.minimum_stock} {i.unit}</td>
                      <td className="px-4 py-3 tabular-nums">${(i.cost_per_unit || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 font-semibold tabular-nums">${((i.current_stock || 0) * (i.cost_per_unit || 0)).toFixed(2)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{i.supplier_name || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => setEditItem(i)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                          <button onClick={() => remove(i)} className="w-7 h-7 rounded-lg hover:bg-rose-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-rose-500" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ItemDialog open={createOpen || !!editItem} item={editItem} suppliers={suppliers} onClose={() => { setCreateOpen(false); setEditItem(null); }} onSaved={load} />
    </div>
  );
}

function ItemDialog({ open, item, suppliers, onClose, onSaved }) {
  const isEdit = !!item;
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(item || { name: "", category: "Other", current_stock: 0, unit: "kg", minimum_stock: 0, reorder_quantity: 0, supplier: "", cost_per_unit: 0, expiry_date: "" });
  }, [open, item]);

  if (!form) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        current_stock: Number(form.current_stock) || 0,
        minimum_stock: Number(form.minimum_stock) || 0,
        reorder_quantity: Number(form.reorder_quantity) || 0,
        cost_per_unit: Number(form.cost_per_unit) || 0,
        expiry_date: form.expiry_date || null,
        supplier: form.supplier || null,
      };
      if (isEdit) await entities.InventoryItem.update(item.id, payload);
      else await entities.InventoryItem.create(payload);
      onSaved(); onClose();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{isEdit ? "Edit Ingredient" : "Add Ingredient"}</DialogTitle></DialogHeader>
        <div className="grid gap-3 py-2">
          <div><Label>Name *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1" /></div>
          <div><Label>Category</Label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className="mt-1 w-full h-9 px-3 rounded-lg border border-input bg-card text-[13px]">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Current Stock</Label><Input type="number" value={form.current_stock} onChange={(e) => set("current_stock", e.target.value)} className="mt-1" /></div>
            <div><Label>Unit</Label>
              <select value={form.unit} onChange={(e) => set("unit", e.target.value)} className="mt-1 w-full h-9 px-3 rounded-lg border border-input bg-card text-[13px]">
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Minimum Stock</Label><Input type="number" value={form.minimum_stock} onChange={(e) => set("minimum_stock", e.target.value)} className="mt-1" /></div>
            <div><Label>Reorder Quantity</Label><Input type="number" value={form.reorder_quantity} onChange={(e) => set("reorder_quantity", e.target.value)} className="mt-1" placeholder="Target restock amount" /></div>
          </div>
          <div><Label>Cost Per Unit ($)</Label><Input type="number" step="0.01" value={form.cost_per_unit} onChange={(e) => set("cost_per_unit", e.target.value)} className="mt-1" /></div>
          <div><Label>Supplier</Label>
            <select value={form.supplier || ""} onChange={(e) => set("supplier", e.target.value ? Number(e.target.value) : "")} className="mt-1 w-full h-9 px-3 rounded-lg border border-input bg-card text-[13px]">
              <option value="">No supplier</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div><Label>Expiry Date</Label><Input type="date" value={form.expiry_date || ""} onChange={(e) => set("expiry_date", e.target.value)} className="mt-1" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !form.name} className="bg-rose-600 hover:bg-rose-700">{saving ? "Saving…" : isEdit ? "Save" : "Add Item"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}