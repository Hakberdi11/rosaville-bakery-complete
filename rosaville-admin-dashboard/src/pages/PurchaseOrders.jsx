import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { entities, receivePurchaseOrder } from '@/lib/api';
import { ClipboardList, Plus, Search, X, Truck, CheckCircle2 } from "lucide-react";
import PageHeader, { StatusBadge, EmptyState } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const STATUSES = ["Draft", "Sent", "Partially Received", "Received", "Cancelled"];

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [prefillItem, setPrefillItem] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const load = async () => {
    setLoading(true);
    try {
      const [o, s, i] = await Promise.all([
        entities.PurchaseOrder.list("-created_date", 500),
        entities.Supplier.list("name", 500),
        entities.InventoryItem.list("-created_date", 500),
      ]);
      setOrders(o); setSuppliers(s); setInventory(i);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const itemId = searchParams.get("prefill_item");
    if (itemId && inventory.length > 0) {
      const item = inventory.find((i) => String(i.id) === itemId);
      if (item) {
        setPrefillItem(item);
        setCreateOpen(true);
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, inventory, setSearchParams]);

  const filtered = useMemo(() => orders.filter((o) => {
    const ms = !search || o.reference?.toLowerCase().includes(search.toLowerCase()) || o.supplier_name?.toLowerCase().includes(search.toLowerCase());
    const mc = statusFilter === "All" || o.status === statusFilter;
    return ms && mc;
  }), [orders, search, statusFilter]);

  const patch = async (id, data) => {
    const updated = await entities.PurchaseOrder.update(id, data);
    setOrders((p) => p.map((o) => (o.id === id ? updated : o)));
    setSelected((s) => (s?.id === id ? updated : s));
  };

  // For the receive flow: the /receive/ action already returns the updated
  // order — this only merges that into local state, it must NOT re-PATCH
  // (a redundant PATCH would re-send the order's lines through the nested
  // serializer's replace-on-update path and reset quantity_received to 0).
  const applyLocalUpdate = (id, updated) => {
    setOrders((p) => p.map((o) => (o.id === id ? updated : o)));
    setSelected((s) => (s?.id === id ? updated : s));
  };

  const lineTotal = (o) => (o.lines || []).reduce((s, l) => s + Number(l.quantity_ordered) * Number(l.unit_cost), 0);

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Purchase Orders"
        description={`${orders.length} purchase order${orders.length === 1 ? "" : "s"}`}
        icon={ClipboardList}
        actions={<Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={() => { setPrefillItem(null); setCreateOpen(true); }}><Plus className="w-4 h-4" /> New Purchase Order</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by reference or supplier…" className="pl-9 h-10" />
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
          <EmptyState icon={ClipboardList} title="No purchase orders" description="Create a purchase order to restock ingredients from a supplier." action={<Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> New Purchase Order</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border/60 text-left text-[11.5px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Supplier</th>
                  <th className="px-4 py-3 font-medium">Lines</th>
                  <th className="px-4 py-3 font-medium">Total Value</th>
                  <th className="px-4 py-3 font-medium">Expected</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelected(o)}>
                    <td className="px-4 py-3 font-mono">{o.reference}</td>
                    <td className="px-4 py-3">{o.supplier_name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{(o.lines || []).length}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">${lineTotal(o).toFixed(2)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.expected_date ? new Date(o.expected_date).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-right text-muted-foreground">→</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {createOpen && (
        <CreatePODialog
          suppliers={suppliers}
          inventory={inventory}
          prefillItem={prefillItem}
          onClose={() => { setCreateOpen(false); setPrefillItem(null); }}
          onCreated={load}
        />
      )}

      {selected && (
        <PODetailDialog
          order={selected}
          onClose={() => setSelected(null)}
          onPatch={patch}
          onReceived={applyLocalUpdate}
        />
      )}
    </div>
  );
}

function CreatePODialog({ suppliers, inventory, prefillItem, onClose, onCreated }) {
  const [form, setForm] = useState({
    supplier: "",
    expected_date: "",
    notes: "",
    lines: prefillItem
      ? [{ inventory_item: prefillItem.id, quantity_ordered: Number(prefillItem.reorder_quantity) || Number(prefillItem.minimum_stock) * 2 || 10, unit_cost: Number(prefillItem.cost_per_unit) || 0 }]
      : [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prefillItem?.supplier) set("supplier", prefillItem.supplier);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const addLine = () => set("lines", [...form.lines, { inventory_item: "", quantity_ordered: 1, unit_cost: 0 }]);
  const updateLine = (i, field, value) => {
    const next = [...form.lines];
    next[i] = { ...next[i], [field]: value };
    if (field === "inventory_item") {
      const item = inventory.find((x) => String(x.id) === String(value));
      if (item) next[i].unit_cost = Number(item.cost_per_unit) || 0;
    }
    set("lines", next);
  };
  const removeLine = (i) => set("lines", form.lines.filter((_, idx) => idx !== i));

  const total = form.lines.reduce((s, l) => s + (Number(l.quantity_ordered) || 0) * (Number(l.unit_cost) || 0), 0);

  const submit = async () => {
    setSaving(true);
    try {
      await entities.PurchaseOrder.create({
        supplier: form.supplier || null,
        expected_date: form.expected_date || null,
        notes: form.notes,
        status: "Draft",
        lines: form.lines.map((l) => ({
          inventory_item: Number(l.inventory_item),
          quantity_ordered: Number(l.quantity_ordered) || 0,
          unit_cost: Number(l.unit_cost) || 0,
        })),
      });
      onCreated(); onClose();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader><DialogTitle>New Purchase Order</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
          <div><Label>Supplier</Label>
            <select value={form.supplier} onChange={(e) => set("supplier", e.target.value)} className="mt-1 w-full h-9 px-3 rounded-lg border border-input bg-card text-[13px]">
              <option value="">No supplier</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div><Label>Expected Date</Label><Input type="date" value={form.expected_date} onChange={(e) => set("expected_date", e.target.value)} className="mt-1" /></div>
          <div className="col-span-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => set("notes", e.target.value)} className="mt-1" /></div>

          <div className="col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <Label>Order Lines</Label>
              <Button type="button" variant="outline" size="sm" className="h-7 text-[12px] gap-1" onClick={addLine}><Plus className="w-3.5 h-3.5" /> Add Line</Button>
            </div>
            <div className="space-y-2">
              {form.lines.map((l, i) => (
                <div key={i} className="rounded-xl border border-border/60 p-2.5 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <select value={l.inventory_item} onChange={(e) => updateLine(i, "inventory_item", e.target.value)} className="flex-1 h-9 px-2 rounded-lg border border-input bg-card text-[12.5px]">
                      <option value="">Select ingredient…</option>
                      {inventory.map((it) => <option key={it.id} value={it.id}>{it.name} ({it.unit})</option>)}
                    </select>
                    <Input type="number" min="0" step="0.01" value={l.quantity_ordered} onChange={(e) => updateLine(i, "quantity_ordered", e.target.value)} className="h-9 w-24 text-[12.5px]" placeholder="Qty" />
                    <div className="relative w-24">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">$</span>
                      <Input type="number" min="0" step="0.01" value={l.unit_cost} onChange={(e) => updateLine(i, "unit_cost", e.target.value)} className="h-9 pl-5 text-[12.5px]" />
                    </div>
                    <button onClick={() => removeLine(i)} className="w-8 h-9 rounded-lg border border-border hover:bg-muted flex items-center justify-center shrink-0"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  </div>
                </div>
              ))}
              {form.lines.length === 0 && <p className="text-[11.5px] text-muted-foreground italic">Add at least one line item.</p>}
            </div>
          </div>

          <div className="col-span-2 text-right text-[13px]"><span className="text-muted-foreground">Total: </span><span className="font-semibold">${total.toFixed(2)}</span></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || form.lines.length === 0 || form.lines.some((l) => !l.inventory_item)} className="bg-rose-600 hover:bg-rose-700">{saving ? "Creating…" : "Create Purchase Order"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PODetailDialog({ order, onClose, onPatch, onReceived }) {
  const [receiveQty, setReceiveQty] = useState({});
  const [receiving, setReceiving] = useState(false);

  const canEditLines = ["Draft", "Sent"].includes(order.status);
  const canReceive = ["Sent", "Partially Received"].includes(order.status);

  const submitReceive = async () => {
    const lines = Object.entries(receiveQty)
      .filter(([, v]) => Number(v) > 0)
      .map(([line_id, quantity_received]) => ({ line_id: Number(line_id), quantity_received: Number(quantity_received) }));
    if (lines.length === 0) return;
    setReceiving(true);
    try {
      const updated = await receivePurchaseOrder(order.id, lines);
      onReceived(order.id, updated);
      setReceiveQty({});
    } catch (e) {
      console.error(e);
      alert(e.message || "Could not receive this purchase order.");
    }
    setReceiving(false);
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-mono">{order.reference}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2 text-[13px]">
          <div className="grid grid-cols-2 gap-2 text-[12.5px]">
            <div><span className="text-muted-foreground">Supplier:</span> {order.supplier_name || "—"}</div>
            <div><span className="text-muted-foreground">Expected:</span> {order.expected_date ? new Date(order.expected_date).toLocaleDateString() : "—"}</div>
          </div>

          <div className="rounded-xl border border-border/60 divide-y divide-border/40">
            {(order.lines || []).map((l) => (
              <div key={l.id} className="flex items-center justify-between px-3 py-2 gap-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">{l.inventory_item_name}</div>
                  <div className="text-[11.5px] text-muted-foreground">{l.quantity_received} / {l.quantity_ordered} {l.unit} received · ${Number(l.unit_cost).toFixed(2)}/unit</div>
                </div>
                {canReceive && Number(l.quantity_received) < Number(l.quantity_ordered) && (
                  <Input type="number" min="0" step="0.01" placeholder="Qty now"
                    value={receiveQty[l.id] || ""} onChange={(e) => setReceiveQty((p) => ({ ...p, [l.id]: e.target.value }))}
                    className="h-8 w-24 text-[12px]" />
                )}
                {Number(l.quantity_received) >= Number(l.quantity_ordered) && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
              </div>
            ))}
          </div>

          {canReceive && (
            <Button size="sm" variant="outline" className="w-full gap-2" onClick={submitReceive} disabled={receiving}>
              <Truck className="w-3.5 h-3.5" /> {receiving ? "Receiving…" : "Mark Received"}
            </Button>
          )}

          {order.notes && <div className="rounded-lg bg-muted/40 p-2.5 text-[12px]">{order.notes}</div>}

          <div>
            <Label className="text-[12px] mb-1.5 block">Status</Label>
            <div className="flex flex-wrap gap-1.5">
              {order.status === "Draft" && (
                <button onClick={() => onPatch(order.id, { status: "Sent", ordered_date: new Date().toISOString().slice(0, 10) })}
                  className="px-2.5 py-1 rounded-lg text-[11.5px] font-medium border border-border text-muted-foreground hover:text-foreground">Mark Sent</button>
              )}
              {!["Received", "Cancelled"].includes(order.status) && (
                <button onClick={() => { if (confirm("Cancel this purchase order?")) onPatch(order.id, { status: "Cancelled" }); }}
                  className="px-2.5 py-1 rounded-lg text-[11.5px] font-medium border border-border text-rose-600 hover:bg-rose-50">Cancel</button>
              )}
            </div>
          </div>

          {!canEditLines && ["Partially Received", "Received"].includes(order.status) && (
            <p className="text-[11px] text-muted-foreground italic">Line items are locked once receiving has started.</p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
