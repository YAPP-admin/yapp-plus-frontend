/** 실제 workflow의 버전 검사를 실행해 출력 중단과 도구 버전 불일치를 검증합니다. */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { isMap, isSeq, parseDocument } from 'yaml';

const workflowPath = fileURLToPath(
  new URL('../../../.github/workflows/mobile-manual.yml', import.meta.url),
);
const steps = parseDocument(readFileSync(workflowPath, 'utf8')).getIn(['jobs', 'build', 'steps']);
if (!isSeq(steps)) {
  throw new Error('빌드 단계를 찾지 못했습니다.');
}
const step = steps.items.find(
  (item) => isMap(item) && item.get('name') === 'Verify native toolchain',
);
if (!isMap(step)) {
  throw new Error('네이티브 도구 검사 단계를 찾지 못했습니다.');
}
const run = step.get('run');
if (typeof run !== 'string') {
  throw new Error('도구 검사 스크립트가 없습니다.');
}
const script = run;

const bin = mkdtempSync(join(tmpdir(), 'native-toolchain-'));
beforeAll(() => {
  // 첫 줄 뒤에 늦게 출력하여 grep -q가 파이프를 먼저 닫는 실패 조건을 재현합니다.
  writeFileSync(
    join(bin, 'xcodebuild'),
    `#!/usr/bin/env bash
set -e
printf '%s\\n' "$TEST_XCODE_VERSION"
sleep 0.05
printf 'Build version 17F113\\n'
exit "$TEST_XCODE_EXIT"
`,
    { mode: 0o755 },
  );
  writeFileSync(
    join(bin, 'ruby'),
    `#!/usr/bin/env bash
if [[ "$*" == *RUBY_VERSION* ]]; then
  printf '%s' "$TEST_RUBY_VERSION"
else
  printf '%s' "$TEST_FASTLANE_VERSION"
fi
`,
    { mode: 0o755 },
  );
  writeFileSync(
    join(bin, 'pod'),
    `#!/usr/bin/env bash
printf '%s\\n' "$TEST_POD_VERSION"
`,
    { mode: 0o755 },
  );
});
afterAll(() => rmSync(bin, { recursive: true, force: true }));

function check(overrides: Record<string, string> = {}) {
  return spawnSync('bash', ['-eo', 'pipefail', '-c', script], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      TEST_XCODE_VERSION: 'Xcode 26.6',
      TEST_XCODE_EXIT: '0',
      TEST_RUBY_VERSION: '3.4.12',
      TEST_POD_VERSION: '1.17.0',
      TEST_FASTLANE_VERSION: '2.242.0',
      ...overrides,
    },
  });
}

it('현재 러너 버전을 허용하고 Xcode의 늦은 출력까지 읽는다', () => {
  const result = check();
  expect(result.status).toBe(0);
  expect(result.stdout).toContain('Build version 17F113');
  expect(result.stdout).toContain('fastlane: 2.242.0 (expected: 2.242.0)');
});

it.each([
  ['TEST_XCODE_VERSION', 'Xcode 26.5', '26.6'],
  ['TEST_RUBY_VERSION', '3.4.11', '3.4.12'],
  ['TEST_POD_VERSION', '1.16.2', '1.17.0'],
  ['TEST_FASTLANE_VERSION', '2.241.2', '2.242.0'],
])('%s 불일치 시 실제·기대 버전을 표시하고 실패한다', (key, actual, expected) => {
  const result = check({ [key]: actual });
  expect(result.status).toBe(1);
  expect(result.stdout).toContain(actual);
  expect(result.stdout).toContain(`expected: ${expected}`);
});

it('버전이 맞아도 xcodebuild 명령 실패를 성공으로 처리하지 않는다', () => {
  expect(check({ TEST_XCODE_EXIT: '42' }).status).toBe(42);
});
