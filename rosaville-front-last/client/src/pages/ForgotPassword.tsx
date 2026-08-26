import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.auth.requestPasswordReset(email);
    } catch {
      // Intentionally still show the generic confirmation below — the
      // backend never reveals whether an account exists for this email.
    }
    setSent(true);
    setSubmitting(false);
  };

  return (
    <div className="w-full bg-background min-h-screen">
      <section className="py-20">
        <div className="container max-w-md">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-8 text-center">Reset Password</h1>
          {sent ? (
            <div className="bg-white border border-border rounded-lg p-6 text-center">
              <p className="font-sans text-foreground">
                If an account exists with that email, we've sent a link to reset your password.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-border rounded-lg p-6 space-y-4">
              <p className="font-sans text-sm text-foreground/70">
                Enter the email address on your account and we'll send you a link to reset your password.
              </p>
              <div>
                <label className="block font-sans font-semibold text-foreground mb-2">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-border rounded px-4 py-2 font-sans focus:outline-none focus:border-cta"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-cta text-white hover:bg-cta-hover font-sans font-semibold py-4"
              >
                {submitting ? 'Sending…' : 'Send Reset Link'}
              </Button>
            </form>
          )}
          <p className="font-sans text-sm text-foreground/70 text-center mt-4">
            <Link href="/login" className="text-accent hover:underline">
              Back to log in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
