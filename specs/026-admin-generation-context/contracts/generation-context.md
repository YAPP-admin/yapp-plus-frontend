# 관리자 기수 Context 계약

## 서버 경계

- 조회: `GET /api/admin/generations`, STAFF 인증, 200 응답의 `generations` 배열.
- 401: 저장된 access token을 삭제한 뒤 즉시 `/login`으로 이동한다. 500·네트워크·잘못된 응답:
  전역 오류 경계의 수동 재시도.
- 생성 Query 옵션을 재사용하고 QueryClient 기본 재시도·staleTime 정책을 유지한다.
- SSR에서는 ClientOnly fallback만 렌더링한다. 로그인 화면·클라이언트의 토큰 없는 진입에서는
  Provider와 요청을 만들지 않고 `/login`으로 이동한다.

## 공개 인터페이스

`features/admin-generation/index.ts`에서 다음 계약만 공개한다.

- `AdminGenerationProvider`: 상위에서 전달한 인증 가능 여부와 children을 받는다.
- `useAdminGeneration`: Provider 밖에서 사용하면 구성 오류를 알린다.
- 기수 목록은 Provider 내부 `useSuspenseQuery`가 소유한다. Provider가 렌더링되면 생성 타입의
  기수 목록·현재 기수와 `selectGeneration(id: number)`를 항상 제공한다. 목록에 없는 ID는
  선택하지 않으며 자동 선택은 첫 항목을 사용한다.
- 잘못된 응답·401 이외의 모든 조회 오류는 Provider에서 throw하고 상위 초기화 경계가 재시도를
  표시한다. 기수 배열은 서버 계약상 하나 이상이므로 Provider가 별도 길이 검증을 하지 않는다.
  401은 오류 경계를 렌더링하지 않고 저장된 access token을 삭제한 뒤 즉시
  `/login`으로 이동한다. 재조회에서 기존 data가 있으면 `useSuspenseQuery`의 기본 오류 정책을
  따른다. Query 상태를 별도 Context state로 복제하지 않는다.
- 인증 전용 오류 경계는 `clearAdminAccessToken`, 관리자 Query 취소·제거, `/login` 이동을 이 순서로
  한 번 수행한다. 일반 오류 경계는 token이나 캐시를 삭제하지 않고 재시도만 제공한다.

## 소비자와 화면 수명

- 관리자 레이아웃이 로그인 feature의 공개 토큰 읽기 함수를 사용하고 인증 가능 여부를 전달한다.
- 사이드바는 Context를 읽어 상태와 현재 기수를 표시한다. 4단계에서 동일 자리에 Select를 연결한다.
- 세션 route는 Context가 보장한 유효한 ID를 `SessionsPage`에 전달한다. 페이지는 기수 조회
  상태를 직접 소유하지 않는다.
- 세션 경로의 기수별 경계와 overlay 초기화 key에 현재 ID를 포함한다. 기존 pathname 초기화도 유지한다.
  다른 경로의 Outlet·입력 폼은 기수 변경으로 remount하지 않는다.
- 선택 전환은 미저장 세션 초안을 폐기한다. 모달의 기존 포커스 잠금·제출 중 닫기 제한은 유지한다.
- 이전 요청의 캐시 무효화는 허용하되 unmount된 화면의 완료 알림·필터 변경은 실행하지 않는다.
- 데스크톱·모바일 선택은 같은 Provider를 사용한다. 표시 이름을 그대로 사용하고
  중복 이름은 기수 번호·ID를 보조 표시해 선택 대상을 구분한다.
- 모바일 패널에서 선택 후 패널은 유지한다. Select 포털과 패널의 포커스 경계를 함께 검증한다.
