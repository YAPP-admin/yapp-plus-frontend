/// <reference types="node" />

import { execFileSync, spawnSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const temp = mkdtempSync(join(tmpdir(), 'ota-impact-'));
const repo = join(temp, 'repo');
const bin = join(temp, 'bin');
const turbo = join(root, 'node_modules/.bin/turbo');
const workflow = readFileSync(join(root, '.github/workflows/mobile-delivery.yml'), 'utf8');
// YAML의 실제 단계별 shell을 실행하고 Actions 연결 조건도 검증합니다.
function step(name: string) {
  const section = workflow.split(`      - name: ${name}\n`)[1]?.split(/\n {6}(?:- name:|#)/)[0];
  const block = section?.split('        run: |\n')[1];
  if (!section || !block) {
    throw new Error(`workflow 단계를 찾지 못했습니다: ${name}`);
  }
  return {
    section,
    script: block
      .split('\n')
      .map((line) => line.slice(10))
      .join('\n'),
  };
}
const baselineStep = step('Find last published SHA');
const impactStep = step('Check mobile impact');
const decisionStep = step('Summarize publication decision');

function git(...args: string[]) {
  return execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
}
function commit() {
  git('add', '.');
  git(
    '-c',
    'user.name=Fixture',
    '-c',
    'user.email=fixture@example.invalid',
    'commit',
    '-qm',
    'fixture',
  );
  return git('rev-parse', 'HEAD');
}
function write(path: string, value: string) {
  mkdirSync(dirname(join(repo, path)), { recursive: true });
  writeFileSync(join(repo, path), value);
}
function decision(base: string, head: string, mode = '', latest = true) {
  const output = join(temp, 'output');
  writeFileSync(output, '');
  const env = {
    ...process.env,
    PATH: `${bin}:${process.env.PATH}`,
    TURBO_BIN: turbo,
    SOURCE_SHA: head,
    TURBO_SCM_HEAD: head,
    RUNNER_TEMP: temp,
    GITHUB_OUTPUT: output,
    GITHUB_STEP_SUMMARY: join(temp, 'summary'),
    MODE: mode,
    LIST_JSON: JSON.stringify({
      currentPage:
        mode === 'no-history'
          ? []
          : [
              {
                group: '11111111-1111-1111-1111-111111111111',
                isRollBackToEmbedded: false,
              },
            ],
    }),
    VIEW_JSON: JSON.stringify([
      {
        platform: 'ios',
        branch: 'testflight',
        isRollBackToEmbedded: mode === 'rollback',
        gitCommitHash: base,
      },
    ]),
  };
  const baseline = spawnSync('bash', ['-eo', 'pipefail', '-c', baselineStep.script], {
    cwd: join(repo, 'apps/mobile'),
    env,
    encoding: 'utf8',
  });
  const sha = readFileSync(output, 'utf8').trim().replace(/^sha=/, '');
  writeFileSync(output, '');
  const impact =
    baseline.status === 0
      ? spawnSync('bash', ['-eo', 'pipefail', '-c', impactStep.script], {
          cwd: repo,
          env: { ...env, TURBO_SCM_BASE: sha },
          encoding: 'utf8',
        })
      : undefined;
  // 아래 조건과 YAML의 PUBLISH 식은 연결 검증에서 함께 확인합니다.
  const publish =
    latest && (impact?.status !== 0 || readFileSync(output, 'utf8').trim() !== 'publish=false');
  writeFileSync(output, '');
  let impactResult = 'skipped';
  if (impact) {
    impactResult = impact.status === 0 ? 'success' : 'failure';
  }
  execFileSync('bash', ['-eo', 'pipefail', '-c', decisionStep.script], {
    cwd: repo,
    env: {
      ...env,
      BASE_SHA: sha,
      BASELINE_RESULT: baseline.status === 0 ? 'success' : 'failure',
      IMPACT_RESULT: impactResult,
      PUBLISH: String(publish),
    },
  });
  return readFileSync(output, 'utf8').trim();
}

beforeAll(() => {
  mkdirSync(repo);
  mkdirSync(bin);
  // 실제 저장소의 의존성 그래프를 사용하되 원본 파일·Git 이력은 변경하지 않습니다.
  for (const file of [
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    'turbo.json',
    'mise.toml',
    'mise.lock',
  ]) {
    cpSync(join(root, file), join(repo, file));
  }
  for (const parent of ['apps', 'packages']) {
    for (const entry of readdirSync(join(root, parent), { withFileTypes: true })) {
      if (entry.isDirectory()) {
        write(
          `${parent}/${entry.name}/package.json`,
          readFileSync(join(root, parent, entry.name, 'package.json'), 'utf8'),
        );
      }
    }
  }
  git('init', '-q');
  commit();
  writeFileSync(
    join(bin, 'eas'),
    `#!/bin/bash
case "$1" in
 update:list) test "$MODE" != api-error || exit 1; printf '%s' "$LIST_JSON";;
 update:view) printf '%s' "$VIEW_JSON";;
esac
`,
    { mode: 0o755 },
  );
  // 정상 판정에는 실제 Turbo를 사용하며 실패·잘못된 응답만 대체합니다.
  writeFileSync(
    join(bin, 'pnpm'),
    `#!/bin/bash
if [ "$MODE" = turbo-error ]; then exit 1; fi
if [ "$MODE" = bad-json ]; then echo '{}'; exit 0; fi
exec "$TURBO_BIN" "\${@:3}"
`,
    { mode: 0o755 },
  );
});
afterAll(() => rmSync(temp, { recursive: true, force: true }));

describe('실제 workflow와 Turbo의 OTA 영향 판정', () => {
  it('조회·판정만 오류를 허용하고 실제 게시에는 결정 결과를 연결한다', () => {
    expect(baselineStep.section).toContain('continue-on-error: true');
    expect(impactStep.section).toContain("if: steps.baseline.outcome == 'success'");
    expect(impactStep.section).toContain('continue-on-error: true');
    expect(decisionStep.section).toContain(
      `PUBLISH: \${{ steps.latest.outputs.publish == 'true' && (steps.impact.outcome != 'success' || steps.impact.outputs.publish != 'false') }}`,
    );
    const publish = workflow.split('      - name: Publish TestFlight update\n')[1];
    expect(publish).toContain("if: steps.decision.outputs.publish == 'true'");
    expect(publish).not.toContain('continue-on-error: true');
  });
  it('판정 실패여도 오래된 main이면 게시하지 않는다', () => {
    const head = git('rev-parse', 'HEAD');
    expect(decision(head, head, 'api-error', false)).toBe('publish=false');
  });

  it.each([
    ['docs/probe.md', false],
    ['apps/web/probe.ts', false],
    ['apps/admin/probe.ts', false],
    ['apps/mobile/README.md', true],
    ['apps/mobile/probe.ts', true],
    ['packages/app-bridge/probe.ts', true],
    ['packages/api/probe.ts', true],
    ['packages/config/probe.ts', true],
    ['patches/probe.patch', true],
    ['.github/actions/setup-eas/probe.yml', true],
    ['.github/actions/setup-toolchain/probe.yml', true],
  ] as const)('%s 변경의 게시 여부는 %s', (path, publish) => {
    const base = git('rev-parse', 'HEAD');
    write(path, 'fixture\n');
    expect(decision(base, commit())).toBe(`publish=${publish}`);
  });
  it.each(['mise.toml', 'pnpm-workspace.yaml'])('%s의 공통 설정 변경을 포함한다', (path) => {
    const base = git('rev-parse', 'HEAD');
    write(path, `${readFileSync(join(repo, path), 'utf8')}\n# fixture\n`);
    expect(decision(base, commit())).toBe('publish=true');
  });
  it('모바일 외부 의존성의 lockfile 변경을 포함한다', () => {
    const base = git('rev-parse', 'HEAD');
    const lock = readFileSync(join(repo, 'pnpm-lock.yaml'), 'utf8');
    const changed = lock
      .replaceAll('p-mutex@1.0.0', 'p-mutex@1.0.1')
      .replace(
        "p-mutex:\n        specifier: 'catalog:'\n        version: 1.0.0",
        "p-mutex:\n        specifier: 'catalog:'\n        version: 1.0.1",
      );
    expect(changed).not.toBe(lock);
    write('pnpm-lock.yaml', changed);
    expect(decision(base, commit())).toBe('publish=true');
  });
  it('모바일 변경 뒤 웹 변경이 병합돼도 마지막 게시 이후를 누적 비교한다', () => {
    const base = git('rev-parse', 'HEAD');
    write('apps/mobile/cumulative.ts', 'fixture\n');
    commit();
    write('apps/web/cumulative.ts', 'fixture\n');
    expect(decision(base, commit())).toBe('publish=true');
  });
  it('현재 소스의 조상이 아닌 게시 SHA면 게시한다', () => {
    const head = git('rev-parse', 'HEAD');
    write('apps/mobile/future.ts', 'fixture\n');
    expect(decision(commit(), head)).toBe('publish=true');
  });
  it('같은 SHA가 이미 게시됐으면 생략한다', () => {
    const head = git('rev-parse', 'HEAD');
    expect(decision(head, head)).toBe('publish=false');
  });
  it.each(['no-history', 'api-error', 'bad-json', 'turbo-error', 'rollback'])(
    '%s를 생략으로 오인하지 않는다',
    (mode) => {
      const head = git('rev-parse', 'HEAD');
      expect(decision(head, head, mode)).toBe('publish=true');
    },
  );
  it.each(['bad', 'a'.repeat(40)])('사용할 수 없는 기준 SHA %s면 게시한다', (base) => {
    expect(decision(base, git('rev-parse', 'HEAD'))).toBe('publish=true');
  });
});
