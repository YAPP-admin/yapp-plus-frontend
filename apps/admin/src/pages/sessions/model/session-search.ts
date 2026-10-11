import { z } from 'zod';

export const sessionPartSchema = z.enum([
  'all',
  'common',
  'pm',
  'design',
  'android',
  'ios',
  'web',
  'server',
]);
export type SessionPart = z.infer<typeof sessionPartSchema>;

export const sessionSearchSchema = z.object({
  part: sessionPartSchema.default('all').catch('all'),
});

export const sessionPartLabels = {
  all: '모든 세션',
  common: '전체 직군 대상',
  pm: 'PM',
  design: '디자인',
  android: 'Android',
  ios: 'iOS',
  web: 'Web',
  server: 'Server',
} satisfies Record<SessionPart, string>;
