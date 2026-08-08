import React, { useState, useEffect, useMemo } from "react";
import { entities } from '@/lib/api';
import { Cake, Search, Mail, Phone, Trash2, Calendar, DollarSign, ArrowRightCircle, Image as ImageIcon } from "lucide-react";
import PageHeader, { StatusBadge, EmptyState } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const STATUSES = ["New", "Reviewed", "Quoted", "Confirmed", "In Production", "Completed", "Cancelled"];

export default function CustomCakeOrders() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try { setRequests(await entities.CustomCakeOrder.list("-created_date", 500)); }
    catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => requests.filter((r) => {
    const ms = !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.occasion?.toLowerCase().includes(search.toLowerCase());
    const mc = statusFilter === "All" || r.status === statusFilter;
    return ms && mc;
  }), [requests, search, statusFilter]);

  const patch = async (id, data) => {
    const updated = await entities.CustomCakeOrder.update(id, data);
    setRequests((p) => p.map((r) => (r.id === id ? updated : r)));
    setSelected((s) => (s?.id === id ? updated : s));
  };

  const remove = async (r) => {
    if (!confirm(`Delete the custom cake request from ${r.name}?`)) return;
    await entities.CustomCakeOrder.delete(r.id);
    setRequests((p) => p.filter((x) => x.id !== r.id));
    setSelected(null);
  };

  const convertToOrder = async (r) => {
    if (r.order) return;
    try {
      const order = await entities.Order.create({
        customer_name: r.name,
        email: r.email,
        phone: r.phone,
        items: [{ name: `Custom Cake — ${r.occasion}`, quantity: 1, price: Number(r.deposit_amount) || 0 }],
        total_value: Number(r.deposit_amount) || 0,
        delivery_date: r.preferred_date || null,
        channel: "Website",
        internal_notes: `Custom cake request: ${r.cake_size}, ${r.flavor}. ${r.custom_requests || ""}`.trim(),
      });
      await patch(r.id, { order: order.id, status: "Confirmed" });
    } catch (e) {
      console.error(e);
      alert("Could not create the order. Please try again.");
    }
  };

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Custom Cake Orders"
        description={`${requests.filter(r => r.status === "New").length} new · ${requests.length} total requests`}
        icon={Cake}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or occasion…" className="pl-9 h-10" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {["All", ...STATUSES].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn("px-3 py-1.5 rounded-lg text-[12.5px] font-medium whitespace-nowrap border transition-colors",
                statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground")}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Cake} title="No custom cake requests" description="Requests submitted from your website's Custom Cakes form will appear here." />
        ) : (
          <>
          <div className="md:hidden divide-y divide-border/40">
            {filtered.map((r) => (
              <button key={r.id} onClick={() => setSelected(r)} className="w-full text-left p-4 hover:bg-muted/30">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium text-[13.5px] truncate">{r.name}</span>
                  <StatusBadge status={r.status} />
                </div>
                <div className="text-[12.5px] text-foreground truncate">{r.occasion} · {r.cake_size} · {r.flavor}</div>
                <div className="flex items-center justify-between mt-1.5 gap-2">
                  <span className="text-[11.5px] text-muted-foreground truncate">{r.email || "—"}</span>
                  <span className="text-[11.5px] text-muted-foreground whitespace-nowrap">{r.preferred_date || "—"}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border/60 text-left text-[11.5px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Occasion / Cake</th>
                  <th className="px-4 py-3 font-medium">Needed By</th>
                  <th className="px-4 py-3 font-medium">Deposit</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelected(r)}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.name}</div>
                      <div className="text-[11.5px] text-muted-foreground">{r.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{r.occasion}</div>
                      <div className="text-[11.5px] text-muted-foreground">{r.cake_size} · {r.flavor}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.preferred_date || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {Number(r.deposit_amount) > 0 ? `$${Number(r.deposit_amount).toFixed(2)}${r.deposit_paid ? " ✓" : ""}` : "—"}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-right text-muted-foreground">→</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {selected && (
        <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{selected.occasion} — {selected.name}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2 text-[13px]">
              <div className="flex flex-wrap gap-3 text-[12px] text-muted-foreground">
                {selected.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {selected.email}</span>}
                {selected.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {selected.phone}</span>}
                {selected.preferred_date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {selected.preferred_date}</span>}
              </div>

              <div className="rounded-xl bg-muted/40 p-3 grid grid-cols-2 gap-2 text-[12.5px]">
                <div><span className="text-muted-foreground">Size:</span> {selected.cake_size}</div>
                <div><span className="text-muted-foreground">Flavor:</span> {selected.flavor}</div>
              </div>

              {selected.custom_requests && (
                <div className="rounded-xl bg-muted/40 p-3 text-[12.5px] leading-relaxed">{selected.custom_requests}</div>
              )}

              {selected.inspiration_image_url && (
                <a href={selected.inspiration_image_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[12px] text-primary hover:underline">
                  <ImageIcon className="w-3.5 h-3.5" /> View inspiration image
                </a>
              )}

              <div className="rounded-xl border border-border/60 p-3 space-y-2.5">
                <Label className="text-[12px] flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Deposit</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number" step="0.01" value={selected.deposit_amount}
                    onChange={(e) => setSelected({ ...selected, deposit_amount: e.target.value })}
                    onBlur={(e) => patch(selected.id, { deposit_amount: e.target.value || 0 })}
                    className="h-9 w-32 text-[12.5px]"
                  />
                  <label className="flex items-center gap-2 text-[12.5px]">
                    <Switch checked={selected.deposit_paid} onCheckedChange={(v) => patch(selected.id, { deposit_paid: v })} /> Paid
                  </label>
                </div>
              </div>

              <div>
                <Label className="text-[12px] mb-1.5 block">Status</Label>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map((s) => (
                    <button key={s} onClick={() => patch(selected.id, { status: s })}
                      className={cn("px-2.5 py-1 rounded-lg text-[11.5px] font-medium border",
                        selected.status === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground")}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border/60 p-3">
                {selected.order ? (
                  <div className="text-[12.5px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <ArrowRightCircle className="w-4 h-4" /> Converted to Order #{selected.order}
                  </div>
                ) : (
                  <Button size="sm" variant="outline" className="gap-2 w-full" onClick={() => convertToOrder(selected)}>
                    <ArrowRightCircle className="w-3.5 h-3.5" /> Convert to Order
                  </Button>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => remove(selected)} className="text-rose-600 hover:bg-rose-50"><Trash2 className="w-4 h-4" /> Delete</Button>
              <Button onClick={() => setSelected(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
