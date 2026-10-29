import { z } from 'zod';

export const memberTabSchema = z.enum(['all', 'pending']);
export const memberPartSchema = z.enum(['all', 'pm', 'design', 'android', 'ios', 'web', 'server']);

export const memberSearchSchema = z.object({
  tab: memberTabSchema.default('all').catch('all'),
  q: z.string().default('').catch(''),
  part: memberPartSchema.default('all').catch('all'),
  team: z.string().trim().min(1).optional().catch(undefined),
});

export type MemberSearch = z.infer<typeof memberSearchSchema>;

export const memberSearchDefaults: MemberSearch = {
  tab: 'all',
  q: '',
  part: 'all',
  team: undefined,
};

export const partLabels = {
  all: '모든 직군',
  pm: 'PM',
  design: '디자인',
  android: 'Android',
  ios: 'iOS',
  web: 'Web',
  server: 'Server',
};
