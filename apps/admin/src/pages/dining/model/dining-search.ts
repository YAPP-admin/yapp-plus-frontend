import { z } from 'zod';

export const diningPeriodSchema = z.enum(['UPCOMING', 'PAST']);
export type DiningPeriod = z.infer<typeof diningPeriodSchema>;

export const diningSearchSchema = z.object({
  period: diningPeriodSchema.default('UPCOMING').catch('UPCOMING'),
});

export const diningResponseFilterSchema = z.enum([
  'ALL',
  'ATTENDING',
  'NOT_ATTENDING',
  'UNANSWERED',
]);
export type DiningResponseFilter = z.infer<typeof diningResponseFilterSchema>;

export const diningDetailSearchSchema = z.object({
  response: diningResponseFilterSchema.default('ALL').catch('ALL'),
});

export const diningPeriodLabels: Record<DiningPeriod, string> = {
  UPCOMING: '진행 중',
  PAST: '마감',
};

export const diningResponseFilterLabels: Record<DiningResponseFilter, string> = {
  ALL: '전체',
  ATTENDING: '참석',
  NOT_ATTENDING: '불참',
  UNANSWERED: '미응답',
};
