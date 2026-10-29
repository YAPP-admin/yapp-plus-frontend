import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  assertLatestMain,
  assertPromotionResolved,
  type ApiOptions,
} from './production-baseline.mts';

const a = 'a'.repeat(40),
  b = 'b'.repeat(40);
const context = { repo: 'owner/repo', projectId: 'prj_web', git: () => a };
void test('과거 main CI 재실행과 대기 중 main 변경을 거절한다', () => {
  assert.doesNotThrow(() => assertLatestMain({ ...context, api: () => ({ object: { sha: a } }) }));
  assert.throws(() => assertLatestMain({ ...context, api: () => ({ object: { sha: b } }) }));
});
void test('원격 main 조회 실패와 잘못된 SHA는 승격을 막는다', () => {
  for (const result of [null, {}, { object: { sha: 'bad' } }]) {
    assert.throws(() => assertLatestMain({ ...context, api: () => result }));
  }
  assert.throws(() =>
    assertLatestMain({
      ...context,
      api: () => {
        throw new Error('offline');
      },
    }),
  );
});
function apiWithState(state: string | undefined) {
  return (endpoint: string, options: ApiOptions) => {
    if (endpoint.endsWith('/deployments')) {
      assert.equal(options.query?.environment, 'production-prj_web');
      assert.equal(options.paginate, true);
      return [{ id: 1 }, { id: 2 }];
    }
    assert.ok(endpoint.endsWith('/2/statuses'));
    return state ? [{ state }] : [];
  };
}
void test('승격 timeout·취소·실패의 미확정 기록을 자동으로 해제하지 않는다', () => {
  for (const state of [undefined, 'pending', 'in_progress', 'failure', 'error']) {
    assert.throws(() => assertPromotionResolved({ ...context, api: apiWithState(state) }));
  }
});
void test('성공 또는 운영자가 확인한 inactive, 첫 배포만 허용한다', () => {
  for (const state of ['success', 'inactive']) {
    assert.doesNotThrow(() => assertPromotionResolved({ ...context, api: apiWithState(state) }));
  }
  assert.doesNotThrow(() => assertPromotionResolved({ ...context, api: () => [] }));
});
void test('배포 이력 형식 오류와 조회 실패를 빈 이력으로 처리하지 않는다', () => {
  for (const result of [null, {}, [{ id: '2' }], [{ id: -1 }]]) {
    assert.throws(() => assertPromotionResolved({ ...context, api: () => result }));
  }
  assert.throws(() =>
    assertPromotionResolved({
      ...context,
      api: () => {
        throw new Error('offline');
      },
    }),
  );
});
