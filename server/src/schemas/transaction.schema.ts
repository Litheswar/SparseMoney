import { z } from 'zod';

export const simulateTransactionSchema = z.object({
  // Optional overrides for testing; otherwise backend picks random merchant
  merchant: z.string().min(1).max(100).optional(),
  category: z.string().min(1).max(50).optional(),
  amount: z.number().positive().max(50000).optional(),
  icon: z.string().max(10).optional(),
});

export type SimulateTransactionInput = z.infer<typeof simulateTransactionSchema>;
