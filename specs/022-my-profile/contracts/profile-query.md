# 프로필 조회와 화면 계약

## HTTP와 생성 경계

- `GET /api/users/me`, 기존 사용자 Bearer 인증. 사용자 ID·query·body를 추가하지 않는다.
- 200 응답의 여섯 필드·nullable·표시 규칙은 [데이터 모델](../data-model.md)을 따른다.
- 401 `AUTHENTICATION_FAILED`는 기존 인증 복구에 맡긴다. 409 `ACTIVE_GENERATION_CONFLICT`, 503 `USER_PROFILE_UNAVAILABLE`은 프로필 오류로 안내한다.
- operationId는 확인 시 `find_2`이며 생성 함수명은 재생성 후 해당 경로로 식별한다. 기존 함수명을 프로필 이름이라고 추정하지 않는다.
- 생성 SDK·Query·Zod·MSW는 패키지 공개 진입점으로 import한다. 생성 파일과 전역 검증 설정은 직접 수정하지 않는다.

## 조회 연결

Provider의 `apiOptions`를 생성 Query 옵션에 전달하고 기존 client·인증 복구·query key·AbortSignal을 보존한다.
프로필 `responseValidator`에서 생성 Zod 스키마를 검사하고 원본 JSON을 성공 데이터로 반환하는 client 동작을 이용한다.
프로필 전용 queryFn·인증 래퍼·별도 캐시 key를 만들지 않는다. 화면은 `useSuspenseQuery`와 기존 복귀 훅을 사용한다.
검증 실패는 성공 캐시에 들어가지 않아야 한다. int64 파싱 결과 bigint는 원본 JSON 캐시에 들어가지 않는다.

요청 허용은 `SIGNED_IN` 또는 `BROWSER && DEV && VITE_API_MOCKING === 'true'`다.
그 외 상태에서는 조회 컴포넌트를 마운트하지 않는다. 인증 없는 일반 브라우저에 로그인 안내를 표시하고,
초기 인증 확인·로그아웃 중에는 이전 프로필 없이 `—`를 유지한다. `VITE_STATIC_CONTENT`는 허용 조건에 추가하지 않는다.

## 화면 상태와 접근성

| 상황               | 프로필 값      | 문구·동작                                                     |
| ------------------ | -------------- | ------------------------------------------------------------- |
| 최초 로딩          | 모두 `—`       | `프로필을 불러오는 중이에요`, status                          |
| 최초 실패          | 모두 `—`       | `프로필을 불러오지 못했어요`, alert와 `프로필 다시 시도` 버튼 |
| 성공               | API 표시 값    | null 항목만 `—`, 상태 오류 없음                               |
| 재조회             | 마지막 성공 값 | 기존 값 유지                                                  |
| 재조회 실패        | 마지막 성공 값 | 별도 안내 없이 다음 화면 복귀 때 재조회                       |
| 인증 없는 브라우저 | 모두 `—`       | `프로필은 YAPP+ 앱에 로그인한 후 확인할 수 있어요.`, status   |

최초 실패는 `ScreenQueryBoundary` reset, 성공 후 실패는 `refetch({ cancelRefetch: false })`로 복구한다.
버튼은 기존 `ActionButton`을 사용한다. 최초 재시도 중에는 로딩 UI로 바뀐다.
재시도 버튼의 명확한 이름으로 출석의 `다시 시도`와 구분한다. 기본 이미지와 기존 레이아웃은 유지한다.
별도 프로필 경계와 출석 경계를 나란히 두어 어느 쪽도 다른 조회의 완료를 기다리지 않는다.

## 개발 응답과 계정 경계

웹 전용 고정 fixture는 생성 타입의 `satisfies`로 검사하고 생성 핸들러의 baseUrl을 명시한다.
`apps/web/src/mocks/browser.ts`와 `server.ts`에서 연결하고 성공·null·오류 override는 가까운 기능 테스트에 둔다.
개발 fixture는 정상 화면 시연용이며 운영·정적 콘텐츠·실제 인증 복구에는 사용하지 않는다.
계정 캐시 폐기·늦은 응답 차단은 기존 인증 경계를 유지하며 프로필을 통한 회귀 사례로 검증한다.
