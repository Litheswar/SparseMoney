import { useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Banknote,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Landmark,
  Loader2,
  Lock,
  ReceiptText,
  Shield,
  WalletCards,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const BANKS = [
  { id: 'sbi', name: 'State Bank of India', short: 'SBI', color: 'hsl(218 78% 46%)', mark: 'S' },
  { id: 'hdfc', name: 'HDFC Bank', short: 'HDFC', color: 'hsl(355 78% 48%)', mark: 'H' },
  { id: 'icici', name: 'ICICI Bank', short: 'ICICI', color: 'hsl(24 88% 50%)', mark: 'i' },
  { id: 'axis', name: 'Axis Bank', short: 'AXIS', color: 'hsl(332 72% 38%)', mark: 'A' },
];

const CONSENT_ITEMS = [
  { key: 'transactions', title: 'Transactions', detail: 'Last 6 months of transaction history', Icon: ReceiptText },
  { key: 'balance', title: 'Balance', detail: 'Current account balance and account status', Icon: Banknote },
  { key: 'profile', title: 'Profile', detail: 'Account holder name and linked account metadata', Icon: CircleUserRound },
] as const;

const PROCESSING_STEPS = [
  'Establishing secure connection',
  'Verifying identity',
  'Fetching transactions',
  'Encrypting data',
];

type Step = 'bank' | 'consent' | 'connecting' | 'success';
type PermissionKey = (typeof CONSENT_ITEMS)[number]['key'];

const stepOrder: Step[] = ['bank', 'consent', 'connecting', 'success'];

export default function OnboardingPage() {
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState<Step>('bank');
  const [selectedBank, setSelectedBank] = useState('');
  const [permissions, setPermissions] = useState<Record<PermissionKey, boolean>>({
    transactions: true,
    balance: true,
    profile: true,
  });
  const [connectionStep, setConnectionStep] = useState(0);
  const [accountSuffix] = useState(() => Math.floor(1000 + Math.random() * 9000));

  const selectedBankInfo = BANKS.find((bank) => bank.id === selectedBank);
  const currentStepIndex = stepOrder.indexOf(step);

  const processingMessage = useMemo(() => {
    if (!selectedBankInfo) return 'Preparing secure AA session...';
    if (connectionStep <= 1) return `Connecting to ${selectedBankInfo.name} secure servers...`;
    if (connectionStep === 2) return 'Verifying consent via AA network...';
    if (connectionStep === 3) return 'Fetching transaction data with encrypted transport...';
    return 'Encrypting account insights for SpareSmart...';
  }, [connectionStep, selectedBankInfo]);

  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
    window.setTimeout(() => setStep('consent'), 260);
  };

  const handleConnect = () => {
    setStep('connecting');
    setConnectionStep(0);

    let next = 0;
    const interval = window.setInterval(() => {
      next += 1;
      setConnectionStep(next);

      if (next >= PROCESSING_STEPS.length) {
        window.clearInterval(interval);
        window.setTimeout(() => setStep('success'), 700);
      }
    }, 1050);
  };

  const handleComplete = () => {
    completeOnboarding(selectedBankInfo?.short || 'BANK');
  };

  const cardMotion = {
    initial: { opacity: 0, x: 48, scale: 0.98 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -48, scale: 0.98 },
    transition: { duration: 0.42, ease: 'easeOut' },
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,hsl(174_62%_88%/.72),transparent_35%),linear-gradient(145deg,hsl(180_15%_96%),white_48%,hsl(174_40%_96%))] px-4 py-8 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl flex-col justify-center">
        <div className="mb-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-4 py-2 text-xs font-semibold text-primary shadow-sm backdrop-blur"
          >
            <Shield className="h-4 w-4" />
            RBI Account Aggregator onboarding
          </motion.div>
          <div className="mx-auto grid max-w-sm grid-cols-4 gap-2">
            {stepOrder.map((item, index) => (
              <div key={item} className={`h-1.5 rounded-full ${index <= currentStepIndex ? 'bg-primary' : 'bg-primary/15'}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'bank' && (
            <motion.section key="bank" {...cardMotion} className="glass-card rounded-lg border-white/70 bg-white/88 p-8 shadow-2xl shadow-primary/10">
              <div className="mb-7 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg gradient-primary shadow-xl shadow-primary/20">
                  <Landmark className="h-7 w-7 text-primary-foreground" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-foreground">Connect Your Bank</h1>
                <p className="mt-2 text-sm text-muted-foreground">Supported by Account Aggregator Framework</p>
              </div>

              <div className="space-y-3">
                {BANKS.map((bank, index) => {
                  const isSelected = selectedBank === bank.id;

                  return (
                    <motion.button
                      key={bank.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.35 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleBankSelect(bank.id)}
                      className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-lg border p-4 text-left shadow-sm transition-colors duration-300 ${
                        isSelected ? 'border-primary bg-primary/10' : 'border-border/70 bg-gradient-to-br from-white to-primary/5 hover:border-primary/50'
                      }`}
                      style={{ boxShadow: isSelected ? `0 18px 45px ${bank.color}22` : undefined }}
                    >
                      <div className="absolute inset-y-0 left-0 w-1 opacity-80" style={{ background: bank.color }} />
                      <motion.div
                        whileHover={{ scale: 1.08 }}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${bank.color}, hsl(174 62% 42%))` }}
                      >
                        {bank.mark}
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground">{bank.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Savings and current accounts</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>
          )}

          {step === 'consent' && selectedBankInfo && (
            <motion.section key="consent" {...cardMotion} className="glass-card rounded-lg border-white/70 bg-white/88 p-8 shadow-2xl shadow-primary/10">
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setStep('bank')}
                  className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Change bank
                </button>
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-lg border border-primary/15 bg-primary/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-normal text-primary">Selected</p>
                  <p className="mt-1 font-heading text-xl font-bold text-foreground">{selectedBankInfo.name}</p>
                </motion.div>
              </div>

              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Shield className="h-7 w-7" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-foreground">Consent Summary</h1>
                <p className="mt-2 text-sm text-muted-foreground">Review the AA data request before authorising access</p>
              </div>

              <div className="space-y-4 rounded-lg border border-border/70 bg-white/80 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">Data Requested</p>
                  <div className="mt-3 space-y-3">
                    {CONSENT_ITEMS.map(({ key, title, detail, Icon }) => (
                      <div key={key} className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{title}</p>
                            <p className="text-xs text-muted-foreground">{detail}</p>
                          </div>
                        </div>
                        <Switch
                          checked={permissions[key]}
                          onCheckedChange={(value) => setPermissions((current) => ({ ...current, [key]: value }))}
                          className="data-[state=checked]:shadow-[0_0_18px_hsl(174_62%_40%/.35)]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 border-t border-border/70 pt-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs font-semibold text-muted-foreground">Purpose</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">To enable automated micro-investments</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs font-semibold text-muted-foreground">Duration</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">Valid for 12 months</p>
                  </div>
                </div>
              </div>

              <div className="my-5 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
                <motion.span animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="text-primary">
                  <Lock className="h-4 w-4" />
                </motion.span>
                End-to-end encrypted - Revoke anytime
              </div>

              <Button
                onClick={handleConnect}
                disabled={!Object.values(permissions).some(Boolean)}
                className="relative h-12 w-full overflow-hidden rounded-lg bg-[linear-gradient(135deg,hsl(174_62%_40%),hsl(190_76%_42%),hsl(174_62%_55%))] bg-[length:200%_100%] text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-500 hover:-translate-y-0.5 hover:bg-[position:100%_0] active:scale-[0.99]"
              >
                Approve and Connect
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.section>
          )}

          {step === 'connecting' && selectedBankInfo && (
            <motion.section
              key="connecting"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.42, ease: 'easeOut' }}
              className="relative overflow-hidden rounded-lg border border-white/70 bg-white/88 p-8 text-center shadow-2xl shadow-primary/10 backdrop-blur-xl"
            >
              <motion.div
                className="absolute inset-0 bg-[linear-gradient(120deg,hsl(174_62%_92%/.8),transparent,hsl(190_76%_92%/.9))] opacity-70"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                style={{ backgroundSize: '220% 220%' }}
              />
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.08, 1], rotate: [0, -4, 4, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full gradient-primary shadow-2xl shadow-primary/30"
                >
                  <Lock className="h-9 w-9 text-primary-foreground" />
                </motion.div>
                <h1 className="font-heading text-2xl font-bold text-foreground">Secure Processing</h1>
                <p className="mt-2 text-sm font-medium text-muted-foreground">{processingMessage}</p>

                <div className="mt-8 space-y-4 text-left">
                  {PROCESSING_STEPS.map((label, index) => {
                    const isComplete = index < connectionStep;
                    const isActive = index === connectionStep;

                    return (
                      <motion.div
                        key={label}
                        animate={{ opacity: isComplete || isActive ? 1 : 0.45, x: isActive ? 4 : 0 }}
                        className="flex items-center gap-3 rounded-lg border border-white/70 bg-white/75 p-3 shadow-sm"
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isComplete ? 'bg-success text-success-foreground' : isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          {isComplete ? <Check className="h-4 w-4" /> : isActive ? <Loader2 className="h-4 w-4 animate-spin" /> : index + 1}
                        </div>
                        <span className="text-sm font-semibold text-foreground">{label}</span>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-7 h-2 overflow-hidden rounded-full bg-primary/10">
                  <motion.div
                    className="h-full rounded-full bg-[linear-gradient(90deg,hsl(174_62%_40%),hsl(152_60%_42%))]"
                    animate={{ width: `${Math.min(100, (connectionStep / PROCESSING_STEPS.length) * 100)}%` }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </motion.section>
          )}

          {step === 'success' && selectedBankInfo && (
            <motion.section
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 170, damping: 18 }}
              className="relative overflow-hidden rounded-lg border border-success/20 bg-white/90 p-8 text-center shadow-2xl shadow-success/20 backdrop-blur-xl"
            >
              {[...Array(14)].map((_, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 0, scale: 0.4 }}
                  animate={{ opacity: [0, 0.65, 0], y: [-4, -80 - index * 2], x: (index % 2 === 0 ? 1 : -1) * (18 + index * 4), scale: [0.4, 1, 0.8] }}
                  transition={{ duration: 1.8, delay: index * 0.04 }}
                  className="absolute left-1/2 top-24 h-1.5 w-1.5 rounded-full bg-success/60"
                />
              ))}

              <div className="absolute inset-x-10 top-8 h-36 rounded-full bg-success/15 blur-3xl" />
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 15 }}
                  className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/10 shadow-2xl shadow-success/25"
                >
                  <CheckCircle2 className="h-14 w-14 text-success" />
                </motion.div>
                <h1 className="font-heading text-3xl font-bold text-foreground">Bank Connected</h1>
                <p className="mt-3 text-muted-foreground">{selectedBankInfo.name}</p>
                <p className="mt-2 text-sm font-semibold text-success">Account securely linked via AA framework</p>

                <div className="mx-auto my-7 inline-flex items-center gap-3 rounded-lg border border-success/20 bg-success/5 px-4 py-3">
                  <WalletCards className="h-5 w-5 text-success" />
                  <span className="font-mono text-sm font-semibold text-foreground">A/C: XXXX-XXXX-{accountSuffix}</span>
                </div>

                <Button
                  onClick={handleComplete}
                  className="relative h-12 w-full overflow-hidden rounded-lg bg-[linear-gradient(135deg,hsl(152_60%_42%),hsl(174_62%_42%),hsl(152_60%_55%))] bg-[length:200%_100%] text-primary-foreground shadow-lg shadow-success/20 transition-all duration-500 hover:-translate-y-0.5 hover:bg-[position:100%_0] active:scale-[0.99]"
                >
                  <span className="absolute inset-0 scale-0 rounded-full bg-white/25 opacity-0 transition-all duration-300 active:scale-100 active:opacity-100" />
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
