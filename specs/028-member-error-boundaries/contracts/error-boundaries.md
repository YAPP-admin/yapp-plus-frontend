# 회원 웹 내부 오류 경계 계약

HTTP API·생성 SDK·브리지 wire 계약은 변경하지 않는다. 아래 이름과 책임은 웹 내부 공개 계약이다.

## ErrorState

- 입력: `variant: 'page' | 'section'`, `title`, `description`, `titleAs`(기본 h2), `onRetry`, `retryLabel`, 선택적 `secondaryAction: { label, href }`.
- `page`는 기존 정적 회색 그림을 제공하고 `section`은 큰 그림을 생략한다. 기본 문구는
  “앗, 오류가 발생했어요!”·“잠시 후 다시 시도해 주세요.”이며 영역형은 조회 대상을 제목으로 전달한다.
- 액션은 UI props로 받는다. 자체 refetch·location 변경·인증 판별·원문 오류 출력은 없다.
- Local의 기본 액션은 다시 시도 하나다. App의 액션은 새로고침과 홈으로 이동이다.
- 일반 원인·토큰·요청 헤더를 표시하지 않는다. 장식 그림은 보조기술의 중복 안내를 만들지 않는다.

## LocalErrorBoundary와 판별 정책

- 입력: children, ErrorState 표시 설정, pendingFallback, resetKeys, 화면 복귀 reset 여부.
- 판별 Context의 `shouldRethrow(error: unknown): boolean`은 app이 auth 분류 함수를 주입한다.
  일반 단독 테스트의 기본 정책은 false다. 앱 통합 테스트는 실제 주입을 사용한다.
- 위임 대상 오류는 fallback을 렌더링하기 전에 다시 throw한다. 일반 오류는 ErrorState로 교체한다.
- 내부 QueryErrorResetBoundary와 React reset을 함께 수행한다. 기존 화면 활성 Context를 사용한다.
- Query 결과를 넘기는 공통 판정은 `error`, `isFetching`, `isFetchNextPageError`와 인증 분류를 사용한다.
  Hooks 호출 순서를 깨거나 생성 Query 옵션을 재정의하지 않는다.

## AuthErrorBoundary

- 인증 오류만 처리하며 다른 오류는 상위로 전달한다. AccountScreen의 모든 보호 Activity 안에 둔다.
- 회원 API 최종401·명시적인 브리지 AUTH_REQUIRED만 인증 오류다. 취소·과거 계정·일반403·PUT 업로드 오류는 제외한다.
- auth feature의 공개 진입점으로 분류와 재인증 행동을 제공한다. 다른 feature가 auth 내부를 직접 가져오지 않는다.
- 차단은 기존 인증 cache로 공유한다. `AccountScreen`과 entry guard가 같은 재인증 필요 상태를 읽는다.
- 최상단에서 `flow.replace('Login', {})`로 이동한다. Login의 추가 error 팝업을 활성화하지 않는다.
- 공개 로그인·가입 화면은 보호 경계에 막히지 않는다. 비활성 Activity가 새로 로그인 이동을 중복 실행하지 않는다.

## AppErrorBoundary

- Provider 바깥 최종 경계다. QueryClient·인증 Provider·Stackflow를 요구하지 않는 UI만 사용한다.
- 새로고침은 현재 주소를 다시 로드하며 홈 링크는 `/`다. import 단계 실패나 native 프로세스 종료 복구를 보장하지 않는다.

## Mutation

- 업무 Mutation은 인증 오류만 `throwOnError`로 전파한다. 일반 오류·낙관적 롤백·불명 결과는 현재 소유자에서 처리한다.
- 합성 사진 제출은 가장 바깥 소유 Mutation에서 한 번 전파한다. 내부 mutateAsync 결과와 catch가 인증 원인을 지우지 않는다.
- 원본 SDK ApiError를 보존하거나 검증된 auth 오류로 정규화한다. unsafe cast·메시지 검색·임의 숫자 상태 추측은 사용하지 않는다.
- 인증 작업 자체의 반환 AuthResult와 업무 Mutation 정책을 섞지 않는다. 네이티브 호출 실패 전체를 인증 실패로 간주하지 않는다.
