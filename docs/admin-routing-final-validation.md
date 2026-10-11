# 관리자 라우팅 PR 9 및 최종 검증

- 확인일: 2026-10-12. 관련 이슈: [#58](https://github.com/YAPP-admin/yapp-plus-frontend/issues/58).
- 기준 커밋: PR 8 `5b96693`. 브랜치: `DongjaJ/admin-notifications-routing`.
- PR 9 범위: `/notifications` 최소 화면·메뉴, 전체 라우팅 계약 대조와 검증 문서.
- 실제 발송 내역·알림 발송·예약·취소·API·인증·권한은 후속 범위다.

## 자동 검증

- `mise exec -- node --run check`: 포맷·lint·타입 검사·전체 테스트 통과.
- `mise exec -- node --run build`: 전체 빌드 통과.
- 관리자 테스트 10개 파일, 160개 통과. 알림 직접 접근·메뉴 탐색과 history·키보드·404 총 4개 추가.
- 공통 메뉴 추가에 맞춰 기존 세션·출석·명단 업로드·공지 화면의 키보드 탐색을 갱신했다.
- 기존 테스트로 전체 쿼리 검증, 기본값 생략, 필터 복원, 회원 제출 검색, 상세·작성·수정 복귀를 재검증했다.
- 새 의존성·effect·이벤트 구독은 추가하지 않았다. 라우트 트리는 Vite로 생성했다.

## 전체 경로 대조

프로덕션 서버의 아래 13개 경로를 직접 요청해 HTTP 200과 예상 제목을 확인했다.
쿼리 화면은 선택값과 안내 문구도 확인했다.

| 경로                                                           | 확인한 상태                                      |
| -------------------------------------------------------------- | ------------------------------------------------ |
| `/`                                                            | 대시보드                                         |
| `/login`                                                       | 로그인 제목                                      |
| `/sessions?part=common`                                        | 전체 직군 대상 선택                              |
| `/attendance?part=common`                                      | 출석 세션 선택의 전체 직군 대상                  |
| `/attendance/session-123?part=web`                             | 세션별 출석부와 Web                              |
| `/attendance/scores?part=common`                               | 총점 정적 경로와 허용하지 않는 common의 all 처리 |
| `/members?tab=pending&q=Kim&part=web&role=admin&status=active` | 가입 대기·검색어·직군·권한·상태                  |
| `/members/import`                                              | 명단 업로드                                      |
| `/notices?category=submission`                                 | 제출 종류                                        |
| `/notices/notice-123?tab=questions`                            | 공지 상세 질문 탭                                |
| `/notices/new`                                                 | 작성 정적 경로                                   |
| `/notices/notice-123/edit`                                     | 공지 수정                                        |
| `/notifications`                                               | 알림 발송 내역                                   |

- `/notifications/missing`은 HTTP 404를 반환했다. 다른 알 수 없는 경로는 기존 라우터 테스트로 재검증했다.
- 라우트·스키마·메뉴·링크를 `docs/admin-routing.md`와 대조했고 불일치 없이 연결돼 있다.
- `scores`와 `new` 정적 경로, 목록과 상세·업로드·편집 화면의 분리는 기존 테스트로 유지됨을 확인했다.
- 화면·탭·선택형 필터는 history 추가, 회원 검색은 제출 시 replace, 명시적인 복귀는 기본값을 사용한다.

## 브라우저와 남은 범위

- Chrome에서 알림 메뉴 Enter 진입, 쿼리 제거, 새로고침, 뒤로가기의 공지 종류 복원과 앞으로가기를 확인했다.
- 알림 화면은 375px·1280px에서 가로 넘침이 없으며 프로덕션 렌더링 오류 로그가 없다.
- 실기기 터치·VoiceOver 음성 출력·실제 OS 한글 IME는 미검증이다.
- 기존 로그인 export 코드 분할 경고와 Storybook 청크 크기 경고는 남아 있다.
- 계획한 라우팅 단계는 모두 완료했다. 업무 UI·데이터·인증은 구현되지 않았다.
- GitHub PR 게시·병합과 최종 단계 커밋은 별도 승인 후 진행한다.
