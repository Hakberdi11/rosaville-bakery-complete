import React, { useState, useEffect, useMemo } from "react";
import { entities } from '@/lib/api';
import { ShoppingBag, Plus, Search, Download, X, ChevronDown, Beaker, AlertTriangle, CheckCircle2 } from "lucide-react";
import PageHeader, { StatusBadge, EmptyState } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { summarizeIngredients } from "@/lib/ingredientCalc";

const STATUSES = ["Pending", "Confirmed", "In Production", "Ready", "Delivered", "Completed", "Cancelled", "Refunded"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [desserts, setDesserts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [o, d, i] = await Promise.all([
        entities.Order.list("-created_date", 500),
        entities.Dessert.list("-display_order", 500),
        entities.InventoryItem.list("-created_date", 500),
      ]);
      setOrders(o); setDesserts(d); setInventory(i);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => orders.filter((o) => {
    const matchSearch = !search ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.email?.toLowerCase().includes(search.toLowerCase()) ||
      o.order_number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  }), [orders, search, statusFilter]);

  const updateStatus = async (id, status) => {
    await entities.Order.update(id, { status });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const totalValue = filtered.reduce((s, o) => s + (o.total_value || 0), 0);

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Orders"
        description={`${filtered.length} orders · $${totalValue.toLocaleString()} total value`}
        icon={ShoppingBag}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2"><Download className="w-4 h-4" /> Export</Button>
            <Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> New Order</Button>
          </>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by customer, email, or order #" className="pl-9 h-10" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {["All", ...STATUSES].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn("px-3 py-1.5 rounded-lg text-[12.5px] font-medium whitespace-nowrap transition-colors border",
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
          <EmptyState icon={ShoppingBag} title="No orders found" description="Try adjusting filters or create a new order." />
        ) : (
          <>
          <div className="md:hidden divide-y divide-border/40">
            {filtered.map((o) => (
              <button key={o.id} onClick={() => setSelected(o)} className="w-full text-left p-4 hover:bg-muted/30">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium text-[13.5px]">{o.order_number || `#${String(o.id).slice(-6)}`}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="text-[13px] font-medium truncate">{o.customer_name}</div>
                <div className="text-[11.5px] text-muted-foreground truncate">{o.email}</div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11.5px] text-muted-foreground">{(o.items || []).reduce((s, i) => s + (i.quantity || 0), 0)} pcs · {o.delivery_date ? new Date(o.delivery_date).toLocaleDateString() : "—"}</span>
                  <span className="text-[13px] font-semibold tabular-nums">${(o.total_value || 0).toFixed(2)}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border/60 text-left text-[11.5px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelected(o)}>
                    <td className="px-4 py-3 font-medium">{o.order_number || `#${String(o.id).slice(-6)}`}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{o.customer_name}</div>
                      <div className="text-[11.5px] text-muted-foreground">{o.email}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{(o.items || []).reduce((s, i) => s + (i.quantity || 0), 0)} pcs</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.delivery_date ? new Date(o.delivery_date).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">${(o.total_value || 0).toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.payment_status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
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
        <OrderDetail order={selected} desserts={desserts} inventory={inventory}
          onClose={() => setSelected(null)}
          onStatus={updateStatus} />
      )}

      <CreateOrderDialog open={createOpen} desserts={desserts} inventory={inventory}
        onClose={() => setCreateOpen(false)} onCreated={load} />
    </div>
  );
}

