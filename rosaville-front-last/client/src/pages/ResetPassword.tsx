import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const uid = params.get('uid') || '';
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.auth.confirmPasswordReset(uid, token, password);
      setDone(true);
    } catch (err) {
      let message = 'Could not reset your password. The link may have expired.';
      if (err instanceof Error) {
        try {
          message = JSON.parse(err.message).detail || message;
        } catch {
          // keep default message
        }
      }
      setError(message);
    }
    setSubmitting(false);
  };

  if (!uid || !token) {
    return (
      <div className="w-full bg-background min-h-screen">
        <section className="py-20">
          <div className="container max-w-md text-center">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-4">Reset Password</h1>
            <p className="font-sans text-foreground/70 mb-4">This reset link is invalid or incomplete.</p>
            <Link href="/forgot-password" className="text-accent hover:underline font-sans">
              Request a new link
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full bg-background min-h-screen">
      <section className="py-20">
        <div className="container max-w-md">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-8 text-center">Set a New Password</h1>
          {done ? (
            <div className="bg-white border border-border rounded-lg p-6 text-center space-y-4">
              <p className="font-sans text-foreground">Your password has been updated.</p>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-cta text-white hover:bg-cta-hover font-sans font-semibold py-4"
              >
                Log In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-border rounded-lg p-6 space-y-4">
              {error && <p className="font-sans text-sm text-destructive">{error}</p>}
              <div>
                <label className="block font-sans font-semibold text-foreground mb-2">New Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full border border-border rounded px-4 py-2 font-sans focus:outline-none focus:border-cta"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-cta text-white hover:bg-cta-hover font-sans font-semibold py-4"
              >
                {submitting ? 'Saving…' : 'Save New Password'}
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
