import { z } from 'zod';

export const attendancePartSchema = z.enum([
  'all',
  'pm',
  'design',
  'android',
  'ios',
  'web',
  'server',
]);
export const attendanceSessionPartSchema = z.enum(['common', ...attendancePartSchema.options]);
export type AttendancePart = z.infer<typeof attendancePartSchema>;
export type AttendanceSessionPart = z.infer<typeof attendanceSessionPartSchema>;
export const attendanceSearchSchema = z.object({
  part: attendancePartSchema.default('all').catch('all'),
});
export const attendanceSessionSearchSchema = z.object({
  part: attendanceSessionPartSchema.default('all').catch('all'),
});
export const partLabels = {
  all: '모든 직군',
  common: '전체 직군 대상',
  pm: 'PM',
  design: '디자인',
  android: 'Android',
  ios: 'iOS',
  web: 'Web',
  server: 'Server',
} satisfies Record<AttendanceSessionPart, string>;
