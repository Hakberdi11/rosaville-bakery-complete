import React, { useState, useEffect } from "react";
import { entities } from '@/lib/api';
import { Mail, Search, Trash2 } from "lucide-react";
import PageHeader, { EmptyState } from "@/components/admin/PageHeader";
import { Input } from "@/components/ui/input";

export default function Newsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    (async () => {
      try { setSubscribers(await entities.NewsletterSubscriber.list("-created_at", 1000)); }
      catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const remove = async (s) => {
    if (!confirm(`Remove ${s.email} from the newsletter list?`)) return;
    setDeletingId(s.id);
    try {
      await entities.NewsletterSubscriber.delete(s.id);
      setSubscribers((prev) => prev.filter((x) => x.id !== s.id));
    } catch (e) { console.error(e); }
    setDeletingId(null);
  };

  const filtered = subscribers.filter((s) => !search || s.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-5 lg:p-8 max-w-[900px] mx-auto">
      <PageHeader
        title="Newsletter Subscribers"
        description={`${subscribers.length} people subscribed to your newsletter.`}
        icon={Mail}
      />

      <div className="relative mb-5">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email…" className="pl-9 h-10" />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Mail} title="No subscribers yet" description="Emails collected from the newsletter form on your website will appear here." />
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border/60 text-left text-[11.5px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Subscribed</th>
                <th className="px-4 py-3 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-medium">{s.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      disabled={deletingId === s.id}
                      onClick={() => remove(s)}
                      title="Remove subscriber"
                      className="w-7 h-7 rounded-lg border border-border hover:bg-destructive/10 hover:border-destructive/40 inline-flex items-center justify-center disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
