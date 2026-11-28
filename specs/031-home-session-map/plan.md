# 구현 계획: 홈 세션 카드와 카카오맵

**실제 브랜치**: `DongjaJ/dongjaj/keep-current-implementation` · **작성일**: 2026-11-28
**명세**: [spec.md](spec.md)

## 요약

홈은 기존 주간 응답으로 장소 링크와 표시를 만들고, iOS 셸은 지정된 HTTPS 지도 링크만
카카오맵 앱 실행으로 연결한다. 새 API·브리지 메서드·패키지·의존성은 추가하지 않는다.
출석 전·마감 안내와 팀 사진 기능은 보존한다.

## 기술 맥락

- TypeScript, React·SEED·vanilla-extract·Stackflow, React Native 0.88.1·Expo 58.1 계열을 사용한다.
- Node 24.20.0·pnpm 12.3.4와 기존 Vitest·Testing Library·MSW를 사용한다.
- 저장소·데이터 마이그레이션은 없다. 조회·캐시·출석 상태 수명은 변경하지 않는다.
- 추가 네트워크 조회·타이머·현재 위치 요청 없이 기존 좌표로 URL을 만든다.
- 대상은 웹 홈 한 화면과 iOS 외부 탐색 처리다. 웹 호환 범위는 루트 `.mwgrc`를 따른다.

## 헌법 점검

기준: HEAD `d6f5cf4d275e335e5b677a07ee85e6631e682f81`, 조사한 origin/main
`e2149d3a5b169ba19c3804f5a7d4d439b07afdfe`.

- 제품 범위: 사용자 승인 계획과 제외 항목을 명세에 기록했다. 제품 목적은 `docs/mission.md`를 따른다.
- 앱 경계: API 생성 타입을 재사용하고 앱 간 import나 공용 계약 변경은 하지 않는다.
- 입력 검증: 웹 좌표와 네이티브 외부 URL을 각 신뢰 경계에서 검증한다.
- 도구·의존성: 기존 도구만 사용한다. 구현 전에 Modern Web Guidance 1.0.0을 적용한다.
- 검증: 가까운 모델·실행 경계·UI에 나누고 같은 실패 조합을 반복하지 않는다.
- 검토·복구: 단계별 리뷰, 800줄 미만 PR, 별도 외부 변경 승인과 HTTPS 대체 경로를 유지한다.
- 설계 후 재점검: 위반을 요구하는 설계가 없다. 제품 구현·실기기 검증은 아직 미실행이다.

## 구조와 구현

- 웹 `pages/home/model/session-map.ts`: nullable 좌표를 검증해 HTTPS URL 또는 null을 반환한다.
- 웹 `pages/home/ui/current-week-card.tsx`와 인접 스타일: 장소 행·제목·정규 시간 줄·달력·버튼을 변경한다.
- 모바일 `src/external-navigation.ts`: URL 식별·좌표 검증·앱 실행·웹 대체를 담당하며 실행 의존성을 주입해 테스트한다.
- 모바일 `app/index.tsx`: 같은 origin 탐색은 유지하고 외부 탐색만 위 함수에 넘긴다.
- 자세한 입력·출력과 화면 기준은 [contracts/home-map.md](contracts/home-map.md)를 따른다.

## 진행 단계

1. 명세·조사·계약·검증·복구·작업 목록과 이슈 초안을 작성하고 사용자 리뷰를 받는다.
2. 이슈 연결 및 1단계 리뷰 뒤 모바일 실행 경계와 테스트를 구현하고 결과를 리뷰받는다.
3. 2단계 리뷰 뒤 홈 UI·링크·테스트를 구현하고 브라우저·iPhone 및 품질 게이트 결과를 제출한다.

문서 커밋 후 사용자가 이슈 생성과 main 병합을 승인했다. #665를 연결하고
`origin/main`의 `e2149d3a`를 현재 브랜치에 일반 merge했다(`7c0cd07d`).
홈 스켈레톤 개선과 `allowsLinkPreview={false}`를 보존한다.
브랜치 이름을 바꾸지 않는다. 문서도 PR 크기에 포함하고 650줄부터 분리 검토, 800줄 이상이면
명세·모바일·웹처럼 독립 검토 가능한 PR로 분리한다. 실제 Git 작업은 별도 승인 후 수행한다.

## 검증과 복구

[quickstart.md](quickstart.md)의 사례와 명령을 실행하고 [validation.md](validation.md)에 기록한다.
배포는 별도 승인 대상이며 검증된 main SHA를 사용한다. 모바일 JS는 기존 runtime과 호환되는
업데이트 방식으로 제공할 수 있지만 이번 작업에서 배포하지 않는다.
문제 발생 시 모바일 외부 실행 변경을 이전 검증 JS로 복구하면 웹 HTTPS 링크가 남는다.
웹 표시 문제는 이전 웹 배포로 복구한다. 데이터 복구·브리지 버전 마이그레이션은 필요 없다.
