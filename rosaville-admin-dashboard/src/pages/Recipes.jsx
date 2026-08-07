import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { ChefHat, Search, TrendingUp, TrendingDown, Plus, Pencil, X } from "lucide-react";
import PageHeader, { EmptyState } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import IngredientRow from "@/components/admin/IngredientRow";
import { cn } from "@/lib/utils";
import { convertUnit } from "@/lib/ingredientCalc";

const CATEGORIES = ["Signature Cakes", "Custom Cakes", "Seasonal Specials", "Cupcakes", "Pastries", "Cheesecakes"];

export default function Recipes() {
  const [desserts, setDesserts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [d, i] = await Promise.all([
        base44.entities.Dessert.list("-display_order", 500),
        base44.entities.InventoryItem.list("-created_date", 500),
      ]);
      setDesserts(d); setInventory(i);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const withCosts = useMemo(() => desserts.map((d) => {
    const ingredientCost = (d.ingredients || []).reduce((sum, ing) => {
      const item = inventory.find((i) => i.id === ing.inventory_item_id);
      if (!item) return sum;
      const converted = convertUnit(ing.quantity || 0, ing.unit, item.unit);
      return sum + converted * (item.cost_per_unit || 0);
    }, 0);
    const price = d.price || 0;
    const margin = price - ingredientCost;
    const marginPct = price > 0 ? (margin / price) * 100 : 0;
    return { ...d, ingredientCost, margin, marginPct };
  }), [desserts, inventory]);

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
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="rounded-lg bg-muted/40 p-2 text-center"><div className="text-[10px] text-muted-foreground">Cost</div><div className="text-[13px] font-semibold mt-0.5">${d.ingredientCost.toFixed(2)}</div></div>
                <div className="rounded-lg bg-muted/40 p-2 text-center"><div className="text-[10px] text-muted-foreground">Margin</div><div className={cn("text-[13px] font-semibold mt-0.5", d.margin >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500")}>${d.margin.toFixed(2)}</div></div>
                <div className="rounded-lg bg-muted/40 p-2 text-center"><div className="text-[10px] text-muted-foreground">Margin %</div><div className={cn("text-[13px] font-semibold mt-0.5 flex items-center justify-center gap-0.5", d.marginPct >= 50 ? "text-emerald-600 dark:text-emerald-400" : d.marginPct >= 30 ? "text-amber-500" : "text-rose-500")}>
                  {d.marginPct >= 50 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{d.marginPct.toFixed(0)}%
                </div></div>
              </div>
              <div className="space-y-1">
                <div className="text-[10.5px] font-semibold text-muted-foreground uppercase mb-1">Base Ingredients</div>
                {(d.ingredients || []).map((ing, i) => {
                  const item = inventory.find((x) => x.id === ing.inventory_item_id);
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

      <RecipeDialog open={createOpen || !!editItem} item={editItem} inventory={inventory} onClose={() => { setCreateOpen(false); setEditItem(null); }} onSaved={load} />
    </div>
  );
}

function RecipeDialog({ open, item, inventory, onClose, onSaved }) {
  const isEdit = !!item;
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(item ? {
      ...item,
      ingredients: item.ingredients || [],
      sizes: (item.sizes || []).map((s) => ({ ...s, ingredients: s.ingredients || [] })),
    } : { name: "", category: "Signature Cakes", price: "", preparation_time: "", ingredients: [], sizes: [] });
  }, [open, item]);

  if (!form) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setBaseIngs = (ings) => set("ingredients", ings);
  const setSizes = (sizes) => set("sizes", sizes);
  const setSz = (idx, patch) => { const arr = [...form.sizes]; arr[idx] = { ...arr[idx], ...patch }; setSizes(arr); };

  const submit = async () => {
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price) || 0 };
      if (isEdit) await base44.entities.Dessert.update(item.id, payload);
      else await base44.entities.Dessert.create(payload);
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

          {/* Base ingredients */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <Label>Base Recipe <span className="text-muted-foreground font-normal text-[11.5px]">(Standard size — fallback for sizes without their own)</span></Label>
              <Button type="button" variant="outline" size="sm" className="h-7 text-[12px] gap-1" onClick={() => setBaseIngs([...(form.ingredients || []), { inventory_item_id: "", name: "", quantity: 1, unit: "kg" }])}><Plus className="w-3.5 h-3.5" /> Add Ingredient</Button>
            </div>
            <div className="space-y-2">
              {(form.ingredients || []).map((ing, idx) => (
                <IngredientRow key={idx} ing={ing} inventory={inventory}
                  onChange={(next) => { const arr = [...form.ingredients]; arr[idx] = next; setBaseIngs(arr); }}
                  onRemove={() => setBaseIngs(form.ingredients.filter((_, i) => i !== idx))} />
              ))}
              {(!form.ingredients || form.ingredients.length === 0) && <p className="text-[11.5px] text-muted-foreground italic">No ingredients added.</p>}
            </div>
          </div>

          {/* Size-specific ingredients */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <Label>Size Variants <span className="text-muted-foreground font-normal text-[11.5px]">(add ingredients per size to override the base)</span></Label>
              <Button type="button" variant="outline" size="sm" className="h-7 text-[12px] gap-1" onClick={() => setSizes([...(form.sizes || []), { label: "", multiplier: 1, price: form.price || 0, ingredients: [] }])}><Plus className="w-3.5 h-3.5" /> Add Size</Button>
            </div>
            <div className="space-y-2.5">
              {(form.sizes || []).map((sz, idx) => (
                <div key={idx} className="rounded-xl border border-border/60 p-3 bg-muted/10 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Input value={sz.label} onChange={(e) => setSz(idx, { label: e.target.value })} placeholder='e.g. Medium (8")' className="h-9 flex-1 text-[12.5px]" />
                    <div className="relative w-24">
                      <Input type="number" step="0.1" value={sz.multiplier} onChange={(e) => setSz(idx, { multiplier: Number(e.target.value) })} className="h-9 pr-12 text-[12.5px]" />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">×</span>
                    </div>
                    <div className="relative w-24">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">$</span>
                      <Input type="number" value={sz.price} onChange={(e) => setSz(idx, { price: Number(e.target.value) })} className="h-9 pl-5 text-[12.5px]" />
                    </div>
                    <button onClick={() => setSizes(form.sizes.filter((_, i) => i !== idx))} className="w-8 h-9 rounded-lg border border-border hover:bg-muted flex items-center justify-center shrink-0"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  </div>
                  <div className="pl-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-medium text-muted-foreground">Ingredients for this size</span>
                      <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] gap-1" onClick={() => setSz(idx, { ingredients: [...(sz.ingredients || []), { inventory_item_id: "", name: "", quantity: 1, unit: "kg" }] })}><Plus className="w-3 h-3" /> Add</Button>
                    </div>
                    <div className="space-y-2">
                      {(sz.ingredients || []).map((ing, i) => (
                        <IngredientRow key={i} ing={ing} inventory={inventory}
                          onChange={(next) => { const arr = [...(sz.ingredients || [])]; arr[i] = next; setSz(idx, { ingredients: arr }); }}
                          onRemove={() => setSz(idx, { ingredients: (sz.ingredients || []).filter((_, j) => j !== i) })} />
                      ))}
                      {(!sz.ingredients || sz.ingredients.length === 0) && <p className="text-[11px] text-muted-foreground italic">Uses base recipe × {sz.multiplier || 1}.</p>}
                    </div>
                  </div>
                </div>
              ))}
              {(!form.sizes || form.sizes.length === 0) && <p className="text-[11.5px] text-muted-foreground italic">No size variants — orders use the base recipe.</p>}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !form.name} className="bg-rose-600 hover:bg-rose-700">{saving ? "Saving…" : isEdit ? "Save Changes" : "Add Recipe"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}