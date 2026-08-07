import React, { useState, useEffect, useMemo } from "react";
import { entities } from '@/lib/api';
import { useAuth } from "@/lib/AuthContext";
import { ListTodo, Plus, Search, Trash2, Pencil, Calendar, User2, Flag } from "lucide-react";
import PageHeader, { EmptyState } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const STATUSES = ["To Do", "In Progress", "Waiting", "Completed"];
const MODULES = ["General", "Production", "Inventory", "Sales", "Marketing", "Admin"];

const priorityColor = {
  Low: "bg-slate-500/12 text-slate-600 dark:text-slate-400",
  Medium: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
  High: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  Urgent: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
};

export default function Tasks() {
  const { user } = useAuth();
  const role = user?.role === "admin" ? "admin" : user?.role === "manager" ? "manager" : "employee";
  const canManage = role === "admin" || role === "manager";
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const t = await entities.Task.list("-created_date", 500);
      setTasks(t);
      if (canManage) {
        try { setUsers(await entities.User.list("-created_date", 500)); }
        catch (e) { console.error(e); }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => tasks.filter((t) => {
    const ms = !search || t.title?.toLowerCase().includes(search.toLowerCase());
    const mc = statusFilter === "All" || t.status === statusFilter;
    return ms && mc;
  }), [tasks, search, statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      await entities.Task.update(id, { status });
      setTasks((p) => p.map((t) => (t.id === id ? { ...t, status } : t)));
      if (editTask?.id === id) setEditTask({ ...editTask, status });
    } catch (e) { console.error(e); alert("You can only update tasks assigned to you."); }
  };

  const remove = async (t) => {
    if (!confirm(`Delete "${t.title}"?`)) return;
    await entities.Task.delete(t.id);
    setTasks((p) => p.filter((x) => x.id !== t.id));
  };

  const columns = STATUSES.map((s) => ({ status: s, items: filtered.filter((t) => t.status === s) }));

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title={canManage ? "Task Management" : "My Tasks"}
        description={canManage ? `${tasks.length} tasks · assign and track your team's work` : "Tasks assigned to you — update status as you progress."}
        icon={ListTodo}
        actions={canManage && <Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> New Task</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks…" className="pl-9 h-10" />
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

      {loading ? (
        <div className="p-12 flex justify-center"><div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card">
          <EmptyState icon={ListTodo} title="No tasks yet" description={canManage ? "Create a task and assign it to a team member." : "No tasks have been assigned to you yet."} action={canManage && <Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> New Task</Button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((col) => (
            <div key={col.status} className="rounded-2xl border border-border/60 bg-muted/20 p-3">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[12.5px] font-semibold">{col.status}</span>
                <span className="text-[11px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">{col.items.length}</span>
              </div>
              <div className="space-y-2.5">
                {col.items.map((t) => (
                  <div key={t.id} className="rounded-xl border border-border/60 bg-card p-3 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setEditTask(t)}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-[13px] font-semibold leading-snug">{t.title}</h4>
                      <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap", priorityColor[t.priority])}>{t.priority}</span>
                    </div>
                    {t.description && <p className="text-[11.5px] text-muted-foreground line-clamp-2 mb-2">{t.description}</p>}
                    <div className="flex items-center gap-2 flex-wrap text-[10.5px] text-muted-foreground">
                      {t.assigned_to_name && <span className="flex items-center gap-1"><User2 className="w-3 h-3" /> {t.assigned_to_name}</span>}
                      {t.due_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(t.due_date).toLocaleDateString()}</span>}
                      {t.module && t.module !== "General" && <span className="flex items-center gap-1"><Flag className="w-3 h-3" /> {t.module}</span>}
                    </div>
                    {canManage && (
                      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/40">
                        <button onClick={(e) => { e.stopPropagation(); setEditTask(t); }} className="text-[10.5px] text-muted-foreground hover:text-foreground flex items-center gap-1"><Pencil className="w-3 h-3" /> Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); remove(t); }} className="text-[10.5px] text-muted-foreground hover:text-rose-500 flex items-center gap-1 ml-auto"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    )}
                  </div>
                ))}
                {col.items.length === 0 && <div className="text-[11px] text-muted-foreground/60 text-center py-4">No tasks</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskDialog open={createOpen || !!editTask} task={editTask} users={users} canManage={canManage} onClose={() => { setCreateOpen(false); setEditTask(null); }} onSaved={load} onStatus={updateStatus} />
    </div>
  );
}

function TaskDialog({ open, task, users, canManage, onClose, onSaved, onStatus }) {
  const isEdit = !!task;
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(task || { title: "", description: "", assigned_to_id: "", assigned_to_name: "", priority: "Medium", due_date: "", status: "To Do", module: "General", notes: "" });
  }, [open, task]);

  if (!form) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    try {
      if (isEdit) await entities.Task.update(task.id, form);
      else await entities.Task.create(form);
      onSaved(); onClose();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "Task Details" : "Create Task"}</DialogTitle></DialogHeader>
        <div className="grid gap-3 py-2">
          <div><Label>Title *</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} className="mt-1" disabled={!canManage && isEdit} /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="mt-1" rows={2} disabled={!canManage && isEdit} /></div>
          {canManage && (
            <div>
              <Label>Assign To</Label>
              <select value={form.assigned_to_id} onChange={(e) => { const u = users.find((x) => x.id === e.target.value); set("assigned_to_id", e.target.value); set("assigned_to_name", u?.full_name || u?.email || ""); }} className="mt-1 w-full h-9 px-3 rounded-lg border border-input bg-card text-[13px]">
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
              </select>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label>Priority</Label>
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)} className="mt-1 w-full h-9 px-3 rounded-lg border border-input bg-card text-[13px]" disabled={!canManage && isEdit}>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div><Label>Module</Label>
              <select value={form.module} onChange={(e) => set("module", e.target.value)} className="mt-1 w-full h-9 px-3 rounded-lg border border-input bg-card text-[13px]" disabled={!canManage && isEdit}>
                {MODULES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} className="mt-1" disabled={!canManage && isEdit} /></div>
            <div><Label>Status</Label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className="mt-1 w-full h-9 px-3 rounded-lg border border-input bg-card text-[13px]">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} className="mt-1" rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          {canManage && <Button onClick={submit} disabled={saving || !form.title} className="bg-rose-600 hover:bg-rose-700">{saving ? "Saving…" : isEdit ? "Save Changes" : "Create Task"}</Button>}
          {!canManage && isEdit && <Button onClick={() => onStatus(task.id, form.status)} className="bg-rose-600 hover:bg-rose-700">Update Status</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}