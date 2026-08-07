import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { UserCog, Plus, Mail, Shield, Trash2, UserPlus, CheckCircle2 } from "lucide-react";
import PageHeader, { EmptyState } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const ROLES = [
  { value: "admin", label: "Admin", desc: "Full access — manage everything, including users & settings" },
  { value: "manager", label: "Manager", desc: "Supervisor — orders, inventory, production, tasks" },
  { value: "employee", label: "Employee", desc: "Staff — sees assigned tasks & production board only" },
  { value: "user", label: "Employee", desc: "Staff — sees assigned tasks & production board only" },
];

const roleBadge = {
  admin: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
  manager: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
  employee: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
  user: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
};

export default function Employees() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setUsers(await base44.entities.User.list("-created_date", 500)); }
    catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const changeRole = async (id, role) => {
    try { await base44.entities.User.update(id, { role }); load(); }
    catch (e) { console.error(e); alert("Could not update role."); }
  };

  const removeUser = async (u) => {
    if (!confirm(`Remove ${u.email}?`)) return;
    try { await base44.entities.User.delete(u.id); load(); }
    catch (e) { console.error(e); alert("Could not remove user."); }
  };

  return (
    <div className="p-5 lg:p-8 max-w-[1100px] mx-auto">
      <PageHeader
        title="Employees"
        description={`${users.length} team members · manage roles & access`}
        icon={UserCog}
        actions={<Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={() => setInviteOpen(true)}><UserPlus className="w-4 h-4" /> Invite User</Button>}
      />

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
        ) : users.length === 0 ? (
          <EmptyState icon={UserCog} title="No team members" description="Invite your first team member to get started." />
        ) : (
          <>
          <div className="md:hidden divide-y divide-border/40">
            {users.map((u) => (
              <div key={u.id} className="p-4">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500/20 to-amber-500/20 flex items-center justify-center text-[12px] font-semibold shrink-0">
                    {(u.full_name || u.email || "?").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[13.5px] truncate">{u.full_name || u.email?.split("@")[0]}</div>
                    <div className="text-[11.5px] text-muted-foreground truncate">{u.email}</div>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize shrink-0", roleBadge[u.role])}>{u.role === "user" ? "employee" : u.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} disabled={u.id === currentUser?.id} className="h-8 px-2 rounded-lg border border-input bg-card text-[12px] flex-1 disabled:opacity-50">
                    {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  {u.id !== currentUser?.id && (
                    <button onClick={() => removeUser(u)} className="w-8 h-8 rounded-lg border border-border hover:bg-rose-50 flex items-center justify-center shrink-0"><Trash2 className="w-3.5 h-3.5 text-rose-500" /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border/60 text-left text-[11.5px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500/20 to-amber-500/20 flex items-center justify-center text-[12px] font-semibold">
                          {(u.full_name || u.email || "?").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{u.full_name || u.email?.split("@")[0]}</div>
                          <div className="text-[11.5px] text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize", roleBadge[u.role])}>{u.role === "user" ? "employee" : u.role}</span>
                        {u.id === currentUser?.id && <span className="text-[10px] text-muted-foreground">(you)</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.created_date ? new Date(u.created_date).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} disabled={u.id === currentUser?.id}
                          className="h-8 px-2 rounded-lg border border-input bg-card text-[12px] disabled:opacity-50">
                          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        {u.id !== currentUser?.id && (
                          <button onClick={() => removeUser(u)} className="w-8 h-8 rounded-lg hover:bg-rose-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-rose-500" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-border/60 bg-card p-5">
        <div className="flex items-center gap-2 mb-3"><Shield className="w-4 h-4 text-rose-500" /><h3 className="font-heading font-semibold text-[14px]">Role Permissions</h3></div>
        <div className="grid sm:grid-cols-3 gap-3">
          {ROLES.filter((r) => r.value !== "user").map((r) => (
            <div key={r.value} className="rounded-xl bg-muted/30 p-3">
              <div className="flex items-center gap-2 mb-1"><span className={cn("px-2 py-0.5 rounded-full text-[11px] font-semibold", roleBadge[r.value])}>{r.label}</span></div>
              <p className="text-[11.5px] text-muted-foreground leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} onInvited={load} />
    </div>
  );
}

function InviteDialog({ open, onClose, onInvited }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const reset = () => { setEmail(""); setRole("employee"); setError(""); setDone(false); setSaving(false); };
  const handleClose = () => { onClose(); setTimeout(reset, 250); };

  const submit = async () => {
    setError("");
    setSaving(true);
    try {
      // Invite as "user" (platform role), then set the chosen display role.
      await base44.users.inviteUser(email, "user");
      // Best-effort role update after invite (the user record may not exist instantly)
      try {
        const all = await base44.entities.User.list("-created_date", 500);
        const u = all.find((x) => x.email === email);
        if (u && role !== "user") await base44.entities.User.update(u.id, { role });
      } catch (e) { console.error(e); }
      setDone(true);
      onInvited();
      setTimeout(handleClose, 1800);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Could not send invitation. Make sure your account is an admin and the email is valid.");
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Invite Team Member</DialogTitle></DialogHeader>
        {done ? (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <h3 className="font-heading font-semibold text-[15px]">Invitation sent</h3>
            <p className="text-[13px] text-muted-foreground mt-1 max-w-[280px]">{email} will receive an email with a link to join the team.</p>
          </div>
        ) : (
          <>
          <div className="grid gap-3 py-2">
            <div><Label>Email *</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" placeholder="name@example.com" /></div>
            <div><Label>Role</Label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full h-9 px-3 rounded-lg border border-input bg-card text-[13px]">
                <option value="employee">Employee — tasks & production only</option>
                <option value="manager">Manager — orders, inventory, production, tasks</option>
                <option value="admin">Admin — full access</option>
              </select>
            </div>
            {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-[12.5px]">{error}</div>}
            <p className="text-[11.5px] text-muted-foreground flex items-start gap-1.5"><Mail className="w-3.5 h-3.5 mt-0.5 shrink-0" /> An invitation email will be sent. The user will appear here once they accept.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={submit} disabled={saving || !email} className="bg-rose-600 hover:bg-rose-700">{saving ? "Sending…" : "Send Invite"}</Button>
          </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}