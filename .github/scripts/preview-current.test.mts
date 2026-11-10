import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isCurrentPreview } from './preview-current.mts';

const a = 'a'.repeat(40),
  b = 'b'.repeat(40),
  repo = 'owner/repo';
const pr = (sha: string, state = 'open', full_name = repo) => ({
  state,
  head: { sha, repo: { full_name } },
});
void test('A 준비 중 B가 최신이면 A의 성공·실패 댓글 모두 공개하지 않는다', () => {
  assert.equal(isCurrentPreview(pr(b), a, repo), false);
  assert.equal(isCurrentPreview(pr(b), b, repo), true);
  assert.equal(isCurrentPreview(pr(b), a, repo), false);
});
void test('닫힌 PR과 다른 저장소 head를 공개하지 않는다', () => {
  assert.equal(isCurrentPreview(pr(a, 'closed'), a, repo), false);
  assert.equal(isCurrentPreview(pr(a, 'open', 'fork/repo'), a, repo), false);
});
void test('잘못된 API 응답과 검증 SHA는 실패한다', () => {
  for (const value of [null, {}, { state: 'open', head: {} }, pr('bad')]) {
    assert.throws(() => isCurrentPreview(value, a, repo));
  }
  assert.throws(() => isCurrentPreview(pr(a), '', repo));
});
