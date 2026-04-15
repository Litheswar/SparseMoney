import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const BANKS = [
  { id: 'sbi', name: 'State Bank of India', short: 'SBI', color: 'hsl(218 78% 46%)', mark: 'S', type: 'Public' },
  { id: 'hdfc', name: 'HDFC Bank', short: 'HDFC', color: 'hsl(355 78% 48%)', mark: 'H', type: 'Private' },
  { id: 'icici', name: 'ICICI Bank', short: 'ICICI', color: 'hsl(24 88% 50%)', mark: 'i', type: 'Private' },
  { id: 'axis', name: 'Axis Bank', short: 'AXIS', color: 'hsl(332 72% 38%)', mark: 'A', type: 'Private' },
  { id: 'pnb', name: 'Punjab National Bank', short: 'PNB', color: 'hsl(210 100% 35%)', mark: 'P', type: 'Public' },
  { id: 'bob', name: 'Bank of Baroda', short: 'BOB', color: 'hsl(25 95% 53%)', mark: 'B', type: 'Public' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', short: 'KOTAK', color: 'hsl(350 83% 47%)', mark: 'K', type: 'Private' },
  { id: 'canara', name: 'Canara Bank', short: 'CANARA', color: 'hsl(215 90% 40%)', mark: 'C', type: 'Public' },
  { id: 'union', name: 'Union Bank of India', short: 'UNION', color: 'hsl(350 80% 45%)', mark: 'U', type: 'Public' },
  { id: 'indusind', name: 'IndusInd Bank', short: 'INDUS', color: 'hsl(340 70% 35%)', mark: 'I', type: 'Private' },
  { id: 'idbi', name: 'IDBI Bank', short: 'IDBI', color: 'hsl(160 80% 30%)', mark: 'I', type: 'Private' },
  { id: 'boi', name: 'Bank of India', short: 'BOI', color: 'hsl(220 85% 45%)', mark: 'B', type: 'Public' },
  { id: 'yes', name: 'Yes Bank', short: 'YES', color: 'hsl(220 70% 30%)', mark: 'Y', type: 'Private' },
  { id: 'federal', name: 'Federal Bank', short: 'FEDERAL', color: 'hsl(215 80% 45%)', mark: 'F', type: 'Private' },
  { id: 'indian', name: 'Indian Bank', short: 'INDIAN', color: 'hsl(225 75% 40%)', mark: 'I', type: 'Public' },
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

type Step = 'bank' | 'phone' | 'consent' | 'connecting' | 'success';
type PermissionKey = (typeof CONSENT_ITEMS)[number]['key'];

const stepOrder: Step[] = ['bank', 'phone', 'consent', 'connecting', 'success'];

export default function OnboardingPage() {
  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [isFinishing, setIsFinishing] = useState(false);
  const [step, setStep] = useState<Step>('bank');
  const [selectedBank, setSelectedBank] = useState('');
  const [permissions, setPermissions] = useState<Record<PermissionKey, boolean>>({
    transactions: true,
    balance: true,
    profile: true,
  });
  const [connectionStep, setConnectionStep] = useState(0);
  const [accountSuffix] = useState(() => Math.floor(1000 + Math.random() * 9000));
  
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [phoneVerifyStep, setPhoneVerifyStep] = useState(0);

  const selectedBankInfo = BANKS.find((bank) => bank.id === selectedBank);
  const currentStepIndex = stepOrder.indexOf(step);

  const filteredBanks = useMemo(() => {
    if (!searchQuery) return BANKS;
    const query = searchQuery.toLowerCase();
    return BANKS.filter(bank => bank.name.toLowerCase().includes(query) || bank.short.toLowerCase().includes(query));
  }, [searchQuery]);

  const processingMessage = useMemo(() => {
    if (!selectedBankInfo) return 'Preparing secure AA session...';
    if (connectionStep <= 1) return `Connecting to ${selectedBankInfo.name} secure servers...`;
    if (connectionStep === 2) return 'Verifying consent via AA network...';
    if (connectionStep === 3) return 'Fetching transaction data with encrypted transport...';
    return 'Encrypting account insights for SpareSmart...';
  }, [connectionStep, selectedBankInfo]);

  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
    window.setTimeout(() => setStep('phone'), 260);
  };

  const handlePhoneVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) return;
    
    setIsVerifyingPhone(true);
    setPhoneVerifyStep(1);
    
    setTimeout(() => {
      setPhoneVerifyStep(2);
      setTimeout(() => {
        setIsVerifyingPhone(false);
        setStep('consent');
      }, 1200);
    }, 1200);
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
    setIsFinishing(true);
    completeOnboarding(selectedBankInfo?.short || 'BANK');
    
    // Explicitly navigate after a brief delay to show the transition UI
    setTimeout(() => {
      navigate('/dashboard');
    }, 2800);
  };

  const cardMotion = {
    initial: { opacity: 0, x: 48, scale: 0.98 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -48, scale: 0.98 },
    transition: { duration: 0.42, ease: 'easeOut' as const },
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
          <div className="mx-auto flex w-full max-w-md items-center justify-between gap-1 overflow-x-auto px-1 pb-2 scrollbar-none" style={{ flexWrap: 'nowrap' }}>
            {stepOrder.map((item, index) => {
              const isActive = index === currentStepIndex;
              const isPast = index < currentStepIndex;
              return (
                <div key={item} className="flex min-w-[75px] flex-1 flex-col items-center gap-1.5 shrink-0 px-0.5">
                  <div className={`h-1.5 w-full rounded-full transition-all duration-500 overflow-hidden relative ${isPast ? 'bg-success' : 'bg-primary/15'}`}>
                    <motion.div 
                      className={`absolute left-0 top-0 h-full rounded-full ${isActive ? 'bg-primary' : isPast ? 'bg-success' : 'bg-transparent'}`}
                      initial={{ width: isActive ? '50%' : isPast ? '100%' : '0%' }}
                      animate={{ width: isActive ? '100%' : isPast ? '100%' : '0%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <motion.span 
                    animate={{ scale: isActive ? 1.05 : 1 }}
                    className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors duration-300 ${isActive ? 'text-primary' : isPast ? 'text-success' : 'text-muted-foreground/60'}`}
                  >
                    {item === 'connecting' ? 'Processing' : item} {isPast && <Check className="w-2.5 h-2.5" />}
                  </motion.span>
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'bank' && (
            <motion.section key="bank" {...cardMotion} className="glass-card rounded-lg border-white/70 bg-white/88 p-6 sm:p-8 shadow-2xl shadow-primary/10 flex flex-col h-[600px] max-h-[85vh]">
              <div className="shrink-0 mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg gradient-primary shadow-xl shadow-primary/20 relative group">
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg"></div>
                  <Landmark className="h-7 w-7 text-primary-foreground transform group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-foreground">Select your bank</h1>
                <p className="mt-2 text-sm text-muted-foreground">We partner with regulated financial institutions</p>
              </div>

              <div className="shrink-0 mb-4 relative">
                <input 
                  type="text" 
                  placeholder="Search bank..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/50 border border-border/60 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium placeholder:text-muted-foreground/70"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3.5 top-3.5 text-muted-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-3 custom-scrollbar" style={{ scrollbarWidth: 'thin' }}>
                <AnimatePresence>
                  {filteredBanks.map((bank, index) => {
                    const isSelected = selectedBank === bank.id;

                    return (
                      <motion.button
                        layout
                        key={bank.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.04, duration: 0.35 }}
                        whileHover={{ y: -2, scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleBankSelect(bank.id)}
                        className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-lg border p-4 text-left transition-all duration-300 ${
                          isSelected ? 'border-primary bg-primary/10 shadow-[0_8px_30px_hsl(174_62%_40%/.15)]' : 'border-border/70 bg-gradient-to-br from-white to-primary/5 hover:border-primary/40 hover:shadow-md'
                        }`}
                        style={{ boxShadow: isSelected ? `0 18px 45px ${bank.color}22` : undefined }}
                      >
                        <div className={`absolute inset-y-0 left-0 w-1 opacity-80 transition-all duration-300 ${isSelected ? 'w-full opacity-10' : ''}`} style={{ background: bank.color }} />
                        <motion.div
                          whileHover={{ scale: 1.08 }}
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white shadow-lg relative overflow-hidden ring-2 ring-white"
                          style={{ background: `linear-gradient(135deg, ${bank.color}, hsl(220 20% 30%))` }}
                        >
                          <span className="relative z-10">{bank.mark}</span>
                        </motion.div>
                        <div className="min-w-0 flex-1 relative z-10">
                          <p className={`font-semibold transition-colors ${isSelected ? 'text-primary' : 'text-foreground'}`}>{bank.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-white ${bank.type === 'Public' ? 'bg-indigo-500/80' : 'bg-emerald-500/80'}`}>
                              {bank.type}
                            </span>
                          </div>
                        </div>
                        <div className="relative z-10">
                          {isSelected ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                              <Check className="h-3.5 w-3.5 text-white" />
                            </motion.div>
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground/50 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
                {filteredBanks.length === 0 && (
                  <div className="text-center py-10 opacity-60">
                    <p className="text-sm">No banks found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {step === 'phone' && selectedBankInfo && (
            <motion.section key="phone" {...cardMotion} className="glass-card rounded-lg border-white/70 bg-white/88 p-8 shadow-2xl shadow-primary/10">
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setStep('bank')}
                  className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
                  disabled={isVerifyingPhone}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Change bank
                </button>
              </div>

              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="font-heading text-2xl font-bold text-foreground">Verify Your Mobile Number</h1>
                <p className="mt-2 text-sm text-muted-foreground">Enter the mobile number linked to your {selectedBankInfo.short} account</p>
              </div>

              <form onSubmit={handlePhoneVerify} className="space-y-6">
                <div className="relative">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Mobile Number</label>
                  <div className="flex rounded-lg overflow-hidden border border-border/70 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all shadow-sm bg-white/50">
                    <div className="bg-muted/30 px-4 py-3 border-r border-border/70 flex items-center justify-center font-medium text-muted-foreground">
                      +91
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit number"
                      className="flex-1 px-4 py-3 focus:outline-none bg-transparent font-medium tracking-wide text-foreground placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground/60"
                      disabled={isVerifyingPhone}
                      autoFocus
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5 opacity-80">
                    <Lock className="h-3 w-3" />
                    This helps us securely identify your account
                  </p>
                </div>

                {isVerifyingPhone ? (
                  <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className={`flex shrink-0 h-5 w-5 rounded-full items-center justify-center ${phoneVerifyStep >= 1 ? 'bg-success text-white' : 'border border-muted-foreground'}`}>
                        {phoneVerifyStep >= 1 && <Check className="h-3 w-3" />}
                      </div>
                      <span className={`text-sm ${phoneVerifyStep >= 1 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {phoneVerifyStep === 1 ? 'Verifying mobile number...' : 'Mobile number verified'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex shrink-0 h-5 w-5 rounded-full items-center justify-center ${phoneVerifyStep >= 2 ? 'bg-success text-white' : 'border border-primary/20'}`}>
                        {phoneVerifyStep === 2 && <Check className="h-3 w-3 animate-fade-in" />}
                        {phoneVerifyStep < 2 && <Loader2 className="h-3 w-3 text-primary animate-spin opacity-50" />}
                      </div>
                      <span className={`text-sm ${phoneVerifyStep >= 2 ? 'font-medium text-foreground animate-fade-in' : 'text-muted-foreground'}`}>
                        {phoneVerifyStep >= 2 ? 'Linked with bank records successfully' : 'Linking with bank records...'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    disabled={phoneNumber.length !== 10}
                    className="relative h-12 w-full overflow-hidden rounded-lg bg-[linear-gradient(135deg,hsl(174_62%_40%),hsl(190_76%_42%),hsl(174_62%_55%))] bg-[length:200%_100%] text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-500 hover:-translate-y-0.5 hover:bg-[position:100%_0] active:scale-[0.99]"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                
                <div className="flex items-center justify-center gap-1.5 pt-2">
                  <Shield className="h-3.5 w-3.5 text-success opacity-80" />
                  <p className="text-[11px] font-medium text-muted-foreground">Your number is encrypted and used only for verification</p>
                </div>
              </form>
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

              <div className="space-y-4 rounded-lg border border-border/70 bg-white/80 p-5">
                <div>
                  <div className="flex items-center justify-between mb-3">
                     <p className="text-xs font-semibold uppercase tracking-wide text-primary border-b border-primary/20 pb-1 inline-block">Section 1: Data Requested</p>
                  </div>
                  <div className="space-y-3 bg-muted/30 p-3 rounded-lg border border-border/50">
                    {CONSENT_ITEMS.map(({ key, title, detail, Icon }) => (
                      <div key={key} className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{title}</p>
                            <p className="text-[11px] text-muted-foreground leading-tight">{detail}</p>
                          </div>
                        </div>
                        <Switch
                          checked={permissions[key]}
                          onCheckedChange={(value) => setPermissions((current) => ({ ...current, [key]: value }))}
                          className="data-[state=checked]:shadow-[0_0_12px_hsl(174_62%_40%/.25)]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 pt-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-primary/5 border border-primary/10 p-3.5 hover:bg-primary/10 transition-colors">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Section 2: Purpose</p>
                    <p className="mt-1.5 text-sm font-medium text-foreground leading-snug">To enable automated micro-investment and financial insights</p>
                  </div>
                  <div className="rounded-lg bg-orange-500/5 border border-orange-500/10 p-3.5 hover:bg-orange-500/10 transition-colors">
                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">Section 3: Duration</p>
                    <p className="mt-1.5 text-sm font-medium text-foreground leading-snug">Valid for 12 months (revocable anytime)</p>
                  </div>
                </div>

                <details className="group border border-border/50 rounded-lg bg-white/50">
                  <summary className="flex cursor-pointer items-center justify-between p-3 text-xs font-semibold text-muted-foreground hover:text-foreground list-none">
                    View full consent details
                    <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="px-3 pb-3 pt-0 text-[11px] text-muted-foreground/80 space-y-2 border-t border-border/30 mt-1">
                    <p>• Data is fetched securely via Sahamati AA network.</p>
                    <p>• SpareSmart acts solely as a Financial Information User (FIU).</p>
                    <p>• This consent is governed by Master Direction - Non-Banking Financial Company - Account Aggregator (Reserve Bank) Directions, 2016.</p>
                  </div>
                </details>
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

                <div className="mt-7 h-2.5 overflow-hidden rounded-full bg-primary/10 relative">
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] -translate-x-full animate-[shimmer_2s_infinite]" />
                  <motion.div
                    className="h-full rounded-full bg-[linear-gradient(90deg,hsl(174_62%_40%),hsl(152_60%_42%),hsl(174_62%_50%))] bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite]"
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
              {[...Array(24)].map((_, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    y: [0, -120 - Math.random() * 80], 
                    x: [0, (Math.random() - 0.5) * 200], 
                    scale: [0, Math.random() + 0.5, 0],
                    rotate: [0, Math.random() * 360]
                  }}
                  transition={{ duration: 2.5, delay: Math.random() * 0.3, ease: 'easeOut' }}
                  className={`absolute left-1/2 top-40 h-2.5 w-2.5 rounded-sm ${['bg-success/80', 'bg-primary/80', 'bg-yellow-400/80', 'bg-blue-400/80'][Math.floor(Math.random() * 4)]}`}
                />
              ))}

              <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,hsl(152_60%_85%/.6),transparent_70%)] blur-2xl" />
              <div className="relative">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 15, delay: 0.1 }}
                  className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-2xl shadow-success/25 ring-8 ring-success/10 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-success/10 animate-[pulse-glow_2s_infinite_ease-in-out]"></div>
                  <CheckCircle2 className="h-14 w-14 text-success relative z-10 drop-shadow-md" />
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="font-heading text-3xl font-bold text-foreground">Bank Connected</motion.h1>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-3 text-lg font-medium text-foreground">{selectedBankInfo.name}</motion.p>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-2 inline-flex items-center gap-1.5 bg-success/10 text-success px-3 py-1 rounded-full text-xs font-semibold border border-success/20">
                  <Shield className="h-3.5 w-3.5" />
                  Successfully connected via RBI-compliant AA network
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="mx-auto my-8 inline-flex flex-col items-center gap-2 rounded-xl border border-success/20 bg-gradient-to-b from-white to-success/5 px-8 py-5 shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.8),transparent)] -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out"></div>
                  <WalletCards className="h-6 w-6 text-success/80 mb-1" />
                  <span className="font-mono text-base font-bold text-foreground tracking-widest">
                    <span className="opacity-40">••••</span> <span className="opacity-40">••••</span> <span className="opacity-40">••••</span> {accountSuffix}
                  </span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mr-1">Savings Account</span>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                  <Button
                    onClick={handleComplete}
                    className="relative h-14 w-full overflow-hidden rounded-xl bg-[linear-gradient(135deg,hsl(152_60%_42%),hsl(174_62%_42%),hsl(152_60%_55%))] bg-[length:200%_100%] text-primary-foreground shadow-xl shadow-success/25 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-success/30 hover:bg-[position:100%_0] active:scale-[0.98] text-base font-medium"
                  >
                    <span className="absolute inset-0 scale-0 rounded-full bg-white/20 opacity-0 transition-all duration-500 active:scale-[2.5] active:opacity-100" />
                    Enter Dashboard
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Preparing Dashboard Overlay */}
        <AnimatePresence>
          {isFinishing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F8FAF5]/95 backdrop-blur-xl"
            >
              <div className="relative mb-12">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 360]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#4A9A6E] to-[#4A9A6E]/30 flex items-center justify-center shadow-2xl shadow-[#4A9A6E]/20"
                >
                  <TrendingUp className="w-10 h-10 text-white" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-[#4A9A6E] rounded-full blur-2xl"
                />
              </div>
              
              <div className="text-center space-y-4 max-w-sm px-6">
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-black font-heading text-[#1E2937]"
                >
                  Initializing Intelligence
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm font-medium text-[#64748B] leading-relaxed"
                >
                  Synchronizing your financial graph with <span className="text-[#4A9A6E] font-bold">{selectedBankInfo?.name}</span>. Setting up your premium wealth control center...
                </motion.p>
                
                <div className="pt-8 flex flex-col items-center gap-3">
                  <div className="w-48 h-1.5 bg-[#4A9A6E]/10 rounded-full overflow-hidden relative">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-[#4A9A6E] rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.5, ease: "easeInOut" }}
                    />
                  </div>
                  <motion.span 
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-[10px] font-bold uppercase tracking-widest text-[#4A9A6E]"
                  >
                    Encrypted Tunnel Active
                  </motion.span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
