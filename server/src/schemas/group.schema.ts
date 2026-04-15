import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  goal: z.number().positive(),
  emoji: z.string().max(10).default('🎯'),
});

export const contributeSchema = z.object({
  amount: z.number().positive(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type ContributeInput = z.infer<typeof contributeSchema>;
