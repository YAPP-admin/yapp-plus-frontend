import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import type { ApiOptions } from './production-baseline.mts';
import { beginDeployment, finishDeployment, resolveComparison } from './production-baseline.mts';

const directory = mkdtempSync(join(tmpdir(), 'production-baseline-'));
after(() => rmSync(directory, { recursive: true, force: true }));
const git = (...args: string[]) =>
  execFileSync('git', args, {
    cwd: directory,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();
git('init', '-q');
function commit(file: string, content: string) {
  writeFileSync(join(directory, file), content);
  git('add', file);
  git('-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'fixture');
  return git('rev-parse', 'HEAD');
}
const a = commit('web.txt', 'A');
const b = commit('web.txt', 'B');
const c = commit('docs.txt', 'C');
const reverted = commit('web.txt', 'A');
const repo = 'owner/repo';
const projectId = 'prj_web';
const attempts = [{ id: 1, sha: a }];
const context = { repo, projectId, head: c, git };
function apiFixture(deployments: unknown, statuses: Record<string, unknown> = {}) {
  return (endpoint: string, options: ApiOptions) => {
    if (endpoint.endsWith('/deployments')) {
      assert.equal(options.query?.environment, `production-${projectId}`);
      assert.equal(options.query?.task, 'deploy:yapp-plus');
      assert.equal(options.paginate, true);
      return deployments;
    }
    const id = endpoint.split('/').at(-2);
    assert.equal(options.query?.per_page, '1');
    return statuses[id ?? ''] ?? [];
  };
}

void test('B가 미배포이고 C가 문서만 바꿔도 A부터 누적 변경을 비교한다', () => {
  const result = resolveComparison({
    ...context,
    api: apiFixture(attempts, { 1: [{ state: 'success' }] }),
  });
  assert.deepEqual(result, { base_sha: a, force_all: 'false' });
  assert.equal(git('diff', '--name-only', b, c), 'docs.txt');
  assert.match(git('diff', '--name-only', result.base_sha ?? '', c), /web.txt/);
});

void test('초기 이력이 없거나 최신 시도가 미완료·실패이면 강제 배포한다', () => {
  assert.deepEqual(resolveComparison({ ...context, api: apiFixture([]) }), { force_all: 'true' });
  for (const statuses of [
    [],
    [{ state: 'failure' }],
    [{ state: 'pending' }],
    [{ state: 'inactive' }],
  ]) {
    assert.deepEqual(
      resolveComparison({
        ...context,
        api: apiFixture([...attempts, { id: 2, sha: b }], {
          1: [{ state: 'success' }],
          2: statuses,
        }),
      }),
      { force_all: 'true' },
    );
  }
});

void test('B가 실제 배포되고 성공 기록이 실패한 뒤 A로 revert해도 생략하지 않는다', () => {
  assert.equal(git('diff', '--name-only', a, reverted, '--', 'web.txt'), '');
  const result = resolveComparison({
    ...context,
    head: reverted,
    api: apiFixture([...attempts, { id: 2, sha: b }], { 1: [{ state: 'success' }] }),
  });
  assert.deepEqual(result, { force_all: 'true' });
});

void test('앱별 부분 성공과 수동 성공은 프로젝트별 최근 시도로 판정한다', () => {
  const api = (endpoint: string, options: ApiOptions) => {
    if (endpoint.endsWith('/deployments')) {
      return options.query?.environment === 'production-prj_web'
        ? [{ id: 2, sha: b }]
        : [{ id: 3, sha: b }];
    }
    return endpoint.includes('/2/') ? [{ state: 'success' }] : [{ state: 'failure' }];
  };
  assert.deepEqual(resolveComparison({ ...context, api }), { base_sha: b, force_all: 'false' });
  assert.deepEqual(resolveComparison({ ...context, projectId: 'prj_admin', api }), {
    force_all: 'true',
  });
});

void test('같은 SHA는 재사용하고 유실·비조상 SHA는 강제 배포한다', () => {
  for (const sha of [c, 'f'.repeat(40), reverted]) {
    const result = resolveComparison({
      ...context,
      api: apiFixture([{ id: 1, sha }], { 1: [{ state: 'success' }] }),
    });
    assert.deepEqual(
      result,
      sha === c ? { base_sha: c, force_all: 'false' } : { force_all: 'true' },
    );
  }
});

void test('API 실패와 잘못된 응답을 이력 없음으로 숨기지 않는다', () => {
  assert.throws(
    () =>
      resolveComparison({
        ...context,
        api: () => {
          throw new Error('API failed');
        },
      }),
    /API failed/,
  );
  for (const response of [{ message: 'error' }, [{ id: 'invalid', sha: a }]]) {
    assert.throws(() => resolveComparison({ ...context, api: () => response }), /배포 이력/);
  }
  assert.throws(
    () => resolveComparison({ ...context, api: apiFixture(attempts, { 1: {} }) }),
    /배포 상태/,
  );
});

void test('시도 생성은 실제 checkout SHA를 기록하고 자동 merge와 별도 CI 대기를 끈다', () => {
  const id = beginDeployment({
    repo,
    projectId,
    git,
    api: (endpoint: string, options: ApiOptions) => {
      assert.equal(endpoint, `repos/${repo}/deployments`);
      assert.deepEqual(options.body, {
        ref: reverted,
        task: 'deploy:yapp-plus',
        environment: 'production-prj_web',
        auto_merge: false,
        required_contexts: [],
        production_environment: true,
      });
      return { id: 42 };
    },
  });
  assert.equal(id, 42);
  assert.throws(
    () => beginDeployment({ repo, projectId, git, api: () => ({ message: 'not created' }) }),
    /시도 생성/,
  );
});

void test('성공 기록은 같은 시도와 배포 URL에 연결하고 이전 이력을 비활성화하지 않는다', () => {
  finishDeployment({
    repo,
    deploymentId: '42',
    deploymentUrl: 'https://example.vercel.app',
    logUrl: 'https://github.com/owner/repo/actions/runs/1',
    api: (endpoint: string, options: ApiOptions) => {
      assert.equal(endpoint, `repos/${repo}/deployments/42/statuses`);
      assert.deepEqual(options.body, {
        state: 'success',
        environment_url: 'https://example.vercel.app',
        log_url: 'https://github.com/owner/repo/actions/runs/1',
        auto_inactive: false,
      });
      return { state: 'success' };
    },
  });
});

void test('공용 action은 시도 기록 실패 시 배포하지 않고 Preview 이력은 건드리지 않는다', () => {
  const action = readFileSync(
    new URL('../actions/vercel-deploy/action.yml', import.meta.url),
    'utf8',
  );
  const body = action.split('      run: |\n')[1].replace(/^ {8}/gm, '');
  const cases = [
    { mode: 'production', fail: '', calls: ['begin', 'pull', 'build', 'deploy', 'success'] },
    { mode: 'production', fail: 'begin', calls: ['begin'] },
    { mode: 'production', fail: 'deploy', calls: ['begin', 'pull', 'build', 'deploy'] },
    { mode: 'production', fail: 'success', calls: ['begin', 'pull', 'build', 'deploy', 'success'] },
    { mode: 'preview', fail: '', calls: ['pull', 'build', 'deploy'] },
  ];
  for (const [index, scenario] of cases.entries()) {
    const calls = join(directory, `calls-${index}`);
    const output = join(directory, `output-${index}`);
    const shell = `
node() { echo "$2" >> "$ACTION_CALLS"; [ "$FAIL_AT" != "$2" ] || return 7; echo 42; }
pnpm() { echo "$4" >> "$ACTION_CALLS"; [ "$FAIL_AT" != "$4" ] || return 8; echo https://example.vercel.app; }
${body}`;
    const run = () =>
      execFileSync('bash', ['-e', '-o', 'pipefail', '-c', shell], {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          ACTION_CALLS: calls,
          FAIL_AT: scenario.fail,
          DEPLOYMENT_ENVIRONMENT: scenario.mode,
          VERCEL_ORG_ID: 'fixture',
          VERCEL_PROJECT_ID: 'prj_web',
          VERCEL_TOKEN: 'fixture',
          VERCEL_CLI_VERSION: '59.13.1',
          GIT_BRANCH: 'fixture',
          GITHUB_OUTPUT: output,
        },
      });
    if (scenario.fail) {
      assert.throws(run);
    } else {
      run();
    }
    assert.deepEqual(readFileSync(calls, 'utf8').trim().split('\n'), scenario.calls);
  }
});
