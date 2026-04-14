// === ROUND-UP ENGINE ===
export function calculateRoundUp(amount: number, multiple: number = 10): number {
  const next = Math.ceil(amount / multiple) * multiple;
  return next - amount || multiple; // if already a multiple, round up to next
}

// === WALLET ENGINE ===
export interface WalletState {
  balance: number;
  threshold: number;
  totalSaved: number;
  totalInvested: number;
}

export function addToWallet(wallet: WalletState, amount: number): WalletState {
  return {
    ...wallet,
    balance: wallet.balance + amount,
    totalSaved: wallet.totalSaved + amount,
  };
}

export function triggerInvestment(wallet: WalletState): { wallet: WalletState; invested: boolean; amount: number } {
  if (wallet.balance >= wallet.threshold) {
    const investAmount = wallet.balance;
    return {
      wallet: {
        ...wallet,
        balance: 0,
        totalInvested: wallet.totalInvested + investAmount,
      },
      invested: true,
      amount: investAmount,
    };
  }
  return { wallet, invested: false, amount: 0 };
}

// === RULE ENGINE ===
export interface Rule {
  id: string;
  name: string;
  condition: string;
  action: string;
  enabled: boolean;
  category: 'round-up' | 'guilt-tax' | 'overspend' | 'custom';
  triggerCount: number;
}

export interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  roundUp: number;
  timestamp: Date;
  icon: string;
}

// === TRANSACTION SIMULATOR ===
const MERCHANTS = [
  { name: 'Swiggy', category: 'Food', icon: '🍕', range: [80, 650] },
  { name: 'Uber', category: 'Transport', icon: '🚗', range: [50, 400] },
  { name: 'Amazon', category: 'Shopping', icon: '📦', range: [150, 3000] },
  { name: 'Netflix', category: 'Entertainment', icon: '🎬', range: [149, 649] },
  { name: 'Flipkart', category: 'Shopping', icon: '🛒', range: [200, 5000] },
  { name: 'Zomato', category: 'Food', icon: '🍔', range: [100, 800] },
  { name: 'BigBasket', category: 'Groceries', icon: '🥬', range: [200, 2000] },
  { name: 'Ola', category: 'Transport', icon: '🛺', range: [40, 350] },
  { name: 'BookMyShow', category: 'Entertainment', icon: '🎭', range: [150, 500] },
  { name: 'Reliance Digital', category: 'Electronics', icon: '📱', range: [500, 15000] },
  { name: 'PharmEasy', category: 'Health', icon: '💊', range: [100, 1500] },
  { name: 'Starbucks', category: 'Food', icon: '☕', range: [200, 600] },
];

let txCounter = 0;
export function generateTransaction(): Transaction {
  const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
  const amount = Math.floor(Math.random() * (merchant.range[1] - merchant.range[0])) + merchant.range[0];
  const roundUp = calculateRoundUp(amount);
  txCounter++;
  return {
    id: `tx-${Date.now()}-${txCounter}`,
    merchant: merchant.name,
    category: merchant.category,
    amount,
    roundUp,
    timestamp: new Date(),
    icon: merchant.icon,
  };
}

// === PORTFOLIO ===
export interface Investment {
  name: string;
  type: 'Gold ETF' | 'Index Fund' | 'Debt Fund' | 'Fixed Deposit';
  amount: number;
  returns: number;
  color: string;
}

export const MOCK_PORTFOLIO: Investment[] = [
  { name: 'Nippon Gold ETF', type: 'Gold ETF', amount: 2400, returns: 12.5, color: 'hsl(45 93% 47%)' },
  { name: 'Nifty 50 Index', type: 'Index Fund', amount: 4200, returns: 15.2, color: 'hsl(174 62% 40%)' },
  { name: 'HDFC Debt Fund', type: 'Debt Fund', amount: 1800, returns: 7.8, color: 'hsl(220 70% 50%)' },
  { name: 'SBI FD (1yr)', type: 'Fixed Deposit', amount: 1000, returns: 6.5, color: 'hsl(280 60% 50%)' },
];

// === INSIGHTS ===
export const SPENDING_CATEGORIES = [
  { name: 'Food', amount: 4200, color: 'hsl(0 72% 55%)', percentage: 35 },
  { name: 'Transport', amount: 1800, color: 'hsl(38 92% 50%)', percentage: 15 },
  { name: 'Shopping', amount: 3600, color: 'hsl(174 62% 40%)', percentage: 30 },
  { name: 'Entertainment', amount: 1200, color: 'hsl(280 60% 50%)', percentage: 10 },
  { name: 'Groceries', amount: 800, color: 'hsl(152 60% 42%)', percentage: 7 },
  { name: 'Health', amount: 400, color: 'hsl(220 70% 50%)', percentage: 3 },
];

// === HORIZON PREDICTOR ===
export function predictGrowth(
  monthlySaving: number,
  months: number,
  annualReturn: number = 12
): { month: number; savings: number; returns: number; total: number }[] {
  const monthlyRate = annualReturn / 100 / 12;
  const data = [];
  let total = 0;
  for (let m = 1; m <= months; m++) {
    total = (total + monthlySaving) * (1 + monthlyRate);
    const savings = monthlySaving * m;
    data.push({
      month: m,
      savings,
      returns: Math.round(total - savings),
      total: Math.round(total),
    });
  }
  return data;
}

export const DEFAULT_RULES: Rule[] = [
  { id: 'r1', name: 'Smart Round-Up', condition: 'Every transaction', action: 'Round up to nearest ₹10', enabled: true, category: 'round-up', triggerCount: 142 },
  { id: 'r2', name: 'Food Guilt Tax', condition: 'Food spend > ₹300', action: 'Invest ₹50 in Gold ETF', enabled: true, category: 'guilt-tax', triggerCount: 28 },
  { id: 'r3', name: 'Weekend Spender', condition: 'Weekend shopping > ₹500', action: 'Invest ₹100 in Index Fund', enabled: false, category: 'overspend', triggerCount: 12 },
  { id: 'r4', name: 'Spare Overflow', condition: 'Spare > ₹25', action: 'Invest in Gold ETF', enabled: true, category: 'custom', triggerCount: 67 },
];
