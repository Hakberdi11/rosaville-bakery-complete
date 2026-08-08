import React, { useState, useEffect } from "react";
import { entities, uploadFile } from '@/lib/api';
import { Cake, Plus, Search, Pencil, Trash2, Star, Copy, Upload, Link2 } from "lucide-react";
import PageHeader, { EmptyState } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";
import RecipeEditor from "@/components/admin/RecipeEditor";

const CATEGORIES = ["Signature Cakes", "Custom Cakes", "Seasonal Specials", "Cupcakes", "Pastries", "Cheesecakes"];
const SAMPLE_IMAGES = [
  "/placeholder-dessert.svg",
  "/placeholder-dessert.svg",
  "/placeholder-dessert.svg",
  "/placeholder-dessert.svg",
];

export default function Desserts() {
  const [desserts, setDesserts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [editItem, setEditItem] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [d, i] = await Promise.all([
        entities.Dessert.list("-display_order", 500),
        entities.InventoryItem.list("-created_date", 500),
      ]);
      setDesserts(d); setInventory(i);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = desserts.filter((d) => {
    const ms = !search || d.name?.toLowerCase().includes(search.toLowerCase());
    const mc = categoryFilter === "All" || d.category === categoryFilter;
    return ms && mc;
  });

  const remove = async (d) => {
    if (!confirm(`Delete "${d.name}"?`)) return;
    await entities.Dessert.delete(d.id);
    setDesserts((p) => p.filter((x) => x.id !== d.id));
  };

  const duplicate = async (d) => {
    const { id, created_date, updated_date, created_by_id, ...rest } = d;
    await entities.Dessert.create({ ...rest, name: `${d.name} (Copy)`, display_order: (d.display_order || 0) + 1 });
    load();
  };

  const toggleFeatured = async (d) => {
    await entities.Dessert.update(d.id, { featured: !d.featured });
    setDesserts((p) => p.map((x) => (x.id === d.id ? { ...x, featured: !x.featured } : x)));
  };

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Desserts"
        description={`${desserts.length} products · ${desserts.filter((d) => d.featured).length} featured`}
        icon={Cake}
        actions={<Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Add Dessert</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search desserts…" className="pl-9 h-10" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {["All", ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCategoryFilter(c)}
              className={cn("px-3 py-1.5 rounded-lg text-[12.5px] font-medium whitespace-nowrap border transition-colors",
                categoryFilter === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground")}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card">
          <EmptyState icon={Cake} title="No desserts yet" description="Add your first product to start building the catalog." action={<Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Add Dessert</Button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((d) => (
            <div key={d.id} className="group rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-md transition-all">
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                <Image src={d.featured_image || d.images?.[0] || SAMPLE_IMAGES[0]} alt={d.name} fittingType="fill" className="w-full h-full" />
                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                  {d.featured && <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-semibold flex items-center gap-1"><Star className="w-2.5 h-2.5 fill-white" /> Featured</span>}
                  {d.seasonal && <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-semibold">Seasonal</span>}
                  {!d.availability && <span className="px-2 py-0.5 rounded-full bg-slate-700 text-white text-[10px] font-semibold">Archived</span>}
                </div>
                <div className="absolute top-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleFeatured(d)} className="w-7 h-7 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur flex items-center justify-center hover:bg-white"><Star className={cn("w-3.5 h-3.5", d.featured ? "fill-amber-500 text-amber-500" : "text-slate-500")} /></button>
                  <button onClick={() => setEditItem(d)} className="w-7 h-7 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur flex items-center justify-center hover:bg-white"><Pencil className="w-3.5 h-3.5 text-slate-500" /></button>
                  <button onClick={() => duplicate(d)} className="w-7 h-7 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur flex items-center justify-center hover:bg-white"><Copy className="w-3.5 h-3.5 text-slate-500" /></button>
                  <button onClick={() => remove(d)} className="w-7 h-7 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur flex items-center justify-center hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5 text-rose-500" /></button>
                </div>
              </div>
              <div className="p-3.5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-heading font-semibold text-[14.5px] leading-tight line-clamp-1">{d.name}</h3>
                  <span className="text-[14px] font-semibold tabular-nums whitespace-nowrap">${(d.price || 0).toFixed(2)}</span>
                </div>
                <div className="text-[11.5px] text-muted-foreground mb-2">{d.category}</div>
                <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">{d.description}</p>
                <div className="flex items-center gap-2 mt-2.5 text-[11px]">
                  {d.ingredients?.length > 0 ? (
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">{d.ingredients.length} ingredients</span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">No ingredients set</span>
                  )}
                  {d.sizes?.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium">{d.sizes.length} sizes</span>
                  )}
                  {d.allergens?.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">{d.allergens.length} allergens</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DessertDialog open={createOpen || !!editItem} item={editItem} inventory={inventory} onClose={() => { setCreateOpen(false); setEditItem(null); }} onSaved={load} />
    </div>
  );
}

function DessertDialog({ open, item, inventory, onClose, onSaved }) {
  const isEdit = !!item;
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(item || {
        name: "", category: "Signature Cakes", description: "", price: "",
        featured_image: "", images: [], ingredients: [], sizes: [],
        allergens: [], preparation_time: "", tags: [],
        availability: true, featured: false, seasonal: false, display_order: 0,
      });
    }
  }, [open, item]);

  if (!form) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setList = (k, v) => set(k, v.split(",").map((s) => s.trim()).filter(Boolean));

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await uploadFile(file);
      set("featured_image", file_url);
    } catch (err) { console.error(err); }
    setUploading(false);
  };

  const submit = async () => {
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price) || 0 };
      if (!payload.featured_image && payload.images?.length) payload.featured_image = payload.images[0];
      if (isEdit) await entities.Dessert.update(item.id, payload);
      else await entities.Dessert.create(payload);
      onSaved(); onClose();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "Edit Dessert" : "Add New Dessert"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
          <div className="col-span-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1" /></div>
          <div><Label>Category</Label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className="mt-1 w-full h-9 px-3 rounded-lg border border-input bg-card text-[13px]">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><Label>Base Price ($)</Label><Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} className="mt-1" /></div>
          <div className="col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="mt-1" rows={2} /></div>

          {/* Image: upload OR url */}
          <div className="col-span-2">
            <Label>Product Image</Label>
            <div className="mt-1 flex gap-3">
              <div className="w-24 h-24 rounded-xl border border-border bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                {form.featured_image
                  ? <img src={form.featured_image} alt="preview" className="w-full h-full object-cover" />
                  : <Cake className="w-7 h-7 text-muted-foreground/40" />}
              </div>
              <div className="flex-1 space-y-2">
                <label className="flex items-center gap-2 h-9 px-3 rounded-lg border border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted text-[12.5px] font-medium w-fit">
                  {uploading ? <span>Uploading…</span> : <><Upload className="w-3.5 h-3.5" /> Upload image</>}
                  <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
                </label>
                <div className="relative">
                  <Link2 className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={form.featured_image} onChange={(e) => set("featured_image", e.target.value)} placeholder="…or paste image URL" className="pl-8 h-9 text-[12.5px]" />
                </div>
                <p className="text-[11px] text-muted-foreground">Both optional — upload a file or paste a URL.</p>
              </div>
            </div>
          </div>

          <RecipeEditor
            ingredients={form.ingredients}
            sizes={form.sizes}
            basePrice={form.price}
            inventory={inventory}
            onIngredientsChange={(ings) => set("ingredients", ings)}
            onSizesChange={(sizes) => set("sizes", sizes)}
          />

          <div className="col-span-2"><Label>Allergens (comma separated)</Label><Input value={form.allergens?.join(", ")} onChange={(e) => setList("allergens", e.target.value)} className="mt-1" /></div>
          <div><Label>Preparation Time</Label><Input value={form.preparation_time} onChange={(e) => set("preparation_time", e.target.value)} className="mt-1" placeholder="e.g. 2 hours" /></div>
          <div><Label>Tags (comma separated)</Label><Input value={form.tags?.join(", ")} onChange={(e) => setList("tags", e.target.value)} className="mt-1" /></div>
          <div className="col-span-2 flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-[13px] font-medium"><Switch checked={form.availability} onCheckedChange={(v) => set("availability", v)} /> Available</label>
            <label className="flex items-center gap-2 text-[13px] font-medium"><Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} /> Featured</label>
            <label className="flex items-center gap-2 text-[13px] font-medium"><Switch checked={form.seasonal} onCheckedChange={(v) => set("seasonal", v)} /> Seasonal</label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !form.name} className="bg-rose-600 hover:bg-rose-700">{saving ? "Saving…" : isEdit ? "Save Changes" : "Add Dessert"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// IngredientRow is imported from @/components/admin/IngredientRow