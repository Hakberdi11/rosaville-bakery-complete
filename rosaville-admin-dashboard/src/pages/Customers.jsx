import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Search, Plus, Mail, Phone, MapPin, ShoppingBag } from "lucide-react";
import PageHeader, { StatusBadge, EmptyState } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const SEGMENTS = ["New", "Regular", "VIP", "At Risk"];

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setCustomers(await base44.entities.Customer.list("-total_spend", 500)); }
    catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => customers.filter((c) => {
    const ms = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
    const mc = segmentFilter === "All" || c.segment === segmentFilter;
    return ms && mc;
  }), [customers, search, segmentFilter]);

  const totalRevenue = customers.reduce((s, c) => s + (c.total_spend || 0), 0);
  const avgLTV = customers.length ? totalRevenue / customers.length : 0;

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Customers"
        description={`${customers.length} customers · $${totalRevenue.toLocaleString()} lifetime revenue · $${avgLTV.toFixed(0)} avg LTV`}
        icon={Users}
        actions={<Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Add Customer</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers…" className="pl-9 h-10" />
        </div>
        <div className="flex items-center gap-1.5">
          {["All", ...SEGMENTS].map((s) => (
            <button key={s} onClick={() => setSegmentFilter(s)}
              className={cn("px-3 py-1.5 rounded-lg text-[12.5px] font-medium whitespace-nowrap border transition-colors",
                segmentFilter === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground")}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No customers found" description="Add your first customer or adjust filters." />
        ) : (
          <>
          <div className="md:hidden divide-y divide-border/40">
            {filtered.map((c) => (
              <button key={c.id} onClick={() => setSelected(c)} className="w-full text-left p-4 hover:bg-muted/30 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center text-[12px] font-semibold text-violet-600 dark:text-violet-400 shrink-0">{c.name?.split(" ").map(n => n[0]).slice(0, 2).join("") || "?"}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[13.5px] truncate">{c.name}</div>
                  <div className="text-[11.5px] text-muted-foreground truncate">{c.email || "—"}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[11px] text-muted-foreground">{c.order_count || 0} orders</span>
                    <span className="text-[11.5px] font-semibold tabular-nums">${(c.total_spend || 0).toFixed(0)}</span>
                    <StatusBadge status={c.segment} />
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border/60 text-left text-[11.5px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Orders</th>
                  <th className="px-4 py-3 font-medium">Total Spend</th>
                  <th className="px-4 py-3 font-medium">Avg Order</th>
                  <th className="px-4 py-3 font-medium">Last Order</th>
                  <th className="px-4 py-3 font-medium">Segment</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelected(c)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                          {c.name?.split(" ").map(n => n[0]).slice(0, 2).join("") || "?"}
                        </div>
                        <div className="font-medium">{c.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email || "—"}</td>
                    <td className="px-4 py-3 tabular-nums">{c.order_count || 0}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">${(c.total_spend || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">${(c.average_order_value || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.last_order_date ? new Date(c.last_order_date).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.segment} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {selected && <CustomerDetail customer={selected} onClose={() => setSelected(null)} onUpdated={(c) => { setCustomers((p) => p.map((x) => x.id === c.id ? c : x)); setSelected(c); }} />}
      <CreateCustomerDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={load} />
    </div>
  );
}

function CustomerDetail({ customer, onClose, onUpdated }) {
  const [notes, setNotes] = useState(customer.notes || "");
  const [segment, setSegment] = useState(customer.segment || "New");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const updated = { ...customer, notes, segment };
      await base44.entities.Customer.update(customer.id, { notes, segment });
      onUpdated(updated);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <Dialog open={!!customer} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Customer Profile</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center text-[14px] font-semibold text-violet-600 dark:text-violet-400">
              {customer.name?.split(" ").map(n => n[0]).slice(0, 2).join("") || "?"}
            </div>
            <div>
              <div className="font-heading font-semibold text-[16px]">{customer.name}</div>
              <div className="flex items-center gap-2 mt-0.5"><StatusBadge status={customer.segment} /></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-muted/40 p-3 text-center"><div className="text-[11px] text-muted-foreground">Orders</div><div className="text-[18px] font-semibold mt-0.5">{customer.order_count || 0}</div></div>
            <div className="rounded-xl bg-muted/40 p-3 text-center"><div className="text-[11px] text-muted-foreground">Total Spend</div><div className="text-[18px] font-semibold mt-0.5">${(customer.total_spend || 0).toFixed(0)}</div></div>
            <div className="rounded-xl bg-muted/40 p-3 text-center"><div className="text-[11px] text-muted-foreground">Avg Order</div><div className="text-[18px] font-semibold mt-0.5">${(customer.average_order_value || 0).toFixed(0)}</div></div>
          </div>

          <div className="space-y-1.5 text-[13px]">
            {customer.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3.5 h-3.5" /> {customer.email}</div>}
            {customer.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3.5 h-3.5" /> {customer.phone}</div>}
            {customer.address && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> {customer.address}</div>}
          </div>

          <div>
            <Label className="text-[12px]">Segment</Label>
            <div className="flex gap-1.5 mt-1.5">
              {SEGMENTS.map((s) => (
                <button key={s} onClick={() => setSegment(s)} className={cn("px-2.5 py-1 rounded-lg text-[11.5px] font-medium border", segment === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground")}>{s}</button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-[12px]">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1" placeholder="Add customer notes, preferences, allergies…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={save} disabled={saving} className="bg-rose-600 hover:bg-rose-700">{saving ? "Saving…" : "Save Changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateCustomerDialog({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", segment: "New" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    try {
      await base44.entities.Customer.create({ ...form, total_spend: 0, order_count: 0, average_order_value: 0, tags: [] });
      onCreated(); onClose();
      setForm({ name: "", email: "", phone: "", address: "", segment: "New" });
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add Customer</DialogTitle></DialogHeader>
        <div className="grid gap-3 py-2">
          <div><Label>Name *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1" /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="mt-1" /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="mt-1" /></div>
          <div><Label>Address</Label><Input value={form.address} onChange={(e) => set("address", e.target.value)} className="mt-1" /></div>
          <div><Label>Segment</Label>
            <select value={form.segment} onChange={(e) => set("segment", e.target.value)} className="mt-1 w-full h-9 px-3 rounded-lg border border-input bg-card text-[13px]">
              {SEGMENTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !form.name} className="bg-rose-600 hover:bg-rose-700">{saving ? "Adding…" : "Add Customer"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}