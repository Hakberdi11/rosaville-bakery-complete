import React, { useEffect, useState, useCallback } from "react";
import { integrations } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/admin/PageHeader";
import SocialAccountCard from "@/components/admin/SocialAccountCard";
import { Button } from "@/components/ui/button";
import { Share2, Instagram, Facebook, Music2, RefreshCw, Heart, MessageCircle, Eye } from "lucide-react";

const PLATFORMS = [
  { platform: "instagram", label: "Instagram", icon: Instagram },
  { platform: "facebook", label: "Facebook", icon: Facebook },
  { platform: "tiktok", label: "TikTok", icon: Music2 },
];

export default function SocialMedia() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [analytics, setAnalytics] = useState({}); // { [platform]: data | "error" | undefined }
  const [refreshing, setRefreshing] = useState({});

  const loadAccounts = useCallback(async () => {
    try {
      const data = await integrations.listAccounts();
      setAccounts(data);
    } catch (e) {
      console.error(e);
    }
    setLoadingAccounts(false);
  }, []);

  useEffect(() => {
    loadAccounts();

    const params = new URLSearchParams(window.location.search);
    if (params.get("connected")) {
      toast({ title: "Account connected", description: `${params.get("connected")} is now linked.` });
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("error")) {
      toast({ title: "Connection failed", description: "The provider didn't complete the connection. Please try again.", variant: "destructive" });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [loadAccounts, toast]);

  const accountFor = (platform) => accounts.find((a) => a.platform === platform);

  const loadAnalytics = useCallback(async (platform) => {
    setRefreshing((r) => ({ ...r, [platform]: true }));
    try {
      const data = await integrations.getAnalytics(platform);
      setAnalytics((a) => ({ ...a, [platform]: data }));
    } catch (e) {
      console.error(e);
      setAnalytics((a) => ({ ...a, [platform]: "error" }));
    }
    setRefreshing((r) => ({ ...r, [platform]: false }));
  }, []);

  useEffect(() => {
    accounts.forEach((a) => loadAnalytics(a.platform));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  return (
    <div className="p-5 lg:p-8 max-w-[1000px] mx-auto">
      <PageHeader title="Social Media" description="Connect Rosaville's real accounts and see live follower/engagement numbers." icon={Share2} />

      <div className="rounded-2xl border border-border/60 bg-card p-5 mb-5">
        <h3 className="font-heading font-semibold text-[15px] mb-4">Accounts</h3>
        {loadingAccounts ? (
          <p className="text-[13px] text-muted-foreground">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PLATFORMS.map(({ platform, label, icon }) => (
              <SocialAccountCard
                key={platform}
                platform={platform}
                label={label}
                icon={icon}
                account={accountFor(platform)}
                onChanged={loadAccounts}
              />
            ))}
          </div>
        )}
      </div>

      {PLATFORMS.filter(({ platform }) => accountFor(platform)).map(({ platform, label, icon: Icon }) => {
        const data = analytics[platform];
        return (
          <div key={platform} className="rounded-2xl border border-border/60 bg-card p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><Icon className="w-4 h-4" /><h3 className="font-heading font-semibold text-[15px]">{label} Analytics</h3></div>
              <Button size="sm" variant="outline" className="gap-1.5 text-[12px]" onClick={() => loadAnalytics(platform)} disabled={refreshing[platform]}>
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing[platform] ? "animate-spin" : ""}`} /> Refresh
              </Button>
            </div>

            {data === "error" && <p className="text-[13px] text-rose-600">Could not load analytics right now.</p>}
            {!data && <p className="text-[13px] text-muted-foreground">Loading…</p>}
            {data && data !== "error" && (
              <>
                <div className="text-[13px] text-muted-foreground mb-4">
                  <span className="text-foreground font-semibold text-[15px]">{Number(data.follower_count || 0).toLocaleString()}</span> followers
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(data.posts || []).map((p, i) => (
                    <div key={i} className="rounded-xl border border-border/60 p-3">
                      {p.caption && <p className="text-[12.5px] line-clamp-2 mb-2">{p.caption}</p>}
                      <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                        {typeof p.views === "number" && <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {p.views.toLocaleString()}</span>}
                        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {(p.likes || 0).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {(p.comments || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {(data.posts || []).length === 0 && <p className="text-[12.5px] text-muted-foreground italic">No recent posts.</p>}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
