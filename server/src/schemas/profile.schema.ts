import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
});

export const updateSettingsSchema = z.object({
  round_limit: z.number().int().min(1).max(100).optional(),
  min_spare: z.number().min(0).optional(),
  max_spare: z.number().min(0).optional(),
  round_up_enabled: z.boolean().optional(),
  auto_invest_threshold: z.number().positive().optional(),
  allocation_gold: z.number().int().min(0).max(100).optional(),
  allocation_index: z.number().int().min(0).max(100).optional(),
  allocation_debt: z.number().int().min(0).max(100).optional(),
  allocation_fd: z.number().int().min(0).max(100).optional(),
  notify_round_up: z.boolean().optional(),
  notify_invest: z.boolean().optional(),
  notify_weekly: z.boolean().optional(),
  notify_risk: z.boolean().optional(),
});

export const completeOnboardingSchema = z.object({
  bank_name: z.string().min(1).max(50),
  masked_account: z.string().max(50).optional(),
  phone: z.string().min(10).max(15).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
