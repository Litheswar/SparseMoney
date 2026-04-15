import { z } from 'zod';

export const createRuleSchema = z.object({
  name: z.string().min(1).max(100),
  condition: z.string().min(1).max(300),
  action: z.string().min(1).max(300),
  category: z.enum(['round-up', 'guilt-tax', 'overspend', 'custom']).default('custom'),
  enabled: z.boolean().default(true),
});

export type CreateRuleInput = z.infer<typeof createRuleSchema>;
