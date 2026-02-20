import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const Auth = () => {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);

    const { error } = await (await import('@/integrations/supabase/client')).supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success('Magic link sent! Check your inbox.');
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="glass-strong rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl text-foreground">
              {sent ? 'Check your email' : 'Welcome'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {sent
                ? `We sent a sign-in link to ${email}`
                : 'Enter your email to get a magic sign-in link.'}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass border-foreground/10"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl glass-strong text-foreground font-medium hover:bg-white/50 transition-colors disabled:opacity-50"
              >
                {submitting ? '...' : 'Send magic link'}
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-xs text-muted-foreground">
                Didn't get it? Check spam or try again.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-foreground underline underline-offset-2"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
