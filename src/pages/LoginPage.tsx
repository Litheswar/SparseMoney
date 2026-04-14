import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Loader2, LockKeyhole, ShieldCheck, WalletCards } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth, type UserRole } from '@/context/AuthContext';

const roleConfig = {
  user: {
    label: 'User Access',
    context: 'You are logging in as: USER',
    email: 'user@sparesmart.com',
    Icon: WalletCards,
  },
  admin: {
    label: 'Admin Access',
    context: 'You are logging in as: ADMIN',
    email: 'admin@sparesmart.com',
    Icon: ShieldCheck,
  },
} satisfies Record<UserRole, { label: string; context: string; email: string; Icon: typeof WalletCards }>;

export default function LoginPage() {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const role = roleParam === 'admin' || roleParam === 'user' ? roleParam : null;
  const config = role ? roleConfig[role] : null;
  const [email, setEmail] = useState(config?.email ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  if (!role || !config) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    window.setTimeout(() => {
      const didLogin = login(email, password, role);
      setIsVerifying(false);

      if (!didLogin) {
        setError('Invalid credentials for this access level');
        setShakeKey((value) => value + 1);
      }
    }, 700);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,hsl(174_62%_88%/.75),transparent_34%),linear-gradient(145deg,hsl(174_62%_92%),hsl(180_10%_98%)_46%,white)] p-4">
      <motion.div
        initial={{ opacity: 0, x: 48 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -48 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-md flex-col justify-center"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="mb-4 inline-flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-primary shadow-xl shadow-primary/20 animate-pulse-glow">
              <WalletCards className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-gradient">SpareSmart</h1>
          </motion.div>
          <p className="text-muted-foreground">Turn your daily spending into intelligent investments</p>
        </div>

        <motion.div
          key={shakeKey}
          animate={error ? { x: [0, -10, 10, -7, 7, 0] } : { x: 0 }}
          transition={{ duration: 0.42 }}
          className="glass-card rounded-lg border-white/70 bg-white/85 p-8 shadow-2xl shadow-primary/10"
        >
          <div className="mb-7">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
              <config.Icon className="h-4 w-4" />
              {config.label}
            </div>
            <h2 className="font-heading text-2xl font-bold tracking-normal text-foreground">{config.context}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Secure login powered by encrypted protocols</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="Enter your email"
                className={`h-12 rounded-lg bg-white/90 transition-all duration-300 focus-visible:border-primary focus-visible:ring-primary/25 ${error ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                disabled={isVerifying}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter password"
                className={`h-12 rounded-lg bg-white/90 transition-all duration-300 focus-visible:border-primary focus-visible:ring-primary/25 ${error ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                disabled={isVerifying}
              />
            </div>
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
              disabled={isVerifying}
              className="relative h-12 w-full overflow-hidden rounded-lg bg-[linear-gradient(135deg,hsl(174_62%_40%),hsl(190_76%_42%),hsl(174_62%_55%))] bg-[length:200%_100%] text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-500 hover:bg-[position:100%_0] active:scale-[0.99]"
            >
              <span className="absolute inset-0 scale-0 rounded-full bg-white/25 opacity-0 transition-all duration-300 active:scale-100 active:opacity-100" />
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying credentials...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-2 rounded-lg border border-primary/10 bg-primary/5 px-4 py-3 text-xs font-medium text-muted-foreground">
            <LockKeyhole className="h-4 w-4 shrink-0 text-primary" />
            Your financial data is protected
          </div>
        </motion.div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <LockKeyhole className="h-3.5 w-3.5 text-primary" />
          <span>256-bit encryption - RBI compliant - Secure AA framework</span>
        </div>

        <Button asChild variant="ghost" className="mx-auto mt-4 rounded-lg text-muted-foreground hover:text-primary">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Change access type
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}


