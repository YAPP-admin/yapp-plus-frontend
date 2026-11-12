/** 웹 catalog 변경과 실제 설치 정책 변경을 보조 digest 입력에서 구분합니다. */
import { expect, it } from 'vitest';
import { nativeWorkspaceConfig } from './native-workspace-config';

it('default·이름 있는 catalog 변경과 주석은 네이티브 보조 입력을 바꾸지 않는다', () => {
  const before = 'packages: [apps/*]\ncatalog: {react: 19.2.8}\ncatalogs: {expo: {react: 19.3.0}}';
  const after =
    '# 버전 통일\npackages: [apps/*]\ncatalog: {react: 19.3.0}\ncatalogs: {expo: {react: 19.4.0}}';
  expect(nativeWorkspaceConfig(before)).toBe(nativeWorkspaceConfig(after));
});

it.each(['allowBuilds', 'overrides', 'patchedDependencies', 'nodeLinker', 'futureBuildPolicy'])(
  '%s 등 catalog 외 설정은 보조 입력에 남긴다',
  (key) => {
    expect(nativeWorkspaceConfig(`${key}: before`)).not.toBe(
      nativeWorkspaceConfig(`${key}: after`),
    );
  },
);

it('다른 정책 내부의 catalog라는 이름은 제거하지 않는다', () => {
  expect(nativeWorkspaceConfig('overrides: {catalog: 1.0.0}')).toContain('catalog');
});

it.each(['', 'true', '- catalog', 'catalog: [', 'allowBuilds: true\nallowBuilds: false'])(
  '잘못된 workspace 입력 %s는 실패시킨다',
  (source) => {
    expect(() => nativeWorkspaceConfig(source)).toThrow(/workspace 설정|Flow sequence|Map keys/u);
  },
);
