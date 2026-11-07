# 계약: 점수·출석 내역 조회

## 호출과 캐시

| 용도      | 생성 옵션·경로                                     | 조회 데이터                                     |
| --------- | -------------------------------------------------- | ----------------------------------------------- |
| 점수·경고 | mineOptions / GET /api/attendance-scores/me        | available + score 또는 unavailable + reason     |
| 내역      | find5InfiniteOptions / GET /api/attendance-history | 검증한 AttendanceHistoryResponse의 InfiniteData |

`SIGNED_IN` 또는 DEV+MSW 브라우저에서만 조회한다. 나머지는 앱 로그인 후 확인 안내를 표시한다.
기존 auth apiOptions·계정 경계·401 갱신을 사용하며 인증 wrapper나 별도 refresh 호출을 추가하지 않는다.
생성 query key를 유지하며 토큰·이름을 추가하지 않는다. 기본 staleTime 30초, retry false를 사용한다.
점수 queryOptions는 웹 feature에 두고 두 소비자가 같은 스키마·미대상 변환을 사용한다.
응답 schema는 생성 Zod를 확장한다. int64는 안전 범위를 검사한 뒤 number로 변환한다.
점수는 apiOptions를 받은 mineOptions의 queryFn·query key를 재사용하고 성공 data의 parse 결과를 반환한다.
HTTP 오류 본문을 생성 SDK가 파싱하도록 kyOptions.throwHttpErrors는 false로 설정하며 기존 인증 훅은 보존한다.
SDK가 던진 오류 본문을 검증하고 미대상 code는 unavailable 상태와 reason으로 보존한다. HTTP status를 추가 조건으로 사용하지 않는다.
Response body를 다시 읽지 않는다. 네트워크·취소·잘못된 오류 본문은 미대상이 아니다.
웹 점수 영역은 useSuspenseQuery·Suspense·ErrorBoundary로 초기 로딩·실패를 처리한다.
프로필·메뉴·규칙 다이얼로그는 경계 밖에 두며 재조회 실패는 기존 값과 오류 안내를 함께 표시한다.
내역은 생성 infinite 옵션에 responseTransformer를 전달해 검증·number 정규화 결과를 반환한다.
responseValidator의 반환값은 SDK에서 버려지므로 변환 용도로 사용하지 않는다.

## 점수 오류와 경고

- 검증된 오류의 `ATTENDANCE_SCORE_NOT_ELIGIBLE`, `CURRENT_GENERATION_NOT_FOUND` code는 unavailable 상태와 reason으로 보존한다.
- 다른 code·네트워크 오류·형식 오류는 일반 오류로 처리한다. 401 복구는 기존 인증 계층에 맡긴다.
- 최초 오류는 카드 오류·재시도이며 프로필·규칙·메뉴는 유지한다. 재조회 실패는 이전 값과 실패 안내를 표시한다.
- 출석 페이지는 독립 점수 query를 구독해 직접 진입에서도 경고를 판단한다. 점수 실패는 별도 재시도를 제공하고 목록을 막지 않는다.
- 오류가 없고 유효한 점수 응답의 absentCount ≥ 10일 때만 기존 경고 문구를 표시한다. 점수 오류·미대상·로딩이면 경고를 추정하지 않는다.

## 내역 페이지네이션

- 첫 `initialPageParam`은 빈 객체로 지정해 cursor를 보내지 않는다. 다음 요청은 반환된 문자열 cursor만 전달한다.
- `getNextPageParam`은 null일 때 undefined를 반환한다. 서버 순서를 바꾸지 않는다.
- 성공한 페이지의 items를 서버 순서대로 펼친다. 클라이언트에서 중복 제거하지 않는다.
- summary는 마지막 성공 페이지를 사용한다. 전체·남은 세션을 목록 길이로 계산하지 않는다.
- useLoadMoreObserver의 기본 IntersectionObserver로 목록 끝 요소를 관찰한다. 화면 활성·hasNextPage·조회 중 아님·오류 없음일 때만 fetchNextPage를 호출한다.
- 화면 숨김·이탈 시 observer를 정리한다. 전체 재조회와 다음 페이지 요청이 겹치지 않게 isFetching을 확인한다.
- 다음 페이지 실패 시 기존 목록과 재시도를 유지한다. 자동 요청은 중단하고 재시도 성공 후 다시 허용한다.
- 잘못된 cursor 오류는 추가 조회 오류로 표시한다. 처음부터 다시 불러오는 동작도 제공하며 query를 첫 페이지부터 초기화한다.
- 초기 실패는 화면 오류, 재조회 실패는 이전 목록+안내, 모든 병합 항목이 없고 nextCursor도 null이면 빈 화면이다.

## 상태 매핑

| attendanceStatus     | 표시                               |
| -------------------- | ---------------------------------- |
| PRESENT              | 출석                               |
| LATE                 | 지각                               |
| ABSENT               | 결석                               |
| EARLY_LEAVE          | 조퇴                               |
| LATE_AND_EARLY_LEAVE | 지각·조퇴                          |
| EXCUSED_ABSENCE      | 공결                               |
| UNDECIDED            | 아래 staffDecisionStatus 규칙 적용 |

UNDECIDED일 때 PENDING → 검토중, REJECTED → 반려, NOT_SUBMITTED → 미제출,
NOT_SELECTED → 미선택, APPROVED/null → 미확정이다. 확정 attendanceStatus가 있으면 그 값이 우선한다.
기존 출석·지각·결석 스타일을 유지하고 나머지는 기존 SEED 토큰의 중립 배지와 텍스트로 구분한다.

## 탐색·개발 환경

`/my`, `/my/attendance`와 Attendance의 MY defaultHistory·뒤로가기를 유지한다.
운영 `mode` params와 initialMode·records 목업 주입을 제거하고 기존 mode query는 실제 데이터에 영향을 주지 않는다.
개발용 `myState`, `attendanceState`는 DEV+MSW 초기화에서만 사용하고 운영 Activity params로 추가하지 않는다.
MSW 시나리오는 정상·빈 결과·미대상·지연·오류·추가 조회 오류·경고·전체 배지를 포함한다.

내역은 useSuspenseInfiniteQuery, 결석 경고는 useSuspenseQuery로 구독하고 각각 독립된
Suspense·ErrorBoundary를 둔다. 재조회 오류는 기존 data와 함께 표시한다. 내역 조회는
오류 code를 분류하지 않으므로 kyOptions.throwHttpErrors를 별도로 덮어쓰지 않는다.
