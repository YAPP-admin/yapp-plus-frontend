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

// #635의 의존성 업데이트를 되돌리는 승인된 1.0.8 복구 한 쌍만 허용합니다.
// 버전뿐 아니라 양쪽 Expo 지문·빌드 설정 digest가 일치해야 하며, 다음 네이티브 출시 때 제거합니다.
const approvedRuntimeRestore = {
  base: {
    version: '1.0.9',
    fingerprint: 'a1819243df7163808e9fca08ac295f867fc1d192',
    nativeBuildDigest: '656aaf1559491a07f8920ecafda8ef5132a08fbd29ee92edacb84742324b61c4',
  },
  head: {
    version: '1.0.8',
    fingerprint: 'ca9c8ab0ccc6a233e198555d8371b3d82a6921a0',
    nativeBuildDigest: '6a9145e5aca883724482fb6fb39710e529a202fb0e665f2804b9326b0cd1238f',
  },
} satisfies Record<'base' | 'head', NativeSnapshot>;

function matchesSnapshot(snapshot: NativeSnapshot, expected: NativeSnapshot) {
  return (
    snapshot.version === expected.version &&
    snapshot.fingerprint === expected.fingerprint &&
    snapshot.nativeBuildDigest === expected.nativeBuildDigest
  );
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
  const approvedRestore =
    matchesSnapshot(base, approvedRuntimeRestore.base) &&
    matchesSnapshot(head, approvedRuntimeRestore.head);
  if (difference < 0 && !approvedRestore) {
    throw new Error('앱 버전을 감소시킬 수 없습니다.');
  }
  if (nativeChanged && difference === 0) {
    throw new Error('네이티브 구성이 변경됐습니다. 앱 버전을 증가시키세요.');
  }
  return { nativeChanged, needsBuild: nativeChanged || difference > 0 };
}
