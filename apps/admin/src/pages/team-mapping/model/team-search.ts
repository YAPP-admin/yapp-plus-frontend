/** 팀 매핑 URL에서 허용하는 preview·filter 상태와 기본값을 정의한다. */
import { z } from 'zod';
import {
  teamMappingFilterSchema,
  teamMappingStatusSchema,
  type TeamMappingFilter,
  type TeamMappingStatus,
} from '~/features/team-management';

export const teamMappingPreviewLabels: Record<TeamMappingStatus, string> = {
  before: '팀 빌딩 전',
  draft: '배정 중',
  confirmed: '확정됨',
};

export const teamMappingFilterLabels: Record<TeamMappingFilter, string> = {
  all: '전체 팀',
  complete: '구성 완료',
  'needs-check': '확인 필요',
  unassigned: '미배정 회원',
};

export const teamMappingSearchSchema = z.object({
  preview: teamMappingStatusSchema.default('before').catch('before'),
  filter: teamMappingFilterSchema.default('all').catch('all'),
});

export type TeamMappingSearch = z.infer<typeof teamMappingSearchSchema>;

export const teamMappingSearchDefaults: TeamMappingSearch = {
  preview: 'before',
  filter: 'all',
};
