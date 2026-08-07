import React, { useState, useEffect } from "react";
import { entities } from '@/lib/api';
import { Sparkles, Plus, Archive, Star } from "lucide-react";
import PageHeader, { EmptyState } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function SpecialOfMonth() {
  const [specials, setSpecials] = useState([]);
  const [desserts, setDesserts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, d] = await Promise.all([
        entities.SpecialOfMonth.list("-created_date", 100),
        entities.Dessert.list("-display_order", 500),
      ]);
      setSpecials(s);
      setDesserts(d);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const current = specials.find((s) => s.is_active);
  const archive = specials.filter((s) => !s.is_active);

  const archiveCurrent = async (s) => {
    if (!confirm(`Archive "${s.display_title}"? It will no longer show on the website.`)) return;
    await entities.SpecialOfMonth.update(s.id, { is_active: false });
    load();
  };

  const reactivate = async (s) => {
    await entities.SpecialOfMonth.update(s.id, { is_active: true });
    load();
  };

  return (
    <div className="p-5 lg:p-8 max-w-[1000px] mx-auto">
      <PageHeader
        title="Special of the Month"
        description="The featured dessert shown on your homepage and its own page on the public site."
        icon={Sparkles}
        actions={<Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Set New Special</Button>}
      />

      {loading ? (
        <div className="p-12 flex justify-center"><div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <>
          <h3 className="font-heading font-semibold text-[14px] text-muted-foreground mb-2.5">Currently Live</h3>
          {!current ? (
            <div className="rounded-2xl border border-border/60 bg-card mb-8">
              <EmptyState icon={Sparkles} title="No special set" description="Pick a dessert to feature this month." action={<Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Set New Special</Button>} />
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-rose-500/40 bg-card overflow-hidden mb-8 flex flex-col sm:flex-row">
              <div className="w-full sm:w-56 h-40 sm:h-auto bg-muted shrink-0">
                <img src={current.dessert_detail?.featured_image || "/placeholder-dessert.svg"} alt={current.display_title} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/12 text-rose-600 dark:text-rose-400 text-[10.5px] font-semibold flex items-center gap-1"><Star className="w-2.5 h-2.5 fill-current" /> LIVE NOW</span>
                  <span className="text-[11.5px] text-muted-foreground">{current.month_label}</span>
                </div>
                <h2 className="font-heading font-bold text-[19px] mb-1.5">{current.display_title}</h2>
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 line-clamp-3">{current.display_story}</p>
                <Button size="sm" variant="outline" className="gap-2" onClick={() => archiveCurrent(current)}>
                  <Archive className="w-3.5 h-3.5" /> Archive
                </Button>
              </div>
            </div>
          )}

          <h3 className="font-heading font-semibold text-[14px] text-muted-foreground mb-2.5">Past Specials</h3>
          {archive.length === 0 ? (
            <p className="text-[12.5px] text-muted-foreground italic">No archived specials yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {archive.map((s) => (
                <div key={s.id} className="rounded-xl border border-border/60 bg-card overflow-hidden">
                  <div className="h-28 bg-muted">
                    <img src={s.dessert_detail?.featured_image || "/placeholder-dessert.svg"} alt={s.display_title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <div className="text-[11px] text-muted-foreground mb-0.5">{s.month_label}</div>
                    <div className="font-heading font-semibold text-[13.5px] mb-2 line-clamp-1">{s.display_title}</div>
                    <button onClick={() => reactivate(s)} className="text-[11.5px] font-medium text-rose-600 hover:underline">Make live again</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <SetSpecialDialog open={createOpen} onClose={() => setCreateOpen(false)} desserts={desserts} onSaved={load} />
    </div>
  );
}

function SetSpecialDialog({ open, onClose, desserts, onSaved }) {
  const [dessertId, setDessertId] = useState("");
  const [monthLabel, setMonthLabel] = useState("");
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDessertId("");
      setMonthLabel(new Date().toLocaleString("en-US", { month: "long", year: "numeric" }));
      setTitle("");
      setStory("");
    }
  }, [open]);

  const submit = async () => {
    setSaving(true);
    try {
      await entities.SpecialOfMonth.create({
        dessert: Number(dessertId),
        month_label: monthLabel,
        title,
        story,
        is_active: true,
      });
      onSaved();
      onClose();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Set New Special of the Month</DialogTitle></DialogHeader>
        <p className="text-[12.5px] text-muted-foreground -mt-2">This replaces whatever is currently live on the website.</p>
        <div className="grid gap-3 py-2">
          <div>
            <Label>Dessert *</Label>
            <select value={dessertId} onChange={(e) => setDessertId(e.target.value)} className="mt-1 w-full h-9 px-3 rounded-lg border border-input bg-card text-[13px]">
              <option value="">Select a dessert…</option>
              {desserts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div><Label>Label</Label><Input value={monthLabel} onChange={(e) => setMonthLabel(e.target.value)} className="mt-1" placeholder="e.g. August 2026" /></div>
          <div><Label>Display Title <span className="text-muted-foreground font-normal">(optional — defaults to dessert name)</span></Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" /></div>
          <div><Label>Story <span className="text-muted-foreground font-normal">(optional — defaults to dessert description)</span></Label><Textarea value={story} onChange={(e) => setStory(e.target.value)} className="mt-1" rows={4} placeholder="Tell customers why this month's pick is special…" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !dessertId} className="bg-rose-600 hover:bg-rose-700">{saving ? "Saving…" : "Set as Live"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
