/** workspace의 버전 별칭을 제외하고 설치·빌드 정책을 네이티브 보조 digest에 전달합니다. */
import { parse } from 'yaml';

/** catalog는 설치된 네이티브 구성의 Expo 지문으로 검사하며 다른 설정은 보존합니다. */
export function nativeWorkspaceConfig(source: string): string {
  const config: unknown = parse(source);
  if (typeof config !== 'object' || config === null || Array.isArray(config)) {
    throw new Error('workspace 설정 객체를 확인하세요.');
  }
  const buildSettings = Object.fromEntries(
    Object.entries(config).filter(([name]) => name !== 'catalog' && name !== 'catalogs'),
  );
  return JSON.stringify(buildSettings);
}
