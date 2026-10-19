# 관리자 내부 UI·조회 계약

## 공개 진입점과 조회

`apps/admin/src/features/notice-management/index.ts`는 필요한 타입·Query 훅·UI만 노출한다.
모의 저장소와 Tiptap 문서 JSON은 공개하지 않는다. 네트워크 API 계약을 새로 만들지 않는다.

- listNotices(): 전체 공지 반환. 종류 필터와 전체/필터 개수는 같은 조회 결과에서 계산한다.
- getNotice(id): 공지 또는 null 반환. null은 찾을 수 없음, 예외는 조회 오류다.
- createNotice(input), updateNotice(id, input): 검증된 저장 결과 반환. deleteNotice(id): 삭제 성공 반환.
- 모든 호출은 비동기이며 개발 브라우저 외에는 실행을 차단한다. Query enabled도 DEV와 hydration을 함께 검사한다.
- 키는 ['admin', 'notices'], 상세는 그 뒤 id로 구분한다. 읽음은 상세에서 파생한다.
- 변경 성공 후 목록·해당 상세를 갱신한다. 삭제 시 상세 캐시도 제거한다. 실패 시 낙관적 변경은 하지 않는다.
- 오류는 validation/not-found/unavailable/unknown으로 구분한다. 테스트에서 저장소 실패를 주입하며 운영용 실패 토글은 만들지 않는다.

## 편집기·폼·첨부

- NoticeMarkdownEditor: value(Markdown), onChange(Markdown), editable, 레이블·오류 연결 id를 받는다.
- 지원 서식은 명세의 문단·줄바꿈·H1~H3·굵게·링크·목록·인라인 코드·코드 블록으로 제한한다.
- 툴바는 선택 상태·접근 가능한 이름·키보드 조작을 제공한다. 링크 입력은 HTTP(S)를 검증한다.
- 읽기 전용 본문도 같은 지원 스키마로 렌더링한다. Markdown 원문을 HTML로 직접 주입하지 않는다.
- NoticeForm: 초기 저장값, 저장 콜백, 취소 콜백, 저장 중/실패 상태를 받는다. TanStack Form이 입력·검증을 담당한다.
- 초기값 복원은 공지 id 단위로 수행하고 백그라운드 재조회로 편집 중 값을 덮어쓰지 않는다.
- AttachmentInput: 기존+신규 목록과 변경 콜백을 받는다. 파일 오류는 항목별로 연결하고 같은 파일 재선택도 가능하게 한다.
- dirty는 정규화된 저장값과 초안을 비교한다. 편집기 초기화는 변경으로 세지 않고 첨부 추가·제거도 포함한다.
- 저장 성공을 반영한 뒤 이탈 차단을 해제한다. 진행 중 버튼을 비활성화하고 중복 요청도 막는다.

## 탐색·접근성

- 기존 /notices, /notices/new, /notices/$noticeId, /notices/$noticeId/edit를 유지한다.
- category=all|session|submission|operation, tab=readers|questions는 기본값 생략·잘못된 값 기본 복원을 유지한다.
- 필터 이동은 history push·resetScroll:false다. 뒤로가기는 기존 필터/탭을 복원한다.
- 생성·수정 성공은 해당 상세 readers로 이동한다. 명시적 목록 복귀는 all, 수정 취소는 readers다.
- 목록에서 삭제 후 현재 필터를 유지한다. 질문 탭은 준비 중이며 질문·알림 실행 버튼을 추가하지 않는다.
- 미저장 앱 이동·뒤로가기는 Router blocker로 확인하고 새로고침·닫기는 beforeunload를 사용한다.
- 확인 창은 제목·설명·취소·확정을 제공하고 포커스를 가둔다. 닫은 뒤 실행점 또는 남은 목록 제목으로 복귀한다.
- 모의 조회가 비활성화된 SSR·프로덕션은 준비 중 안내를 렌더링한다. 로딩·오류·빈 결과와 구분한다.
