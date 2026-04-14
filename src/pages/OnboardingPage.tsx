import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, CheckCircle2, ChevronRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const BANKS = [
  { id: 'sbi', name: 'State Bank of India', short: 'SBI', color: 'hsl(220 70% 50%)' },
  { id: 'hdfc', name: 'HDFC Bank', short: 'HDFC', color: 'hsl(0 72% 50%)' },
  { id: 'icici', name: 'ICICI Bank', short: 'ICICI', color: 'hsl(25 90% 50%)' },
  { id: 'axis', name: 'Axis Bank', short: 'AXIS', color: 'hsl(330 70% 45%)' },
];

type Step = 'bank' | 'consent' | 'connecting' | 'success';

export default function OnboardingPage() {
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState<Step>('bank');
  const [selectedBank, setSelectedBank] = useState('');
  const [permissions, setPermissions] = useState({
    transactions: true,
    balance: true,
    profile: true,
    investments: false,
  });
  const [connectionStep, setConnectionStep] = useState(0);

  const connectionSteps = [
    'Establishing secure connection…',
    'Verifying identity…',
    'Fetching transactions…',
    'Encrypting data…',
  ];

  const handleConnect = () => {
    setStep('connecting');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setConnectionStep(i);
      if (i >= connectionSteps.length) {
        clearInterval(interval);
        setTimeout(() => setStep('success'), 800);
      }
    }, 1200);
  };

  const handleComplete = () => {
    const bank = BANKS.find(b => b.id === selectedBank);
    completeOnboarding(bank?.short || 'BANK');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {/* STEP 1: Bank Selection */}
          {step === 'bank' && (
            <motion.div
              key="bank"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-8"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-7 h-7 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold font-heading text-foreground">Connect Your Bank</h2>
                <p className="text-sm text-muted-foreground mt-1">Securely link via Account Aggregator framework</p>
              </div>
              <div className="space-y-3">
                {BANKS.map(bank => (
                  <motion.button
                    key={bank.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedBank(bank.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      selectedBank === bank.id
                        ? 'border-primary bg-accent'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-sm" style={{ background: bank.color }}>
                      {bank.short.slice(0, 2)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">{bank.name}</p>
                      <p className="text-xs text-muted-foreground">Savings & Current Accounts</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </motion.button>
                ))}
              </div>
              <Button
                onClick={() => setStep('consent')}
                disabled={!selectedBank}
                className="w-full mt-6 rounded-xl gradient-primary text-primary-foreground h-11"
              >
                Continue
              </Button>
            </motion.div>
          )}

          {/* STEP 2: Consent */}
          {step === 'consent' && (
            <motion.div
              key="consent"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-8"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-heading text-foreground">Data Consent</h2>
                <p className="text-sm text-muted-foreground mt-1">Review and approve data access</p>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 mb-4 text-sm">
                <p className="font-medium text-foreground mb-1">FIP: {BANKS.find(b => b.id === selectedBank)?.name}</p>
                <p className="text-muted-foreground">Duration: 12 months · Purpose: Micro-investments</p>
              </div>

              <div className="space-y-3 mb-6">
                {Object.entries(permissions).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">{key} Data</p>
                      <p className="text-xs text-muted-foreground">
                        {key === 'transactions' ? 'Last 6 months of transactions' :
                         key === 'balance' ? 'Current account balance' :
                         key === 'profile' ? 'Account holder name' : 'Investment holdings'}
                      </p>
                    </div>
                    <Switch
                      checked={val}
                      onCheckedChange={v => setPermissions(p => ({ ...p, [key]: v }))}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Lock className="w-3.5 h-3.5" />
                <span>End-to-end encrypted · You can revoke anytime</span>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('bank')} className="flex-1 rounded-xl">Back</Button>
                <Button onClick={handleConnect} className="flex-1 rounded-xl gradient-primary text-primary-foreground">
                  Approve & Connect
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Connecting */}
          {step === 'connecting' && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                <Lock className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="space-y-4">
                {connectionSteps.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: i <= connectionStep ? 1 : 0.3, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      i < connectionStep ? 'bg-success text-success-foreground' :
                      i === connectionStep ? 'gradient-primary text-primary-foreground animate-pulse' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {i < connectionStep ? '✓' : i + 1}
                    </div>
                    <span className={`text-sm ${i <= connectionStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {s}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 4: Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-success" />
              </motion.div>
              <h2 className="text-2xl font-bold font-heading text-foreground mb-2">Bank Connected!</h2>
              <p className="text-muted-foreground mb-2">
                {BANKS.find(b => b.id === selectedBank)?.name}
              </p>
              <div className="bg-muted/50 rounded-xl p-3 inline-block mb-6">
                <p className="text-sm font-mono text-foreground">A/C: XXXX-XXXX-{Math.floor(1000 + Math.random() * 9000)}</p>
              </div>
              <Button
                onClick={handleComplete}
                className="w-full rounded-xl gradient-primary text-primary-foreground h-11"
              >
                Go to Dashboard →
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
