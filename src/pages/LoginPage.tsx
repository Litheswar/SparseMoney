import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Wallet, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(email, password)) {
      setError('Invalid credentials');
    }
  };

  const quickLogin = (role: 'user' | 'admin') => {
    const creds = role === 'user'
      ? { email: 'user@sparesmart.com', pass: 'user123' }
      : { email: 'admin@sparesmart.com', pass: 'admin123' };
    setEmail(creds.email);
    setPassword(creds.pass);
    login(creds.email, creds.pass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg animate-pulse-glow">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold font-heading text-gradient">SpareSmart</h1>
          </motion.div>
          <p className="text-muted-foreground">Intelligent Micro-Investment Platform</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="rounded-xl"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full rounded-xl gradient-primary text-primary-foreground h-11">
              Sign In
            </Button>
          </form>

          <div className="mt-6 space-y-2">
            <p className="text-xs text-muted-foreground text-center mb-3">Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => quickLogin('user')} className="rounded-xl text-sm">
                <TrendingUp className="w-4 h-4 mr-1.5" /> User Demo
              </Button>
              <Button variant="outline" onClick={() => quickLogin('admin')} className="rounded-xl text-sm">
                <Shield className="w-4 h-4 mr-1.5" /> Admin Demo
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          <span>256-bit encryption · RBI compliant · SEBI registered</span>
        </div>
      </motion.div>
    </div>
  );
}
