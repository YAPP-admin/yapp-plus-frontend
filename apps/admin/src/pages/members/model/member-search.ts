import { z } from 'zod';

export const memberTabSchema = z.enum(['all', 'pending']);
export const memberPartSchema = z.enum(['all', 'pm', 'design', 'android', 'ios', 'web', 'server']);
export const memberRoleSchema = z.enum(['all', 'admin', 'active-member', 'regular-member']);
export const memberStatusSchema = z.enum(['all', 'active', 'inactive']);

export const memberSearchSchema = z.object({
  tab: memberTabSchema.default('all').catch('all'),
  q: z.string().default('').catch(''),
  part: memberPartSchema.default('all').catch('all'),
  role: memberRoleSchema.default('all').catch('all'),
  status: memberStatusSchema.default('all').catch('all'),
});

export type MemberSearch = z.infer<typeof memberSearchSchema>;

export const memberSearchDefaults: MemberSearch = {
  tab: 'all',
  q: '',
  part: 'all',
  role: 'all',
  status: 'all',
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

export const roleLabels = {
  all: '모든 권한',
  admin: '운영진',
  'active-member': '활동회원',
  'regular-member': '정회원',
};

export const statusLabels = { all: '모든 상태', active: '활성', inactive: '비활성' };
