import { describe, expect, it } from 'vitest';
import * as membershipApi from './index';

describe('Membership API adapter 공개 진입점', () => {
  it('회원·명단·가입 심사 adapter 전체를 공개한다', () => {
    expect(Object.keys(membershipApi).toSorted()).toEqual([
      'approveMembership',
      'getMember',
      'getMemberTeamOptions',
      'getMembers',
      'getMembershipApproval',
      'getMembershipApprovals',
      'getRosterCandidates',
      'getRosterEntries',
      'registerRoster',
      'rejectMembership',
      'updateMember',
    ]);
  });
});
