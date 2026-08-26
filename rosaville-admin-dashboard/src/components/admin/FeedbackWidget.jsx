import React, { useState, useEffect } from "react";
import { entities } from '@/lib/api';
import { Star, MessageSquareQuote, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/admin/PageHeader";
import { cn } from "@/lib/utils";

export default function FeedbackWidget() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    (async () => {
      try { setFeedback(await entities.Feedback.list("-created_date", 50)); }
      catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const toggleFeatured = async (f) => {
    const nextStatus = f.status === "Featured" ? "Reviewed" : "Featured";
    setTogglingId(f.id);
    try {
      const updated = await entities.Feedback.update(f.id, { status: nextStatus });
      setFeedback((prev) => prev.map((x) => x.id === f.id ? updated : x));
    } catch (e) { console.error(e); }
    setTogglingId(null);
  };

  const remove = async (f) => {
    if (!confirm(`Delete this review from ${f.customer_name}?`)) return;
    setDeletingId(f.id);
    try {
      await entities.Feedback.delete(f.id);
      setFeedback((prev) => prev.filter((x) => x.id !== f.id));
    } catch (e) { console.error(e); }
    setDeletingId(null);
  };

  const avgRating = feedback.length
    ? (feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.length).toFixed(1)
    : "—";

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center">
            <MessageSquareQuote className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-heading font-semibold text-[15px]">Website Feedback</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[13px] font-semibold">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          {avgRating}
          <span className="text-muted-foreground font-normal text-[12px]">· {feedback.length} reviews</span>
        </div>
      </div>
      {loading ? (
        <div className="py-6 flex justify-center"><div className="w-6 h-6 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
      ) : feedback.length === 0 ? (
        <EmptyState icon={MessageSquareQuote} title="No feedback yet" description="Customer reviews submitted on your website will appear here." />
      ) : (
        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
          {feedback.map((f) => (
            <div key={f.id} className="p-3 rounded-xl bg-muted/30">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/20 to-rose-500/20 flex items-center justify-center text-[11px] font-semibold">
                    {f.customer_name?.split(" ").map((n) => n[0]).slice(0, 2).join("") || "?"}
                  </div>
                  <span className="text-[13px] font-medium">{f.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={cn("w-3 h-3", n <= (f.rating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
                    ))}
                  </div>
                  <button
                    disabled={togglingId === f.id}
                    onClick={() => toggleFeatured(f)}
                    title={f.status === "Featured" ? "Remove from public testimonials" : "Show as a public testimonial"}
                    className={cn(
                      "w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 disabled:opacity-50",
                      f.status === "Featured" ? "bg-rose-600 border-rose-600" : "border-border hover:bg-muted"
                    )}
                  >
                    <Star className={cn("w-3.5 h-3.5", f.status === "Featured" ? "fill-white text-white" : "text-muted-foreground")} />
                  </button>
                  <button
                    disabled={deletingId === f.id}
                    onClick={() => remove(f)}
                    title="Delete this review"
                    className="w-6 h-6 rounded-lg border border-border hover:bg-destructive/10 hover:border-destructive/40 flex items-center justify-center shrink-0 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
              {f.message && <p className="text-[12.5px] text-muted-foreground leading-relaxed line-clamp-3">{f.message}</p>}
              {f.dessert_name && <div className="text-[11px] text-muted-foreground mt-1">on {f.dessert_name}</div>}
              {f.status === "Featured" && <div className="text-[10.5px] text-rose-600 dark:text-rose-400 font-medium mt-1">Shown as testimonial on website</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}