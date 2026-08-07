import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Inbox, Search, Mail, Phone, Trash2, Pencil } from "lucide-react";
import PageHeader, { StatusBadge, EmptyState } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const STATUSES = ["New", "Open", "Assigned", "Resolved", "Closed"];
const SOURCES = ["Website", "Email", "Phone", "Social"];

export default function ContactRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setRequests(await base44.entities.ContactRequest.list("-created_date", 500)); }
    catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => requests.filter((r) => {
    const ms = !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.subject?.toLowerCase().includes(search.toLowerCase());
    const mc = statusFilter === "All" || r.status === statusFilter;
    return ms && mc;
  }), [requests, search, statusFilter]);

  const updateStatus = async (id, status) => {
    await base44.entities.ContactRequest.update(id, { status });
    setRequests((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const remove = async (r) => {
    if (!confirm(`Delete request from ${r.name}?`)) return;
    await base44.entities.ContactRequest.delete(r.id);
    setRequests((p) => p.filter((x) => x.id !== r.id));
    setSelected(null);
  };

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Contact Requests"
        description={`${requests.filter(r => r.status === "New").length} new · ${requests.length} total inquiries`}
        icon={Inbox}
        actions={<Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={() => setCreateOpen(true)}><Pencil className="w-4 h-4" /> Log Request</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or subject…" className="pl-9 h-10" />
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
          <EmptyState icon={Inbox} title="No contact requests" description="Inquiries from your website will appear here." />
        ) : (
          <>
          <div className="md:hidden divide-y divide-border/40">
            {filtered.map((r) => (
              <button key={r.id} onClick={() => setSelected(r)} className="w-full text-left p-4 hover:bg-muted/30">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium text-[13.5px] truncate">{r.name}</span>
                  <StatusBadge status={r.status} />
                </div>
                <div className="text-[12.5px] text-foreground truncate">{r.subject || "No subject"}</div>
                <div className="flex items-center justify-between mt-1.5 gap-2">
                  <span className="text-[11.5px] text-muted-foreground truncate">{r.email || "—"} · {r.source}</span>
                  <span className="text-[11.5px] text-muted-foreground whitespace-nowrap">{r.created_date ? new Date(r.created_date).toLocaleDateString() : "—"}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border/60 text-left text-[11.5px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Received</th>
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
                    <td className="px-4 py-3">{r.subject || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.source}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.created_date ? new Date(r.created_date).toLocaleDateString() : "—"}</td>
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
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{selected.subject || "Contact Request"}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2 text-[13px]">
              <div className="flex items-center gap-2"><div className="font-medium">{selected.name}</div></div>
              <div className="flex flex-wrap gap-3 text-[12px] text-muted-foreground">
                {selected.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {selected.email}</span>}
                {selected.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {selected.phone}</span>}
                <span>via {selected.source}</span>
              </div>
              <div className="rounded-xl bg-muted/40 p-3 text-[12.5px] leading-relaxed">{selected.message || "No message."}</div>
              <div>
                <Label className="text-[12px] mb-1.5 block">Update Status</Label>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map((s) => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)}
                      className={cn("px-2.5 py-1 rounded-lg text-[11.5px] font-medium border",
                        selected.status === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground")}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => remove(selected)} className="text-rose-600 hover:bg-rose-50"><Trash2 className="w-4 h-4" /> Delete</Button>
              <Button onClick={() => setSelected(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <CreateRequestDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={load} />
    </div>
  );
}

function CreateRequestDialog({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "", source: "Website" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    try {
      await base44.entities.ContactRequest.create({ ...form, status: "New" });
      onCreated(); onClose();
      setForm({ name: "", email: "", phone: "", subject: "", message: "", source: "Website" });
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Log Contact Request</DialogTitle></DialogHeader>
        <div className="grid gap-3 py-2">
          <div><Label>Name *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label>Email</Label><Input value={form.email} onChange={(e) => set("email", e.target.value)} className="mt-1" /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="mt-1" /></div>
          </div>
          <div><Label>Subject</Label><Input value={form.subject} onChange={(e) => set("subject", e.target.value)} className="mt-1" /></div>
          <div><Label>Message</Label><Textarea value={form.message} onChange={(e) => set("message", e.target.value)} className="mt-1" rows={3} /></div>
          <div><Label>Source</Label>
            <select value={form.source} onChange={(e) => set("source", e.target.value)} className="mt-1 w-full h-9 px-3 rounded-lg border border-input bg-card text-[13px]">
              {SOURCES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !form.name} className="bg-rose-600 hover:bg-rose-700">{saving ? "Saving…" : "Log Request"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}