# 1단계·2a 검증 결과

기준 HEAD: `48bbf662`, 확인한 origin/main: `b294e116`, 관련 이슈: [#669](https://github.com/YAPP-admin/yapp-plus-frontend/issues/669).

- 명세·계획·계약·작업 목록을 정식 반영했다. 이벤트 40개(대상 24·보류 16), 고유 이름, 우선순위 14/17/9, 작업 ID 34개와 로컬 링크를 검사했다.
- posthog-js 1.455.4·@posthog/react 1.11.3을 catalog로 설치했고 pnpm install --frozen-lockfile이 통과했다. SDK·Provider·hook import도 확인했다.
- 최초 설치는 core-js postinstall 정책으로 실패했다. 후원 안내 스크립트임을 확인하고 core-js@3.51.0만 실행 차단해 해결했다. 공급망 보호는 유지한다.
- pnpm이 기존 Expo optional peer snapshot·일부 전이 의존성을 재해석했다. 생성 lockfile을 직접 편집하지 않았으며 모바일 선언 버전은 그대로다.
- check: 통과. format 검사와 lint 7개·typecheck 7개·test 5개 모두 신규 실행이며 테스트 1,975개가 통과했다. Turbo 캐시 재사용은 없다.
- build: 3개 모두 신규 실행 통과. expo:doctor: 신규 실행 20/20 통과.
- 제품 행동 테스트 추가는 의존성 준비에 해당하지 않는다. SDK 초기화·전송·녹화·native SDK는 아직 연결하지 않았다.
- PostHog 실제 수신·마스킹·iOS 크래시·소스맵·배포는 미실행이며 후속 단계에서 검증한다.
- 이슈 생성 이후 commit·push·PR·배포·브랜치 변경은 하지 않았다. 다음은 2b 설정·마스킹·Provider 연결이다.
