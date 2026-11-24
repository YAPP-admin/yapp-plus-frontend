import { z } from 'zod';

export const memberTabSchema = z.enum(['all', 'pending']);
export const memberPartSchema = z.enum([
  'all',
  'pm',
  'design',
  'android',
  'ios',
  'web',
  'mobile',
  'server',
  'ai-native',
]);

export const memberSearchSchema = z.object({
  tab: memberTabSchema.default('all').catch('all'),
  q: z.string().default('').catch(''),
  part: memberPartSchema.default('all').catch('all'),
  // TanStack Router가 숫자로 파싱한 API teamId도 URL 상태에서 유지한다.
  team: z
    .union([z.string().trim().min(1), z.number().int().positive()])
    .optional()
    .catch(undefined),
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
  mobile: 'Mobile',
  server: 'Server',
  'ai-native': 'AI Native',
};
