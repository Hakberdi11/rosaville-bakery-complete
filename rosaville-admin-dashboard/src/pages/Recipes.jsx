import React, { useState, useEffect, useMemo } from "react";
import { entities, pricingSettings } from '@/lib/api';
import { ChefHat, Search, TrendingUp, TrendingDown, Plus, Pencil, AlertTriangle } from "lucide-react";
import PageHeader, { EmptyState } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import RecipeEditor from "@/components/admin/RecipeEditor";
import { cn } from "@/lib/utils";
import { convertUnit, calculateRecipeCost, calculateSuggestedPrice } from "@/lib/ingredientCalc";

const CATEGORIES = ["Signature Cakes", "Custom Cakes", "Seasonal Specials", "Cupcakes", "Pastries", "Cheesecakes"];

export default function Recipes() {
  const [desserts, setDesserts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [d, i, p] = await Promise.all([
        entities.Dessert.list("-display_order", 500),
        entities.InventoryItem.list("-created_date", 500),
        pricingSettings.get(),
      ]);
      setDesserts(d); setInventory(i); setPricing(p);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const withCosts = useMemo(() => desserts.map((d) => {
    const ingredientCost = calculateRecipeCost(d, inventory);
    const price = d.price || 0;
    const margin = price - ingredientCost;
    const marginPct = price > 0 ? (margin / price) * 100 : 0;
    const suggested = pricing ? calculateSuggestedPrice(d, inventory, pricing) : null;
    const belowTarget = suggested ? marginPct < suggested.marginPercent : false;
    return { ...d, ingredientCost, margin, marginPct, suggested, belowTarget };
  }), [desserts, inventory, pricing]);

  const filtered = withCosts.filter((d) => !search || d.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader title="Recipes" description="Ingredient costs, profit margins & size-specific recipes." icon={ChefHat}
        actions={<Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Add Recipe</Button>} />

      <div className="relative mb-5 max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search recipes…" className="pl-9 h-10" />
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card"><EmptyState icon={ChefHat} title="No recipes" description="Add a recipe to track ingredient costs and margins." action={<Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Add Recipe</Button>} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <div key={d.id} className="rounded-2xl border border-border/60 bg-card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <h3 className="font-heading font-semibold text-[14.5px] leading-tight truncate">{d.name}</h3>
                  <div className="text-[11.5px] text-muted-foreground">{d.category}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[15px] font-semibold tabular-nums">${(d.price || 0).toFixed(2)}</span>
                  <button onClick={() => setEditItem(d)} className="w-7 h-7 rounded-lg border border-border hover:bg-muted flex items-center justify-center"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                </div>
              </div>
              {d.belowTarget && (
                <div className="mb-2.5 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-medium w-fit">
                  <AlertTriangle className="w-3 h-3" /> Below target margin ({d.suggested.marginPercent}%)
                </div>
              )}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="rounded-lg bg-muted/40 p-2 text-center"><div className="text-[10px] text-muted-foreground">Cost</div><div className="text-[13px] font-semibold mt-0.5">${d.ingredientCost.toFixed(2)}</div></div>
                <div className="rounded-lg bg-muted/40 p-2 text-center"><div className="text-[10px] text-muted-foreground">Margin</div><div className={cn("text-[13px] font-semibold mt-0.5", d.margin >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500")}>${d.margin.toFixed(2)}</div></div>
                <div className="rounded-lg bg-muted/40 p-2 text-center"><div className="text-[10px] text-muted-foreground">Margin %</div><div className={cn("text-[13px] font-semibold mt-0.5 flex items-center justify-center gap-0.5", d.marginPct >= 50 ? "text-emerald-600 dark:text-emerald-400" : d.marginPct >= 30 ? "text-amber-500" : "text-rose-500")}>
                  {d.marginPct >= 50 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{d.marginPct.toFixed(0)}%
                </div></div>
                <div className="rounded-lg bg-muted/40 p-2 text-center"><div className="text-[10px] text-muted-foreground">Suggested</div><div className="text-[13px] font-semibold mt-0.5 text-emerald-600 dark:text-emerald-400">{d.suggested ? `$${d.suggested.suggestedPrice.toFixed(2)}` : "—"}</div></div>
              </div>
              <div className="space-y-1">
                <div className="text-[10.5px] font-semibold text-muted-foreground uppercase mb-1">Base Ingredients</div>
                {(d.ingredients || []).map((ing, i) => {
                  const item = inventory.find((x) => String(x.id) === String(ing.inventory_item_id));
                  const converted = item ? convertUnit(ing.quantity || 0, ing.unit, item.unit) : ing.quantity;
                  return (
                    <div key={i} className="flex justify-between text-[11.5px]">
                      <span className="text-muted-foreground">{ing.name}</span>
                      <span className="font-medium tabular-nums">{converted.toFixed(2)} {item?.unit || ing.unit}</span>
                    </div>
                  );
                })}
                {(!d.ingredients || d.ingredients.length === 0) && <div className="text-[11px] text-muted-foreground italic">No ingredients linked.</div>}
              </div>
              {d.sizes?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                  {d.sizes.length} size variant{d.sizes.length > 1 ? "s" : ""} · {d.sizes.filter((s) => s.ingredients?.length).length} with custom recipes
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <RecipeDialog open={createOpen || !!editItem} item={editItem} inventory={inventory} pricing={pricing} onClose={() => { setCreateOpen(false); setEditItem(null); }} onSaved={load} />
    </div>
  );
}

function RecipeDialog({ open, item, inventory, pricing, onClose, onSaved }) {
  const isEdit = !!item;
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(item ? {
      ...item,
      ingredients: item.ingredients || [],
      sizes: (item.sizes || []).map((s) => ({ ...s, ingredients: s.ingredients || [] })),
      target_margin_percent: item.target_margin_percent ?? "",
    } : {
      name: "", category: "Signature Cakes", price: "", preparation_time: "", ingredients: [], sizes: [],
      labor_hours: 0, batch_yield: 1, packaging_cost: 0, target_margin_percent: "",
    });
  }, [open, item]);

  const breakdown = useMemo(() => {
    if (!form || !pricing) return null;
    return calculateSuggestedPrice(
      { ...form, target_margin_percent: form.target_margin_percent === "" ? null : Number(form.target_margin_percent) },
      inventory,
      pricing,
    );
  }, [form, inventory, pricing]);

  if (!form) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setBaseIngs = (ings) => set("ingredients", ings);
  const setSizes = (sizes) => set("sizes", sizes);

  const submit = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        labor_hours: Number(form.labor_hours) || 0,
        batch_yield: Number(form.batch_yield) || 1,
        packaging_cost: Number(form.packaging_cost) || 0,
        target_margin_percent: form.target_margin_percent === "" || form.target_margin_percent === null ? null : Number(form.target_margin_percent),
      };
      if (isEdit) await entities.Dessert.update(item.id, payload);
      else await entities.Dessert.create(payload);
      onSaved(); onClose();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "Edit Recipe" : "Add Recipe"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="col-span-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1" /></div>
          <div><Label>Category</Label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className="mt-1 w-full h-9 px-3 rounded-lg border border-input bg-card text-[13px]">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><Label>Base Price ($)</Label><Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} className="mt-1" /></div>
          <div className="col-span-2"><Label>Preparation Time</Label><Input value={form.preparation_time} onChange={(e) => set("preparation_time", e.target.value)} className="mt-1" placeholder="e.g. 2 hours" /></div>

          <div><Label>Labor Hours <span className="text-muted-foreground font-normal text-[11.5px]">(per batch)</span></Label><Input type="number" step="0.1" value={form.labor_hours} onChange={(e) => set("labor_hours", e.target.value)} className="mt-1" /></div>
          <div><Label>Batch Yield</Label><Input type="number" min="1" value={form.batch_yield} onChange={(e) => set("batch_yield", e.target.value)} className="mt-1" /></div>
          <div><Label>Packaging Cost ($)</Label><Input type="number" step="0.01" value={form.packaging_cost} onChange={(e) => set("packaging_cost", e.target.value)} className="mt-1" /></div>
          <div><Label>Margin Override % <span className="text-muted-foreground font-normal text-[11.5px]">(blank = default)</span></Label><Input type="number" step="0.01" value={form.target_margin_percent} onChange={(e) => set("target_margin_percent", e.target.value)} className="mt-1" /></div>

          <RecipeEditor
            ingredients={form.ingredients}
            sizes={form.sizes}
            basePrice={form.price}
            inventory={inventory}
            onIngredientsChange={setBaseIngs}
            onSizesChange={setSizes}
          />

          {breakdown && (
            <div className="col-span-2 rounded-xl border border-border/60 bg-muted/20 p-3.5">
              <div className="flex items-center gap-2 mb-2.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[12.5px] font-semibold">Suggested Price</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 text-[11.5px] mb-3">
                <div className="flex justify-between sm:block"><span className="text-muted-foreground">Ingredients</span> <span className="font-medium tabular-nums">${breakdown.ingredientCost.toFixed(2)}</span></div>
                <div className="flex justify-between sm:block"><span className="text-muted-foreground">Labor</span> <span className="font-medium tabular-nums">${breakdown.laborCost.toFixed(2)}</span></div>
                <div className="flex justify-between sm:block"><span className="text-muted-foreground">Packaging</span> <span className="font-medium tabular-nums">${breakdown.packagingCost.toFixed(2)}</span></div>
                <div className="flex justify-between sm:block"><span className="text-muted-foreground">Total Cost</span> <span className="font-medium tabular-nums">${breakdown.totalCost.toFixed(2)}</span></div>
              </div>
              <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
                <div className="text-[11.5px] text-muted-foreground">Margin {breakdown.marginPercent}% → <span className="font-semibold text-[14px] text-emerald-600 dark:text-emerald-400">${breakdown.suggestedPrice.toFixed(2)}</span></div>
                <Button type="button" variant="outline" size="sm" className="h-7 text-[12px]" onClick={() => set("price", breakdown.suggestedPrice.toFixed(2))}>Use This Price</Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !form.name} className="bg-rose-600 hover:bg-rose-700">{saving ? "Saving…" : isEdit ? "Save Changes" : "Add Recipe"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}