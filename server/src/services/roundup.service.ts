/**
 * Round-Up Engine — calculates the spare change from a transaction.
 */

export interface RoundUpSettings {
  round_limit: number;    // round to nearest X (default 10)
  min_spare: number;      // skip if spare < this
  max_spare: number;      // cap spare at this
  round_up_enabled: boolean;
}

export interface RoundUpResult {
  rounded_amount: number;
  spare: number;
  skipped: boolean;
  reason?: string;
}

const DEFAULT_SETTINGS: RoundUpSettings = {
  round_limit: 10,
  min_spare: 1,
  max_spare: 100,
  round_up_enabled: true,
};

export function calculateRoundUp(amount: number, settings?: Partial<RoundUpSettings>): RoundUpResult {
  const s = { ...DEFAULT_SETTINGS, ...settings };

  if (!s.round_up_enabled) {
    return { rounded_amount: amount, spare: 0, skipped: true, reason: 'Round-up disabled' };
  }

  const rounded_amount = Math.ceil(amount / s.round_limit) * s.round_limit;
  let spare = rounded_amount - amount;

  // If amount is already a multiple, round up to next
  if (spare === 0) {
    spare = s.round_limit;
  }

  // Apply min/max constraints
  if (spare < s.min_spare) {
    return { rounded_amount: amount, spare: 0, skipped: true, reason: `Spare ₹${spare} below minimum ₹${s.min_spare}` };
  }

  if (spare > s.max_spare) {
    spare = s.max_spare;
  }

  return { rounded_amount: amount + spare, spare, skipped: false };
}
