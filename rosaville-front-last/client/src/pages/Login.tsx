import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const [, navigate] = useLocation();
  const { checkUserAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.auth.login(email, password);
      await checkUserAuth();
      navigate('/account');
    } catch {
      toast.error('Incorrect email or password.');
    }
    setSubmitting(false);
  };

  return (
    <div className="w-full bg-background min-h-screen">
      <section className="py-20">
        <div className="container max-w-md">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-8 text-center">Log In</h1>
          <form onSubmit={handleSubmit} className="bg-white border border-border rounded-lg p-6 space-y-4">
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
            <div>
              <label className="block font-sans font-semibold text-foreground mb-2">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-border rounded px-4 py-2 font-sans focus:outline-none focus:border-cta"
              />
            </div>
            <div className="text-right -mt-2">
              <Link href="/forgot-password" className="font-sans text-sm text-accent hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-cta text-white hover:bg-cta-hover font-sans font-semibold py-4"
            >
              {submitting ? 'Logging in…' : 'Log In'}
            </Button>
          </form>
          <p className="font-sans text-sm text-foreground/70 text-center mt-4">
            Don't have an account?{' '}
            <Link href="/signup" className="text-accent hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
