export type NativeSnapshot = {
  version: string;
  fingerprint: string;
  nativeBuildDigest: string;
};

function versionParts(version: string): number[] {
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u.test(version)) {
    throw new Error('앱 버전은 세 자리 숫자 형식이어야 합니다.');
  }
  const parts = version.split('.').map(Number);
  if (!parts.every(Number.isSafeInteger)) {
    throw new Error('앱 버전 범위를 확인하세요.');
  }
  return parts;
}

/** Expo가 계산한 지문과 Git 빌드 입력을 프로젝트의 버전 규칙에 연결합니다. */
export function compareNative(base: NativeSnapshot, head: NativeSnapshot) {
  const previous = versionParts(base.version);
  const next = versionParts(head.version);
  for (const snapshot of [base, head]) {
    if (
      !/^[a-f0-9]{40}$/u.test(snapshot.fingerprint) ||
      !/^[a-f0-9]{64}$/u.test(snapshot.nativeBuildDigest)
    ) {
      throw new Error('네이티브 검사 결과가 불완전합니다.');
    }
  }
  const difference =
    next.map((part, index) => part - (previous[index] ?? 0)).find((part) => part !== 0) ?? 0;
  const nativeChanged =
    base.fingerprint !== head.fingerprint || base.nativeBuildDigest !== head.nativeBuildDigest;
  if (difference < 0) {
    throw new Error('앱 버전을 감소시킬 수 없습니다.');
  }
  if (nativeChanged && difference === 0) {
    throw new Error('네이티브 구성이 변경됐습니다. 앱 버전을 증가시키세요.');
  }
  return { nativeChanged, needsBuild: nativeChanged || difference > 0 };
}
