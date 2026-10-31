import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** 조회 실패·잘못된 응답을 최신 PR로 추정하지 않습니다. */
export function isCurrentPreview(value: unknown, sha: string, repo: string) {
  if (
    !/^[a-f0-9]{40}$/.test(sha) ||
    !record(value) ||
    !['open', 'closed'].includes(String(value.state)) ||
    !record(value.head) ||
    typeof value.head.sha !== 'string' ||
    !/^[a-f0-9]{40}$/.test(value.head.sha) ||
    !record(value.head.repo) ||
    typeof value.head.repo.full_name !== 'string'
  ) {
    throw new Error('PR 최신성을 확인할 수 없습니다.');
  }
  return value.state === 'open' && value.head.sha === sha && value.head.repo.full_name === repo;
}

if (import.meta.main) {
  const repo = process.env.GITHUB_REPOSITORY ?? '';
  const number = process.env.PR_NUMBER ?? '';
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo) || !/^\d+$/.test(number)) {
    throw new Error('저장소와 PR 번호가 필요합니다.');
  }
  const value: unknown = JSON.parse(
    execFileSync('gh', ['api', `repos/${repo}/pulls/${number}`], { encoding: 'utf8' }),
  );
  const current = isCurrentPreview(value, process.env.VERIFIED_SHA ?? '', repo);
  appendFileSync(process.env.GITHUB_OUTPUT ?? '', `current=${current}\n`);
  if (!current && process.argv.includes('--require-current')) {
    throw new Error('현재 열린 PR의 검증 commit이 아니므로 배포하지 않습니다.');
  }
}
