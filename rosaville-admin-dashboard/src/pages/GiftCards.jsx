import React, { useState, useEffect, useMemo } from "react";
import { entities, adjustGiftCard, voidGiftCard } from "@/lib/api";
import { Gift, Search, Plus, Ban, History, User, Mail } from "lucide-react";
import PageHeader, { EmptyState } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 10; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `${code.slice(0, 5)}-${code.slice(5)}`;
}

function IssueDialog({ open, onClose, onIssued }) {
  const [form, setForm] = useState({ code: randomCode(), initial_balance: "25", recipient_name: "", recipient_email: "", purchaser_name: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => { if (open) setForm({ code: randomCode(), initial_balance: "25", recipient_name: "", recipient_email: "", purchaser_name: "" }); }, [open]);

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const card = await entities.GiftCard.create({ ...form, initial_balance: Number(form.initial_balance) || 0 });
      onIssued(card);
    } catch (e) {
      setError(e.message || "Could not issue this gift card.");
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Issue Gift Card</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-[12px]">Code</Label>
            <Input value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} className="mt-1 font-mono" />
          </div>
          <div>
            <Label className="text-[12px]">Amount ($)</Label>
            <Input type="number" step="0.01" min="0.01" value={form.initial_balance} onChange={(e) => set("initial_balance", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-[12px]">Recipient Name</Label>
            <Input value={form.recipient_name} onChange={(e) => set("recipient_name", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-[12px]">Recipient Email</Label>
            <Input type="email" value={form.recipient_email} onChange={(e) => set("recipient_email", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-[12px]">Purchased By</Label>
            <Input value={form.purchaser_name} onChange={(e) => set("purchaser_name", e.target.value)} className="mt-1" />
          </div>
          {error && <p className="text-[12.5px] text-rose-600">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !form.code || !(Number(form.initial_balance) > 0)} className="bg-rose-600 hover:bg-rose-700">
            {saving ? "Issuing…" : "Issue Card"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function GiftCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [issueOpen, setIssueOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState("");

  const load = async () => {
    setLoading(true);
    try { setCards(await entities.GiftCard.list("-created_date", 500)); }
    catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => cards.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.code?.toLowerCase().includes(q) || c.recipient_name?.toLowerCase().includes(q) || c.purchaser_name?.toLowerCase().includes(q);
  }), [cards, search]);

  const onIssued = (card) => {
    setCards((p) => [card, ...p]);
    setIssueOpen(false);
  };

  const applyAdjust = async (delta) => {
    if (!selected || !delta) return;
    try {
      const updated = await adjustGiftCard(selected.id, delta);
      setCards((p) => p.map((c) => (c.id === updated.id ? updated : c)));
      setSelected(updated);
      setAdjustAmount("");
    } catch (e) {
      alert(e.message || "Could not adjust this gift card's balance.");
    }
  };

  const doVoid = async () => {
    if (!selected || !confirm(`Void gift card ${selected.code}? It will no longer be redeemable.`)) return;
    const updated = await voidGiftCard(selected.id);
    setCards((p) => p.map((c) => (c.id === updated.id ? updated : c)));
    setSelected(updated);
  };

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Gift Cards"
        description={`${cards.filter((c) => c.is_active && Number(c.current_balance) > 0).length} active · ${cards.length} total issued`}
        icon={Gift}
        actions={<Button onClick={() => setIssueOpen(true)} className="gap-2 bg-rose-600 hover:bg-rose-700"><Plus className="w-4 h-4" /> Issue Gift Card</Button>}
      />

      <div className="relative mb-5 max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by code, recipient, or purchaser…" className="pl-9 h-10" />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Gift} title="No gift cards yet" description="Issue a gift card to get started." action={<Button onClick={() => setIssueOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Issue Gift Card</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border/60 text-left text-[11.5px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Recipient</th>
                  <th className="px-4 py-3 font-medium">Balance</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelected(c)}>
                    <td className="px-4 py-3 font-mono">{c.code}</td>
                    <td className="px-4 py-3">
                      <div>{c.recipient_name || "—"}</div>
                      <div className="text-[11.5px] text-muted-foreground">{c.recipient_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">${Number(c.current_balance).toFixed(2)}</span>
                      <span className="text-[11.5px] text-muted-foreground"> / ${Number(c.initial_balance).toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold",
                        !c.is_active ? "bg-slate-500/12 text-slate-600 dark:text-slate-400"
                          : Number(c.current_balance) <= 0 ? "bg-amber-500/12 text-amber-600 dark:text-amber-400"
                          : "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400")}>
                        {!c.is_active ? "Voided" : Number(c.current_balance) <= 0 ? "Depleted" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">→</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-mono">{selected.code}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2 text-[13px]">
              <div className="rounded-xl bg-muted/40 p-3 text-center">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">Current Balance</div>
                <div className="text-[26px] font-heading font-semibold">${Number(selected.current_balance).toFixed(2)}</div>
                <div className="text-[11.5px] text-muted-foreground">of ${Number(selected.initial_balance).toFixed(2)} issued</div>
              </div>

              <div className="grid grid-cols-1 gap-1.5 text-[12.5px]">
                {selected.recipient_name && <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-muted-foreground" /> {selected.recipient_name}</div>}
                {selected.recipient_email && <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-muted-foreground" /> {selected.recipient_email}</div>}
                {selected.purchaser_name && <div className="text-muted-foreground">Purchased by {selected.purchaser_name}</div>}
              </div>

              {selected.is_active && (
                <div className="rounded-xl border border-border/60 p-3 space-y-2">
                  <Label className="text-[12px]">Manually Adjust Balance</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" step="0.01" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)}
                      placeholder="e.g. 10 or -5" className="h-9 text-[12.5px]" />
                    <Button size="sm" variant="outline" onClick={() => applyAdjust(Number(adjustAmount))} disabled={!adjustAmount}>Apply</Button>
                  </div>
                </div>
              )}

              {selected.redemption_history?.length > 0 && (
                <div>
                  <Label className="text-[12px] mb-1.5 flex items-center gap-1.5"><History className="w-3.5 h-3.5" /> Redemption History</Label>
                  <div className="space-y-1.5">
                    {selected.redemption_history.map((r, i) => (
                      <div key={i} className="rounded-lg bg-muted/40 px-2.5 py-1.5 text-[12px] flex items-center justify-between">
                        <span>Order {r.order_number || `#${r.order_id}`}</span>
                        <span className="text-muted-foreground">${Number(r.amount).toFixed(2)} · {new Date(r.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              {selected.is_active && (
                <Button variant="outline" onClick={doVoid} className="text-rose-600 hover:bg-rose-50 gap-2"><Ban className="w-4 h-4" /> Void</Button>
              )}
              <Button onClick={() => setSelected(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <IssueDialog open={issueOpen} onClose={() => setIssueOpen(false)} onIssued={onIssued} />
    </div>
  );
}