function IngredientSummary({ items, desserts, inventory }) {
  const summary = summarizeIngredients(items, desserts, inventory);
  if (summary.length === 0) return null;
  const allOk = summary.every((s) => s.sufficient);
  return (
    <div className={cn("rounded-xl border p-3", allOk ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5")}>
      <div className="flex items-center gap-2 mb-2">
        {allOk ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
        <span className="text-[12.5px] font-semibold">Predicted Ingredients Needed</span>
      </div>
      <div className="space-y-1">
        {summary.map((s) => (
          <div key={s.inventory_item_id} className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">{s.name}</span>
            <span className={cn("font-medium tabular-nums", s.sufficient ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
              {s.needed.toFixed(2)} {s.unit} <span className="text-muted-foreground font-normal">(have {s.available})</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderDetail({ order, desserts, inventory, onClose, onStatus }) {
  return (
    <Dialog open={!!order} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Order {order.order_number || `#${String(order.id).slice(-6)}`}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3 text-[13px]">
            <div><div className="text-[11px] text-muted-foreground uppercase mb-0.5">Customer</div><div className="font-medium">{order.customer_name}</div></div>
            <div><div className="text-[11px] text-muted-foreground uppercase mb-0.5">Contact</div><div className="font-medium">{order.phone || order.email}</div></div>
            <div className="col-span-2"><div className="text-[11px] text-muted-foreground uppercase mb-0.5">Address</div><div className="font-medium">{order.address || "—"}</div></div>
            <div><div className="text-[11px] text-muted-foreground uppercase mb-0.5">Delivery Date</div><div className="font-medium">{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : "—"}</div></div>
            <div><div className="text-[11px] text-muted-foreground uppercase mb-0.5">Total</div><div className="font-semibold text-[15px]">${(order.total_value || 0).toFixed(2)}</div></div>
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground uppercase mb-1.5">Items</div>
            <div className="rounded-xl border border-border/60 divide-y divide-border/40">
              {(order.items || []).map((it, i) => (
                <div key={i} className="flex justify-between px-3 py-2 text-[13px]">
                  <span>{it.quantity}× {it.name}{it.size && it.size !== "Standard" ? <span className="text-muted-foreground"> ({it.size})</span> : ""}</span>
                  <span className="font-medium">${((it.quantity || 0) * (it.price || 0)).toFixed(2)}</span>
                </div>
              ))}
              {(!order.items || order.items.length === 0) && <div className="px-3 py-2 text-muted-foreground text-[12.5px]">No items recorded.</div>}
            </div>
          </div>
          <IngredientSummary items={order.items || []} desserts={desserts} inventory={inventory} />
          <div>
            <Label className="text-[12px] mb-1.5 block">Update Status</Label>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button key={s} onClick={() => onStatus(order.id, s)}
                  className={cn("px-2.5 py-1 rounded-lg text-[11.5px] font-medium border transition-colors",
                    order.status === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground")}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          {order.internal_notes && (
            <div><div className="text-[11px] text-muted-foreground uppercase mb-1">Internal Notes</div><div className="text-[12.5px] p-3 rounded-lg bg-muted/50">{order.internal_notes}</div></div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreateOrderDialog({ open, desserts, inventory, onClose, onCreated }) {
  const [form, setForm] = useState({ customer_name: "", email: "", phone: "", address: "", delivery_date: "", internal_notes: "", items: [] });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (open) setForm({ customer_name: "", email: "", phone: "", address: "", delivery_date: "", internal_notes: "", items: [] });
  }, [open]);

  const addItem = () => set("items", [...form.items, { dessert_id: "", name: "", quantity: 1, price: 0, size: "Standard", size_multiplier: 1 }]);
  const updateItem = (i, field, value) => {
    const next = [...form.items];
    next[i] = { ...next[i], [field]: value };
    if (field === "dessert_id") {
      const d = desserts.find((x) => x.id === value);
      if (d) {
        next[i].name = d.name;
        if (d.sizes?.length) {
          const s = d.sizes[0];
          next[i].size = s.label; next[i].size_multiplier = s.multiplier; next[i].price = s.price ?? d.price;
        } else { next[i].size = "Standard"; next[i].size_multiplier = 1; next[i].price = d.price; }
      }
    }
    if (field === "size") {
      const d = desserts.find((x) => x.id === next[i].dessert_id);
      const s = d?.sizes?.find((x) => x.label === value);
      if (s) { next[i].size_multiplier = s.multiplier; next[i].price = s.price ?? d?.price; }
    }
    set("items", next);
  };
  const removeItem = (i) => set("items", form.items.filter((_, idx) => idx !== i));

  const total = form.items.reduce((s, it) => s + (it.quantity || 0) * (it.price || 0), 0);

  const submit = async () => {
    setSaving(true);
    try {
      await entities.Order.create({
        ...form,
        order_number: "RV-" + Math.floor(1000 + Math.random() * 9000),
        total_value: total,
        status: "Pending",
        payment_status: "Unpaid",
        channel: "Website",
      });
      onCreated(); onClose();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Create New Order</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
          <div className="col-span-2"><Label>Customer Name *</Label><Input value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} className="mt-1" /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="mt-1" /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="mt-1" /></div>
          <div className="col-span-2"><Label>Address</Label><Input value={form.address} onChange={(e) => set("address", e.target.value)} className="mt-1" /></div>
          <div><Label>Delivery Date</Label><Input type="date" value={form.delivery_date} onChange={(e) => set("delivery_date", e.target.value)} className="mt-1" /></div>
          <div><Label>Total (auto)</Label><Input value={`$${total.toFixed(2)}`} readOnly className="mt-1 font-semibold" /></div>

          {/* Line items */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <Label>Order Items</Label>
              <Button type="button" variant="outline" size="sm" className="h-7 text-[12px] gap-1" onClick={addItem}><Plus className="w-3.5 h-3.5" /> Add Item</Button>
            </div>
            <div className="space-y-2">
              {form.items.map((it, i) => {
                const d = desserts.find((x) => x.id === it.dessert_id);
                return (
                  <div key={i} className="rounded-xl border border-border/60 p-2.5 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <select value={it.dessert_id} onChange={(e) => updateItem(i, "dessert_id", e.target.value)} className="w-full h-9 px-2 rounded-lg border border-input bg-card text-[12.5px]">
                          <option value="">Select dessert…</option>
                          {desserts.map((dd) => <option key={dd.id} value={dd.id}>{dd.name}</option>)}
                        </select>
                      </div>
                      {d?.sizes?.length > 0 ? (
                        <select value={it.size} onChange={(e) => updateItem(i, "size", e.target.value)} className="h-9 w-28 px-2 rounded-lg border border-input bg-card text-[12.5px]">
                          {d.sizes.map((s) => <option key={s.label} value={s.label}>{s.label}</option>)}
                          <option value="Standard">Standard</option>
                        </select>
                      ) : (
                        <span className="text-[11px] text-muted-foreground px-2">Standard</span>
                      )}
                      <Input type="number" min="1" value={it.quantity} onChange={(e) => updateItem(i, "quantity", Number(e.target.value))} className="h-9 w-16 text-[12.5px]" />
                      <div className="relative w-20">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">$</span>
                        <Input type="number" step="0.01" value={it.price} onChange={(e) => updateItem(i, "price", Number(e.target.value))} className="h-9 pl-5 text-[12.5px]" />
                      </div>
                      <button onClick={() => removeItem(i)} className="w-8 h-9 rounded-lg border border-border hover:bg-muted flex items-center justify-center shrink-0"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    </div>
                  </div>
                );
              })}
              {form.items.length === 0 && <p className="text-[11.5px] text-muted-foreground italic">Add items to build the order. Ingredient needs are calculated automatically.</p>}
            </div>
          </div>

          {/* Predicted ingredients */}
          {form.items.length > 0 && (
            <div className="col-span-2">
              <IngredientSummary items={form.items} desserts={desserts} inventory={inventory} />
            </div>
          )}

          <div className="col-span-2"><Label>Internal Notes</Label><Textarea value={form.internal_notes} onChange={(e) => set("internal_notes", e.target.value)} className="mt-1" rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !form.customer_name} className="bg-rose-600 hover:bg-rose-700">{saving ? "Creating…" : "Create Order"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}