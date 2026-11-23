# 조사와 결정

## API와 기존 구현

- 공식 명세: <https://44nk4mnqi7.execute-api.ap-northeast-2.amazonaws.com/v3/api-docs>.
- 신규 `GET /api/admin/generations`는 `staffBearerAuth`를 사용하며 operationId는 `list_2`다.
- 과거·현재·미래 전체 기수를 번호·ID 내림차순으로 반환한다. 첫 항목을 기본값으로 사용한다.
- `AdminGenerationListResponse.generations`의 항목은 ID·번호·표시 이름을 필수로 가진다.
- 세션 CRUD는 이미 생성 SDK에 연결되어 있다. 라우트의 환경 변수 기수 공급만 대체한다.
- 신규 operation 추가로 뒤쪽 `list_*` 이름이 이동한다. 재생성 후 경로별 호출 의미를 확인한다.
- 2026-11-19 재조회는 최초 503 후 성공했다. 원본은 `.context/admin-generation-openapi.json`,
  SHA-256은 `4a28b22002ee6c1cb68ef224332bb12643adc82af2a1e2ccc381587ed770138b`다.
- 이 조사로 실서버 로그인 또는 CRUD를 검증한 것은 아니다.

## 상태와 인증

- 결정: 관리자 레이아웃 아래 Provider 하나를 두고 Query 결과와 선택 ID를 Context로 제공한다.
- 이유: 사이드바·모바일 탐색·세션이 같은 선택을 소비하고 화면 이동에는 수명을 유지해야 한다.
- 대안: URL·localStorage·전역 store는 사용자가 선택한 비영속 정책에 필요하지 않다.
- 결정: Provider는 `useSuspenseQuery`로 기수 목록을 조회하고 관리자 레이아웃의 단일
  Suspense·오류 경계에서 작업 영역 전체를 처리한다.
- 이유: 모든 관리자 데이터가 선택 기수에 종속되므로 기수 조회 실패 때 사용할 수 있는
  독립 메뉴나 화면은 없다. Consumer마다 같은 준비·오류 처리를 반복하지 않는다.
- 기수 목록은 서버 계약상 항상 하나 이상이다. 별도 빈 목록 UI나 길이 검증을 추가하지 않는다.
- `useSuspenseQuery`의 기본 오류 전파를 사용한다. 초기 조회 오류는 오류 경계로 보내고, 기존 data가
  있는 재조회 오류는 Query의 기본 정책에 맡긴다. Query 상태를 Context에 별도로 복제하지 않는다.
- 결정: 로그인 성공 후에는 대시보드로만 이동한다. 로그인 전에 관리자 작업 영역 Query를 만들지 않으며,
  로그인 성공 흐름에 별도 Query 취소·제거를 추가하지 않는다.
- 결정: 401은 `clearAdminAccessToken`으로 브라우저 저장 token을 삭제하고, 관리자 Query를
  취소·제거한 뒤 오류 경계의 인증 전용 분기가 `/login`으로 이동한다.
- 이유: Provider의 render 중에는 라우터 이동 같은 부수 효과를 실행하지 않는다. 인증 전용 경계가
  token 삭제와 이동을 한 번만 수행하고, 일반 오류의 재시도 UI와 분리한다.
- 결정: SSR에서는 ClientOnly fallback만 렌더링하고, 클라이언트에서 token을 읽은 후 Provider를
  mount한다. token이 없으면 기수 Query를 시작하지 않고 `/login`으로 이동한다.

## 기수 전환과 경합

- 결정: 선택 기수 ID를 세션 Query key와 Mutation 경로에 전달한다.
- 대안: 기수와 무관한 단일 캐시를 덮어쓰면 늦은 결과가 현재 화면과 섞이므로 사용하지 않는다.
- 결정: 모달·Snackbar와 세션 오류 경계에 기수 수명을 반영한다. 유형 필터는 기존 URL 값을 유지한다.
- 이유: 기존 overlay 경계는 pathname만으로 초기화되므로 같은 경로의 기수 전환을 구분해야 한다.
- 기존 Mutation 훅의 캐시 갱신과 화면 콜백을 구분한다. 전환 후 완료는 원래 기수 캐시만 갱신한다.

## 응답 검증과 UI

- 생성 스키마로 기수 응답을 검증하되 int64 파싱의 bigint 출력으로 원본 DTO를 교체하지 않는다.
  ID는 기존 number 계약에서 안전하게 표현 가능한 정수인지 확인한다.
- 기존 SEED Select 패턴을 사용한다. 별도 선택 라이브러리나 실험적 HTML 기능을 추가하지 않는다.
- `modern-web-guidance@1.0.0`에서 비동기 조회·선택 UI를 검색하고 `forms`를 조회했다.
  보이는 라벨, 포커스 표시, 키보드·터치 검증을 적용한다. 전송 폼이 아닌 선택 상태 변경이므로
  기수 선택만으로 서버 변경 요청을 보내지 않는다.
- Spec Kit 확장 hook 설정 파일은 없으므로 자동 Git 작업을 실행하지 않는다.

별도 읽기 전용 조사에서도 Provider 위치·로그인 캐시 제거·기수별 overlay 경계가 필요함을 확인했다.
모달 초기화는 세션 경로에 한정해 다른 관리자 폼을 보존한다.
