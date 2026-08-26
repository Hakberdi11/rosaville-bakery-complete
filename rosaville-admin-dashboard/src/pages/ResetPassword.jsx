import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Lock, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.confirmPasswordReset(uid, token, password);
      setDone(true);
    } catch (err) {
      setError(err.message || "Could not reset your password. The link may have expired.");
    }
    setLoading(false);
  };

  if (!uid || !token) {
    return (
      <AuthLayout icon={KeyRound} title="Reset password" subtitle={null} footer={null}>
        <p className="text-sm text-muted-foreground text-center">
          This reset link is invalid or incomplete.{" "}
          <Link to="/forgot-password" className="text-primary hover:underline">Request a new link</Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout icon={KeyRound} title="Set a new password" subtitle={null} footer={null}>
      {done ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">Your password has been updated.</p>
          <Button className="w-full h-12 font-medium" onClick={() => navigate("/login")}>Log In</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                autoFocus
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12"
                minLength={8}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              "Save New Password"
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
