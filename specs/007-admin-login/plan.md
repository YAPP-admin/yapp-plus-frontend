# 구현 계획: 관리자 로그인

**브랜치**: `DongjaJ/admin` | **명세**: [spec.md](spec.md)

## 요약과 기술 맥락

TanStack Start의 `/login`에 TanStack Form을 연결한다. React 19, TypeScript 6,
SEED Design, vanilla-extract, Pretendard와 기존 Vitest·Testing Library를 사용한다.
Node 24.20.0·pnpm 12.3.4를 유지하며 데이터 저장소와 실제 인증은 추가하지 않는다.

## 저장소 원칙 검토

헌법 파일은 미작성 템플릿이므로 AGENTS.md의 한국어·최소 변경·패키지 경계·검증 규칙을 적용한다.
로그인 코드는 admin 내부에 두고 공용 UI의 공개 진입점만 사용한다. 생성 라우트는 도구로 갱신한다.
외부 의존성은 catalog에 고정하고 공개 테스트 계정은 프로덕션 번들에서 제외한다.

## 구현 순서

1. 명세·연구·내부 계약·작업 목록을 작성한다.
2. `@tanstack/react-form@1.33.5`와 기존 catalog의 user-event를 admin에 연결한다.
3. 루트에서 헤더를 경로 없는 `_dashboard` 레이아웃으로 이동하고 `/`를 유지한다.
4. 로그인 레이아웃과 입력을 구현하고 TanStack Form 검증·제출을 연결한다.
5. 모의 함수·성공 이동·오류 복구를 검증하고 전체 check/build와 브라우저 검증을 수행한다.

## 화면과 폼

1440×1080 Figma 구도, 폼 402px, 입력 44px, 버튼 56px을 사용한다.
768px 미만은 좌우 24px 여백의 세로 배치다. 로그인 영역만 dark-only로 설정한다.
useForm·form.Field로 입력과 필드 오류를 관리하고 useMutation으로 로그인 요청 상태를 관리한다.
revalidateLogic은 최초 submit, 이후 change 검증이며 인증 응답 오류는 mutation 결과에서 계산한다.
첫 오류 필드 포커스, 자동완성, 비밀번호 마스킹, aria 오류 연결과 중복 제출 방지를 구현한다.

## 검증과 전달

각 단계마다 변경·검증·누적 추가/삭제 줄 수·다음 작업을 보고한다.
각 PR은 문서·생성 파일을 포함해 base 대비 800줄 미만으로 분리하며 첫 base는 main,
후속 base는 직전 PR 브랜치다. 커밋·push는 승인된 범위에서 수행한다.
전체 `node --run check`, `node --run build`를 실행하고 실제 기기 미검증은 명시한다.
공용 UI 동작은 변경하지 않으므로 Storybook 확장은 하지 않는다.
복구는 이 기능의 코드·의존성·라우팅 변경을 되돌리는 것으로 충분하며 데이터 마이그레이션은 없다.
