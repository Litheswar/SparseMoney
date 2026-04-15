import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, LockKeyhole, User, Mail, KeyRound, WalletCards } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const { signup, isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Please enter your name'); return; }
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); setShakeKey(k => k + 1); return; }

    setIsLoading(true);
    const result = await signup(name.trim(), email.trim(), password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Signup failed');
      setShakeKey(k => k + 1);
    }
  };

  const generatedUPI = name.trim()
    ? `${name.trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)}@sparesmart`
    : '';

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,hsl(174_62%_88%/.75),transparent_34%),linear-gradient(145deg,hsl(174_62%_92%),hsl(180_10%_98%)_46%,white)] p-4">
      <motion.div
        initial={{ opacity: 0, x: 48 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-md flex-col justify-center"
      >
        <div className="mb-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="mb-3 inline-flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-primary shadow-xl shadow-primary/20 animate-pulse-glow">
              <WalletCards className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-gradient">SpareSmart</h1>
          </motion.div>
          <p className="text-muted-foreground">Create your account and start investing spare change</p>
        </div>

        <motion.div
          key={shakeKey}
          animate={error ? { x: [0, -10, 10, -7, 7, 0] } : { x: 0 }}
          transition={{ duration: 0.42 }}
          className="glass-card rounded-lg border-white/70 bg-white/85 p-8 shadow-2xl shadow-primary/10"
        >
          <div className="mb-6">
            <h2 className="font-heading text-2xl font-bold tracking-normal text-foreground">Create Account</h2>
            <p className="mt-1 text-sm text-muted-foreground">Join thousands of smart micro-investors</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  placeholder="Enter your full name"
                  className="h-12 pl-10 rounded-lg bg-white/90"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  className="h-12 pl-10 rounded-lg bg-white/90"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Min 6 characters"
                  className="h-12 pl-10 rounded-lg bg-white/90"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Confirm Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="Re-enter password"
                  className="h-12 pl-10 rounded-lg bg-white/90"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* UPI Preview */}
            <AnimatePresence>
              {generatedUPI && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 rounded-lg border border-primary/15 bg-primary/5 px-4 py-3">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Your SpareSmart UPI</p>
                      <p className="text-sm font-bold text-primary font-mono">{generatedUPI}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-sm font-medium text-destructive"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={isLoading}
              className="relative h-12 w-full overflow-hidden rounded-lg bg-[linear-gradient(135deg,hsl(174_62%_40%),hsl(190_76%_42%),hsl(174_62%_55%))] bg-[length:200%_100%] text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-500 hover:bg-[position:100%_0] active:scale-[0.99]"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</>
              ) : (
                <>Create Account <ArrowRight className="h-4 w-4 ml-2" /></>
              )}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-2 rounded-lg border border-primary/10 bg-primary/5 px-4 py-3 text-xs font-medium text-muted-foreground">
            <LockKeyhole className="h-4 w-4 shrink-0 text-primary" />
            Your data is encrypted and stored securely
          </div>
        </motion.div>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <Button asChild variant="ghost" className="mx-auto mt-2 rounded-lg text-muted-foreground hover:text-primary">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
