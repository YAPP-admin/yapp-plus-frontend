# 관리자 라우팅 PR 3 검증

- 확인일: 2026-10-11. 관련 이슈: [#50](https://github.com/YAPP-admin/yapp-plus-frontend/issues/50).
- 사용자 결정에 따라 출석 세션 선택을 `/sessions`와 다른 `/attendance` 경로로 분리했다.
- 실제 세션·출석 데이터, API, 인증, 수정 모달과 PR 4 회원 목록은 포함하지 않는다.

## 경로와 쿼리

- `/attendance`: 세션 선택. `all | common | pm | design | android | ios | web | server`를 허용한다.
- `/attendance/:sessionId`: 세션별 출석부. `common`을 제외한 직군 필터를 제공한다.
- `/attendance/scores`: 출석 총점. 정적 경로를 우선하고 `common`은 허용하지 않는다.
- 잘못된 값은 `all`로 처리하며 앱이 만드는 URL에서는 기본값을 생략한다.
- 세 경로의 필터 변경은 history에 추가하고 `resetScroll: false`로 스크롤을 유지한다.
- 출석부 메뉴와 상세의 목록 복귀는 필터 없는 `/attendance`로 연결한다.
- 세션 관리 메뉴는 `/sessions`를 유지한다. 다른 메뉴에는 이전 쿼리를 전달하지 않는다.
- 상세에서는 출석부 메뉴에 `aria-current="location"`, 선택 화면과 총점에서는 해당 메뉴에
  `aria-current="page"`를 사용한다. 총점에서 출석부 메뉴를 함께 활성화하지 않는다.
- API 연결 전에는 세션 ID에 임의 UUID·숫자 제한을 추가하지 않는다. `scores`는 예약 경로다.
- 세션 행의 상세 링크는 실제 목록 구현 시 연결한다. 이번에는 typed 탐색을 통합 테스트한다.

## 자동 검증

- `mise exec -- node --run check`: 포맷·lint·타입 검사·전체 테스트 통과.
- `mise exec -- node --run build`: 전체 빌드 통과.
- 관리자 테스트 7개 파일, 81개 통과. PR 2 대비 34개를 추가했다.
- part 허용값과 잘못된 외부 입력, 세 경로의 직접 접근·기본값 생략·history 복원, 메뉴 초기화,
  정적 scores 우선, typed 세션 탐색과 키보드 목록 복귀, 알 수 없는 하위 경로 404를 확인했다.
- 생성 라우트 트리는 Vite로 갱신했다. 새 의존성을 추가하지 않았다.
- Node.js 24.20.0, pnpm 12.3.4를 사용하고 mise 신뢰 설정은 실행 명령에만 적용했다.

## 서버와 브라우저

- 프로덕션 서버에서 세 출석 경로의 정상·잘못된 쿼리는 HTTP 200과 예상 필터를 반환했다.
- `/attendance/session-123/missing`, `/attendance/scores/missing`은 HTTP 404를 반환했다.
- 기존 `/sessions`와 `/login`은 HTTP 200과 기존 화면을 유지했다.
- Chrome에서 필터 선택·새로고침 복원과 메뉴 전환을 확인했다.
- 375px에서 세 화면의 가로 넘침이 없었으며 1280px에서도 확인했다.
- 상세 목록 복귀 링크에 Tab으로 접근하면 2px 포커스 테두리가 표시되고 Enter로 기본 목록에 복귀했다.
- 메뉴·복귀 링크·필터의 조작 영역은 최소 44px 높이다. 메뉴는 최소 44px 너비도 확보했다.

## 남은 확인과 Git 상태

- 실기기 터치, VoiceOver 음성 출력, 다크 모드와 네이티브 선택창의 실제 방향키 조작은 미검증이다.
- 개발 서버의 기존 로그인 export 코드 분할 경고와 Storybook 청크 크기 경고는 남아 있다.
- PR 2는 `242c3fc`로 커밋했고 PR 3는 `DongjaJ/admin-attendance-routing`의 미커밋 변경이다.
  단계별 diff와 백업은 `.context/admin-routing-preparation`에 보관한다.
- 이슈 #50 본문에도 사용자 승인에 따라 `/attendance` 분리 결정을 반영했다.
- 사용자 승인 전에는 PR 4를 시작하지 않는다.
