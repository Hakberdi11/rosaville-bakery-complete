import React, { useState } from "react";
import { integrations } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Link2, Unlink } from "lucide-react";

// One platform's connect/disconnect UI. Used on both the Settings page and
// the dedicated Social Media page — same component, same API calls, same
// underlying SocialAccount row, so connecting from either place just works
// everywhere else too.
export default function SocialAccountCard({ platform, label, icon: Icon, account, onChanged }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const isAdmin = user?.role === "admin";

  const connect = async () => {
    setBusy(true);
    try {
      const { authorize_url } = await integrations.getConnectUrl(platform);
      window.location.href = authorize_url;
    } catch (e) {
      toast({ title: `Could not connect ${label}`, description: e.message || "Something went wrong.", variant: "destructive" });
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    try {
      await integrations.disconnect(platform);
      toast({ title: `${label} disconnected` });
      onChanged?.();
    } catch (e) {
      toast({ title: `Could not disconnect ${label}`, description: e.message || "Something went wrong.", variant: "destructive" });
    }
    setBusy(false);
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 p-3.5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div>
          <div className="text-[13.5px] font-medium">{label}</div>
          {account ? (
            <div className="text-[12px] text-muted-foreground">Connected as {account.account_name || account.account_id}</div>
          ) : (
            <div className="text-[12px] text-muted-foreground">Not connected</div>
          )}
        </div>
      </div>
      {isAdmin && (
        account ? (
          <Button size="sm" variant="outline" className="gap-1.5 text-[12px]" onClick={disconnect} disabled={busy}>
            <Unlink className="w-3.5 h-3.5" /> Disconnect
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="gap-1.5 text-[12px]" onClick={connect} disabled={busy}>
            <Link2 className="w-3.5 h-3.5" /> Connect
          </Button>
        )
      )}
    </div>
  );
}
