import React, { useState, useEffect, useMemo } from "react";
import { entities } from '@/lib/api';
import { Truck, Plus, Search, Pencil, Trash2, Mail, Phone } from "lucide-react";
import PageHeader, { EmptyState } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setSuppliers(await entities.Supplier.list("name", 500)); }
    catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => suppliers.filter((s) => {
    const q = search.toLowerCase();
    return !q || s.name?.toLowerCase().includes(q) || s.contact_name?.toLowerCase().includes(q);
  }), [suppliers, search]);

  const remove = async (s) => {
    if (!confirm(`Delete supplier "${s.name}"? Inventory items linked to it will be unlinked, not deleted.`)) return;
    await entities.Supplier.delete(s.id);
    setSuppliers((p) => p.filter((x) => x.id !== s.id));
  };

  return (
    <div className="p-5 lg:p-8 max-w-[1200px] mx-auto">
      <PageHeader
        title="Suppliers"
        description={`${suppliers.length} supplier${suppliers.length === 1 ? "" : "s"}`}
        icon={Truck}
        actions={<Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Add Supplier</Button>}
      />

      <div className="relative mb-5 max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search suppliers…" className="pl-9 h-10" />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Truck} title="No suppliers yet" description="Add a supplier to link to inventory items and purchase orders." action={<Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Add Supplier</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border/60 text-left text-[11.5px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.contact_name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {s.email ? <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {s.email}</span> : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {s.phone ? <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {s.phone}</span> : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setEditItem(s)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                        <button onClick={() => remove(s)} className="w-7 h-7 rounded-lg hover:bg-rose-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-rose-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SupplierDialog open={createOpen || !!editItem} item={editItem} onClose={() => { setCreateOpen(false); setEditItem(null); }} onSaved={load} />
    </div>
  );
}

function SupplierDialog({ open, item, onClose, onSaved }) {
  const isEdit = !!item;
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(item || { name: "", contact_name: "", email: "", phone: "", notes: "" });
      setError("");
    }
  }, [open, item]);

  if (!form) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      if (isEdit) await entities.Supplier.update(item.id, form);
      else await entities.Supplier.create(form);
      onSaved(); onClose();
    } catch (e) {
      console.error(e);
      setError(e.message || "Could not save. Please try again.");
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{isEdit ? "Edit Supplier" : "Add Supplier"}</DialogTitle></DialogHeader>
        <div className="grid gap-3 py-2">
          {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-[12.5px]">{error}</div>}
          <div><Label>Name *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1" /></div>
          <div><Label>Contact Name</Label><Input value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} className="mt-1" /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="mt-1" /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="mt-1" /></div>
          <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} className="mt-1" rows={3} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !form.name} className="bg-rose-600 hover:bg-rose-700">{saving ? "Saving…" : isEdit ? "Save Changes" : "Add Supplier"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
