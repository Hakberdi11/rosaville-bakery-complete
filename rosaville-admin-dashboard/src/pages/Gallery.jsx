import React, { useState, useEffect } from "react";
import { entities, auth } from '@/lib/api';
import { useAuth } from "@/lib/AuthContext";
import { Image as ImageIcon, Search, X, Plus, Check, Settings2 } from "lucide-react";
import PageHeader, { EmptyState } from "@/components/admin/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Signature Cakes", "Custom Cakes", "Seasonal Specials", "Cupcakes", "Pastries", "Cheesecakes"];

export default function Gallery() {
  const { user, checkUserAuth } = useAuth();
  const [desserts, setDesserts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [lightbox, setLightbox] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [maxOpen, setMaxOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setDesserts(await entities.Dessert.list("-display_order", 500)); }
    catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const maxItems = user?.max_gallery_items ?? 12;
  const galleryDesserts = desserts.filter((d) => d.in_gallery);

  const filtered = galleryDesserts.filter((d) => {
    const ms = !search || d.name?.toLowerCase().includes(search.toLowerCase());
    const mc = category === "All" || d.category === category;
    return ms && mc;
  });

  const removeFromGallery = async (d) => {
    await entities.Dessert.update(d.id, { in_gallery: false });
    setDesserts((p) => p.map((x) => (x.id === d.id ? { ...x, in_gallery: false } : x)));
  };

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Gallery"
        description={`${galleryDesserts.length} of ${maxItems} slots used · click an image to view full size`}
        icon={ImageIcon}
        actions={
          <>
            <Button size="sm" variant="outline" className="gap-2" onClick={() => setMaxOpen(true)}>
              <Settings2 className="w-4 h-4" /> Max Items
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-rose-600 hover:bg-rose-700"
              disabled={galleryDesserts.length >= maxItems}
              onClick={() => setPickerOpen(true)}
            >
              <Plus className="w-4 h-4" /> Add from Menu
            </Button>
          </>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search gallery…" className="pl-9 h-10" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={cn("px-3 py-1.5 rounded-lg text-[12.5px] font-medium whitespace-nowrap border transition-colors",
                category === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground")}>{c}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card">
          <EmptyState
            icon={ImageIcon}
            title="No gallery images yet"
            description="Use “Add from Menu” to pick desserts to showcase here."
            action={<Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={() => setPickerOpen(true)}><Plus className="w-4 h-4" /> Add from Menu</Button>}
          />
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {filtered.map((d) => {
            const src = d.featured_image || d.images?.[0];
            return (
              <div key={d.id} className="break-inside-avoid rounded-2xl overflow-hidden border border-border/60 bg-card cursor-pointer group relative">
                <div onClick={() => setLightbox({ src, name: d.name })}>
                  <Image src={src} alt={d.name} fittingType="fill" className="w-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-white text-[12px] font-medium">{d.name}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFromGallery(d); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-white"
                  title="Remove from gallery"
                >
                  <X className="w-3.5 h-3.5 text-rose-500" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><X className="w-5 h-5 text-white" /></button>
          <img src={lightbox.src} alt={lightbox.name} className="max-w-full max-h-full rounded-xl object-contain" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-[14px] font-medium">{lightbox.name}</div>
        </div>
      )}

      <AddFromMenuDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        desserts={desserts}
        maxItems={maxItems}
        currentCount={galleryDesserts.length}
        onAdded={load}
      />
      <MaxItemsDialog open={maxOpen} onClose={() => setMaxOpen(false)} current={maxItems} onSaved={checkUserAuth} />
    </div>
  );
}

function AddFromMenuDialog({ open, onClose, desserts, maxItems, currentCount, onAdded }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) { setSearch(""); setSelected([]); } }, [open]);

  const candidates = desserts.filter((d) => !d.in_gallery && (d.featured_image || d.images?.length));
  const filtered = candidates.filter((d) => !search || d.name?.toLowerCase().includes(search.toLowerCase()));
  const remaining = maxItems - currentCount;
  const atLimit = selected.length >= remaining;

  const toggle = (d) => {
    setSelected((prev) => {
      if (prev.includes(d.id)) return prev.filter((id) => id !== d.id);
      if (prev.length >= remaining) return prev;
      return [...prev, d.id];
    });
  };

  const submit = async () => {
    setSaving(true);
    try {
      await Promise.all(selected.map((id) => entities.Dessert.update(id, { in_gallery: true })));
      onAdded();
      onClose();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader><DialogTitle>Add from Menu</DialogTitle></DialogHeader>
        <p className="text-[12.5px] text-muted-foreground -mt-2">
          {remaining > 0 ? `${remaining} slot${remaining === 1 ? "" : "s"} remaining · ${selected.length} selected` : "Gallery is full — remove an item or raise the max first."}
        </p>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search desserts…" className="pl-9 h-9" />
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5 min-h-[200px]">
          {filtered.length === 0 && (
            <p className="text-[12.5px] text-muted-foreground italic py-6 text-center">
              {candidates.length === 0 ? "Every dessert with a photo is already in the gallery." : "No matches."}
            </p>
          )}
          {filtered.map((d) => {
            const isSelected = selected.includes(d.id);
            const disabled = !isSelected && atLimit;
            return (
              <button
                key={d.id}
                type="button"
                disabled={disabled}
                onClick={() => toggle(d)}
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-lg border text-left transition-colors",
                  isSelected ? "border-primary bg-primary/5" : "border-border/60 hover:bg-muted/50",
                  disabled && "opacity-40 cursor-not-allowed"
                )}
              >
                <div className="w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0">
                  <img src={d.featured_image || d.images?.[0]} alt={d.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate">{d.name}</div>
                  <div className="text-[11px] text-muted-foreground">{d.category}</div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || selected.length === 0} className="bg-rose-600 hover:bg-rose-700">
            {saving ? "Adding…" : `Add ${selected.length || ""} to Gallery`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MaxItemsDialog({ open, onClose, current, onSaved }) {
  const [value, setValue] = useState(current);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) setValue(current); }, [open, current]);

  const submit = async () => {
    setSaving(true);
    try {
      await auth.updateMe({ max_gallery_items: Number(value) || 1 });
      await onSaved();
      onClose();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Maximum Gallery Items</DialogTitle></DialogHeader>
        <p className="text-[12.5px] text-muted-foreground">Caps how many desserts can be featured in the gallery at once.</p>
        <Input type="number" min="1" value={value} onChange={(e) => setValue(e.target.value)} className="mt-1" />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving} className="bg-rose-600 hover:bg-rose-700">{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
