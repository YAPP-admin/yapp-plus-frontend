/** 팀 매핑 URL 상태의 기본값과 잘못된 입력 복원을 검증한다. */
import { describe, expect, it } from 'vitest';
import { teamMappingSearchDefaults, teamMappingSearchSchema } from './team-search';

describe('team mapping search', () => {
  it('uses before and all when the search is empty', () => {
    expect(teamMappingSearchSchema.parse({})).toEqual(teamMappingSearchDefaults);
  });

  it.each(['all', 'complete', 'needs-check', 'unassigned'] as const)(
    'keeps the %s filter value from the URL',
    (filter) => {
      expect(teamMappingSearchSchema.parse({ preview: 'confirmed', filter })).toEqual({
        preview: 'confirmed',
        filter,
      });
    },
  );

  it('restores invalid values to the safe defaults', () => {
    expect(teamMappingSearchSchema.parse({ preview: 'unknown', filter: 'unknown' })).toEqual(
      teamMappingSearchDefaults,
    );
  });
});
