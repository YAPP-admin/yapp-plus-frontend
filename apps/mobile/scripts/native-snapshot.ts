/// <reference types="node" />

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getConfig } from 'expo/config';
import { createFingerprintAsync } from 'expo/fingerprint';

// 검사기는 base에서 가져오고, 각 checkout의 의존성과 Expo 설정은 격리 설치합니다.
const root = resolve(process.argv[2] ?? '.');
const output = resolve(process.argv[3] ?? 'native.json');
const app = resolve(root, 'apps/mobile');
const { exp } = getConfig(app, { skipSDKVersionRequirement: true });
if (
  typeof exp.runtimeVersion !== 'object' ||
  exp.runtimeVersion.policy !== 'appVersion' ||
  exp.ios?.runtimeVersion ||
  typeof exp.version !== 'string'
) {
  throw new Error('iOS runtime은 공통 appVersion 정책을 사용해야 합니다.');
}
const fingerprint = await createFingerprintAsync(app, { platforms: ['ios'], silent: true });
// Expo는 autolinking 수집 실패를 빈 결과로 반환할 수 있습니다.
if (
  !['expoConfig', 'expoAutolinkingConfig:ios', 'rncoreAutolinkingConfig:ios'].every((id) =>
    fingerprint.sources.some((source) => source.type === 'contents' && source.id === id),
  ) ||
  fingerprint.sources.some((source) => !source.hash)
) {
  throw new Error('iOS 네이티브 수집 결과가 불완전합니다.');
}
// balanced 지문에서 제외되는 빌드 도구·patch·autolinking 설정을 보완합니다.
// EAS 프로필을 직접 해석하지 않고 build 설정 전체의 변경을 보수적으로 취급합니다.
const digest = createHash('sha256');
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function readObject(file: string): Record<string, unknown> {
  const value: unknown = JSON.parse(readFileSync(resolve(app, file), 'utf8'));
  if (!isRecord(value)) {
    throw new Error('빌드 설정 객체를 확인하세요.');
  }
  return value;
}
const eas = readObject('eas.json');
const pkg = readObject('package.json');
digest.update(JSON.stringify({ build: eas.build, cli: eas.cli, expo: pkg.expo }));
const files = execFileSync(
  'git',
  [
    'ls-files',
    '-z',
    '--',
    'package.json',
    'mise.toml',
    'mise.lock',
    'pnpm-workspace.yaml',
    '.npmrc',
    'patches/**',
    'apps/mobile/patches/**',
    'apps/mobile/.easignore',
    'apps/mobile/.fingerprintignore',
    'apps/mobile/fingerprint.config.*',
    'apps/mobile/react-native.config.*',
  ],
  { cwd: root, encoding: 'utf8' },
)
  .split('\0')
  .filter(Boolean)
  .toSorted();
for (const file of files) {
  digest
    .update(file)
    .update('\0')
    .update(readFileSync(resolve(root, file)))
    .update('\0');
}
writeFileSync(
  output,
  `${JSON.stringify({
    version: exp.version,
    fingerprint: fingerprint.hash,
    nativeBuildDigest: digest.digest('hex'),
  })}\n`,
);
