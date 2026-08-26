import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Signup() {
  const [, navigate] = useLocation();
  const { checkUserAuth } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.auth.register({ email, password, full_name: fullName });
      await checkUserAuth();
      toast.success('Account created!');
      navigate('/account');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create your account.');
    }
    setSubmitting(false);
  };

  return (
    <div className="w-full bg-background min-h-screen">
      <section className="py-20">
        <div className="container max-w-md">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-8 text-center">Create an Account</h1>
          <form onSubmit={handleSubmit} className="bg-white border border-border rounded-lg p-6 space-y-4">
            <div>
              <label className="block font-sans font-semibold text-foreground mb-2">Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full border border-border rounded px-4 py-2 font-sans focus:outline-none focus:border-cta"
              />
            </div>
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
                minLength={8}
                className="w-full border border-border rounded px-4 py-2 font-sans focus:outline-none focus:border-cta"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-cta text-white hover:bg-cta-hover font-sans font-semibold py-4"
            >
              {submitting ? 'Creating Account…' : 'Sign Up'}
            </Button>
          </form>
          <p className="font-sans text-sm text-foreground/70 text-center mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
