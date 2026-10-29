# React Query peer 정합성 조사 (C11 · #173)

## 결론

현재 API 생성 helper가 다른 React peer 인스턴스로 해석되는 것은 확인했다. 현재 소비는
`queryOptions`·`infiniteQueryOptions`와 Mutation 옵션 객체이며 hook·Context를 내보내지 않는다.
이번 조사에서 invalid hook call을 재현한 것은 아니며, 확정된 런타임 결함으로 분류하지 않는다.
현재 범위에서는 의존성·공개 API를 변경하지 않는다.

## 새로 확인한 근거

2026-10-29, 기준 `7898ee6`, 고정 pnpm의 frozen lockfile 설치에서 각 workspace의
`createRequire`로 React Query를 찾고 그 모듈 위치에서 React를 다시 해석했다.

| 소비 위치    | React Query | 해당 모듈이 해석한 React |
| ------------ | ----------- | ------------------------ |
| packages/api | 5.102.8     | 19.3.0                   |
| apps/admin   | 5.102.8     | 19.2.8                   |
| apps/web     | 5.102.8     | 19.2.8                   |

[`packages/api/package.json`](../../packages/api/package.json)은 React를 직접 선언하지 않는다.
[`react-query.gen.ts`](../../packages/api/src/generated/@tanstack/react-query.gen.ts)의 runtime import는
두 옵션 helper다. `InfiniteData`·`UseMutationOptions`는 type import이며 생성 공개 진입점도
React hook·Provider·Context를 재수출하지 않는다. 설치된 5.102.8의 두 helper 구현은 전달된
옵션 객체를 그대로 반환하며 hook을 호출하지 않는다. 이는 import된 패키지 전체가 React와
무관하거나 번들 중복이 절대로 없다는 보장은 아니다.

위 항목은 이번 소스·모듈 해석 조사이며 dots의 기존 감사와 별개다. 브라우저 번들 분석,
실제 렌더 트리에서의 hook 인스턴스 검증은 이번에 실행하지 않았다.

## Hook 도입 전에 충족할 조건

API 패키지가 hook·Context·Provider를 공개하거나 생성기 플러그인 설정이 바뀌면 이 판단을
다시 검토한다. 자동 peer 설치가 우연히 같은 버전을 고르는 것에 의존하지 않는다.

1. 생성 helper만 유지할지, React를 사용하는 공개 패키지로 바꿀지 실제 소비 요구를 확인한다.
2. hook을 공개한다면 앱과 패키지의 React/React DOM/React Query peer 계약을 정렬한다.
   구체적인 peer 범위·개발 의존성·외부화 방식은 그 변경에서 정하며 버전 강제 override로 숨기지 않는다.
3. frozen 설치 후 위 모듈 해석을 다시 실행해 단일 React 인스턴스를 확인하고, 실제 앱의
   QueryClientProvider 안에서 신규 hook을 렌더링하는 소비자 통합 테스트를 실행한다.
4. 서버 요청별 QueryClient 분리와 번들 중복 여부도 확인한다. 이는 #167의 계정·SSR 격리 검증과
   함께 다루되, 이번 peer 조사 완료가 캐시 격리까지 보장하지는 않는다.

생성 파일은 직접 수정하지 않는다. 현재 조사에는 새 SDK 전용 테스트를 추가하지 않으며
#158–161에 허용된 최소 회귀 테스트 예외를 이 항목으로 확장하지 않는다.
