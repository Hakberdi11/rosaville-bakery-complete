import React, { useState, useEffect } from "react";
import { entities, uploadFile } from '@/lib/api';
import { Users2, Plus, Pencil, Trash2 } from "lucide-react";
import PageHeader, { EmptyState } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setMembers(await entities.TeamMember.list("-created_date", 100)); }
    catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (m) => {
    if (!confirm(`Remove "${m.name}" from the team page?`)) return;
    await entities.TeamMember.delete(m.id);
    setMembers((p) => p.filter((x) => x.id !== m.id));
  };

  return (
    <div className="p-5 lg:p-8 max-w-[1100px] mx-auto">
      <PageHeader
        title="Team"
        description={'Who shows up on your website\'s "Meet Our Team" section.'}
        icon={Users2}
        actions={<Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Add Team Member</Button>}
      />

      {loading ? (
        <div className="p-12 flex justify-center"><div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
      ) : members.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card">
          <EmptyState icon={Users2} title="No team members yet" description="Add the people customers should meet on your About page." action={<Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Add Team Member</Button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <div key={m.id} className="group rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-md transition-all p-5 text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                {m.image_url ? <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" /> : <Users2 className="w-8 h-8 text-muted-foreground/40" />}
              </div>
              <h3 className="font-heading font-semibold text-[14.5px]">{m.name}</h3>
              <p className="text-[12px] text-rose-600 font-medium mb-2">{m.role}</p>
              <p className="text-[12px] text-muted-foreground line-clamp-3 mb-3">{m.bio}</p>
              <div className="flex justify-center gap-2">
                <Button size="sm" variant="outline" className="h-7 text-[12px] gap-1" onClick={() => setEditItem(m)}><Pencil className="w-3 h-3" /> Edit</Button>
                <Button size="sm" variant="outline" className="h-7 text-[12px] gap-1 text-rose-600 hover:text-rose-700" onClick={() => remove(m)}><Trash2 className="w-3 h-3" /> Remove</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TeamMemberDialog open={createOpen || !!editItem} item={editItem} onClose={() => { setCreateOpen(false); setEditItem(null); }} onSaved={load} />
    </div>
  );
}

function TeamMemberDialog({ open, item, onClose, onSaved }) {
  const isEdit = !!item;
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(item || { name: "", role: "", bio: "", image_url: "" });
      setError("");
    }
  }, [open, item]);

  if (!form) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await uploadFile(file);
      set("image_url", file_url);
    } catch (err) { console.error(err); }
    setUploading(false);
  };

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      if (isEdit) await entities.TeamMember.update(item.id, form);
      else await entities.TeamMember.create(form);
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
        <DialogHeader><DialogTitle>{isEdit ? "Edit Team Member" : "Add Team Member"}</DialogTitle></DialogHeader>
        <div className="grid gap-3 py-2">
          {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-[12.5px]">{error}</div>}
          <div><Label>Name *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1" /></div>
          <div><Label>Role</Label><Input value={form.role} onChange={(e) => set("role", e.target.value)} className="mt-1" placeholder="e.g. Head Baker & Founder" /></div>
          <div><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} className="mt-1" rows={3} /></div>
          <div>
            <Label>Photo</Label>
            <div className="mt-1 flex gap-3">
              <div className="w-16 h-16 rounded-full border border-border bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                {form.image_url ? <img src={form.image_url} alt="preview" className="w-full h-full object-cover" /> : <Users2 className="w-6 h-6 text-muted-foreground/40" />}
              </div>
              <label className="flex items-center gap-2 h-9 px-3 rounded-lg border border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted text-[12.5px] font-medium self-center">
                {uploading ? "Uploading…" : "Upload photo"}
                <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !form.name} className="bg-rose-600 hover:bg-rose-700">{saving ? "Saving…" : isEdit ? "Save Changes" : "Add Member"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
