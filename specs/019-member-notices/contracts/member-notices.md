# 회원 공지 소비 계약

## API와 인증

| 목적 | 경로                         | 생성 진입점                         | 성공                   |
| ---- | ---------------------------- | ----------------------------------- | ---------------------- |
| 목록 | GET /api/posts               | list1Options / list1InfiniteOptions | UserPostListResponse   |
| 상세 | GET /api/posts/{postId}      | detail2Options                      | UserPostDetailResponse |
| 읽음 | PUT /api/posts/{postId}/read | acknowledgeMutation                 | 204, 본문 없음         |

useNativeAuthSession의 phase가 SIGNED_IN이거나 DEV와 VITE_API_MOCKING=true인 일반 브라우저에서만 요청한다.
미로그인·복구 불가에는 기존 인증 안내를 사용한다. 토큰을 URL·문서·사용자 정의 Query key에 넣지 않는다.
apiOptions를 전달하고 GET 401만 기존 Native 복구·1회 재요청을 사용한다. 공통 인증을 PUT 지원으로 넓히지 않는다.

## 목록·홈과 탐색

- 유형은 ALL/SESSION/ASSIGNMENT/OPERATION. 기타는 OPERATION이다. single/infinite 생성 key를 각각 사용한다.
- initialPageParam은 `{}`, getNextPageParam은 null에서 종료하며 후속 cursor와 type을 유지한다. 서버 순서로 병합하고 중복 postId는 최초 위치에 최신 값을 반영한다.
- 진행 중·숨겨진 화면에서는 다음 페이지를 요청하지 않는다. 빈 중간 페이지에 새 커서가 있으면 계속 탐색할 수 있어야 한다.
- 반복 커서는 자동 조회를 멈추고 목록 새로고침을 제공한다. INVALID_POST_CURSOR는 선택 카테고리의 페이지·커서를 제거하고 첫 페이지부터 복구한다. 단순 다중 페이지 refetch로 대체하지 않는다.
- 일반 추가 오류는 해당 페이지만 재시도한다. 권한/계정 변경이 확인되면 캐시·커서를 초기화한다. 서버 권한 변경을 클라이언트가 선제 감지한다고 가정하지 않는다.
- 홈은 ALL 첫 페이지에서 현재 서울 일요일~토요일 작성일로 필터링해 처음 3개를 선택한다. 세션 API의 날짜와 결합하지 않는다.
- 홈 활성화·focus 복귀 시 마지막 조회 주와 현재 주가 다르면 staleTime과 무관하게 갱신한다. 실패해도 현재 주로 필터링해 지난주 공지를 이번 주로 표시하지 않는다. polling은 없다.
- TabsState에 `category?: 'ALL' | 'SESSION' | 'ASSIGNMENT' | 'OPERATION'`을 추가한다. notices URL에만 직렬화하고 ALL은 생략한다.
- `/notices?category=ASSIGNMENT` 직접 진입·새로고침에서 복원한다. 잘못된 값은 ALL이다. Tabs route·TabsActivity·TabLink·useTabsUrl의 정규화 경계를 함께 갱신한다.
- replaceStep으로 필터를 변경하며 history entry를 추가하지 않는다. 탭 전환은 category를 보존하지만 다른 탭 URL에는 노출하지 않는다.
- 상세 URL `/notices/:noticeId`와 부모 게시판 fallback을 유지한다. 상세 왕복은 기존 목록 스크롤, 필터 변경은 위로 이동한다.

## 상세·본문·이미지

- noticeId는 양의 안전한 정수만 요청한다. 잘못된 ID·POST_NOT_FOUND는 접근 불가, 나머지 실패는 재시도를 제공한다.
- GET은 읽음을 저장하지 않는다. 목록은 서버 daysUntilDeadline, 상세는 서울 오늘과 deadlineDate의 차이를 사용한다.
- NoticeMarkdown은 contentMarkdown 문자열의 기본 CommonMark를 표시한다. skipHtml을 사용하고 raw HTML/JSX 실행·추가 문법은 없다.
- 본문 최상위 제목은 화면 제목 아래 h2부터 표현한다. 링크는 HTTP(S) 절대 URL 검증 후 새 창·noopener noreferrer를 적용한다.
- Markdown 이미지도 같은 URL 정책·대체 텍스트·실패 표시를 적용한다. 별도 첨부는 displayOrder 순서, filename 대체 텍스트다.
- 이미지 로딩 실패는 명시적 재시도로 상세를 조회한다. 자동 오류 재조회 루프를 만들지 않는다.
- 일반 재조회 중/실패는 기존 본문과 안내를 유지한다. POST_NOT_FOUND는 이전 본문을 숨긴다.

## 읽음·경합·복구

- 저장 전 read=false·현재 세션·온라인 여부를 확인한다. mutation의 기본값(자동 재시도 없음)을 사용하고, 오프라인에서는 버튼을 비활성화해 저장을 시작하지 않는다.
- 요청 결과는 postId·userId·sessionId에 귀속한다. 취소 요청을 별도로 만들지 않으며, 계정 전환 뒤 늦은 callback은 현재 cache를 갱신하지 않는다.
- 204면 현재 상세의 read=true만 확정하고 상세를 재조회한다. readCount는 로컬 증가시키지 않는다.
- 뒤따른 GET 실패는 확인 완료를 유지하고 인원 갱신 재시도를 보여준다. 이전 GET이 늦게 read=false를 덮지 않도록 취소·재조회 순서를 보장한다.
- PUT 응답 유실은 결과 불명 오류로 표시한다. 사용자 재시도와 서버 멱등성으로 중복 기록을 막는다.
- PUT AUTHENTICATION_FAILED는 자동 반복하지 않는다. 사용자의 복구 재시도는 상세 refetch()로 실제 GET을 보장해 기존 401 복구를 거친다. 캐시만 반환하는 fetchQuery로 대체하지 않는다.
- GET 성공 후 최신 apiOptions로 사용자 재클릭을 받는다. read=true로 확인되면 저장 버튼을 다시 활성화하지 않는다. PUT POST_NOT_FOUND는 접근 불가로 전환한다.
- 계정 변경 뒤 이전 callback이 setQueryData·invalidateQueries를 호출하지 않게 소유자를 다시 확인한다. mutation cache 제거만으로 보장되지 않는다. 다른 feature에서 인증 내부 파일을 import하지 않는다.

## 개발·테스트 경계

앱별 MSW에 생성 helper·타입 fixture를 연결하고 성공/빈 결과/오류/다중 페이지/읽음 상태를 재현한다.
fixture 읽음 상태는 테스트마다 초기화한다. 인증·권한·실제 S3 동작을 MSW 통과로 검증했다고 보고하지 않는다.
