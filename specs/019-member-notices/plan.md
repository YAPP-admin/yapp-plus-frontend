# 구현 계획: 회원 공지 조회·읽음 연동

**브랜치**: `DongjaJ/api` | **작성일**: 2026-11-07 | **명세**: [spec.md](spec.md)
**상태**: 1단계 문서 작성·리뷰 대기. 제품 구현 미착수.

## 요약과 기술 맥락

기존 생성 SDK와 Native 인증으로 회원 공지 목록·홈·상세·읽음 저장을 연결한다.
최신 서버 입력의 생성 결과와 현재 코드가 같아 생성 코드는 수정하지 않는다.

- TypeScript 6.0.3·React 19.2.8, Vite·Stackflow·TanStack Query·Zod·MSW·Vitest·Testing Library.
- Node.js 24.20.0·pnpm 12.3.4, 기존 SEED·vanilla-extract. 본문에만 react-markdown 10.1.0을 catalog로 추가한다.
- 대상: 회원 웹 3개 화면, 브라우저 개발 모의 환경과 iOS·Android WebView. 별도 영속 저장소 없음.
- 기본 staleTime 30초·retry false와 기존 mount/focus/reconnect 정책을 유지한다. 주간 경계 갱신 외 polling 없음.
- 성능 기준: 중복 진행 요청·반복 커서 차단, 홈 첫 페이지만 조회. 번들 증분은 실측하며 임의 수치 목표는 만들지 않는다.

## 헌법 점검

fetch 후 HEAD와 origin/main은 `32f4c3d0f52e4b43bcc34326267b497fc2a17feb`다.
[루트 지침](../../AGENTS.md), [웹 지침](../../apps/web/AGENTS.md), [헌법](../../.specify/memory/constitution.md)을 적용한다.

| 항목               | 설계 전·후 판정과 근거                                                            |
| ------------------ | --------------------------------------------------------------------------------- |
| 목적·최소 범위     | 통과. 승인된 회원 흐름에 한정하고 관리자·서버·Native 계약은 유지한다.             |
| 데이터·신뢰 경계   | 통과. 구현 전에 조회·읽음·계정 격리·롤백을 명세화한다.                            |
| 모노레포·생성 코드 | 통과. 공개 진입점 사용, 웹 내부 실소비자만 공유, 생성 코드 변경 없음.             |
| 재현성·의존성      | 통과. 고정 도구·catalog 사용, Tiptap JSON 표시의 한계와 Markdown 대안을 조사했다. |
| 검증·복구          | 통과. 기능별 회귀·품질 게이트·단계 리뷰·롤백과 미실행 기록을 정의한다.            |
| 이슈·외부 변경     | 문서·초안만 승인됨. 이슈 생성과 다음 단계 진행 확인은 제품 구현 전 필요하다.      |

구조상 예외는 없다. PR 크기는 실제 diff로 재평가하며 의존성 최소 변경만으로 800줄 이상이면 원인을 보고하고 멈춘다.

## 구조와 데이터 흐름

- 문서: 이 디렉터리의 spec·research·data-model·contracts·quickstart·tasks·validation과 요구사항 체크리스트.
- `apps/web/src/features/member-notice`: 목록 검증·생성 Query 옵션·유형/날짜 변환·탐색 비의존 오류 콘텐츠와 공개 index.
- `apps/web/src/pages/notices`: 서버 필터·무한 스크롤·목록 상태. 도메인 비의존 observer는 실제 두 소비자가 생길 때 shared로 이동한다.
- `apps/web/src/pages/home`: 단일 페이지 Query의 주간 공지. 생성 single/infinite key를 구분하고 검증 함수만 공유한다.
- `apps/web/src/pages/notice-detail`: 상세 schema·query·읽음 mutation·본문·과제·첨부. pages/notices import 대신 feature의 오류 콘텐츠를 사용하며 헤더·BackButton은 각 페이지에 유지해 feature → app 의존을 만들지 않는다.
- `apps/web/src/app/navigation`과 `apps/web/stackflow`: category params·canonical URL·replaceStep·직접 진입/뒤로가기.
- `apps/web/src/mocks`: 생성 MSW helper 기반 fixture·handler. 공용 API mock보다 먼저 등록하고 테스트마다 상태를 초기화한다.

Native apiOptions → 생성 queryFn → responseTransformer 검증 → 화면 변환 순서다.
목록은 useInfiniteQuery, 홈·상세는 useQuery로 초기/추가/백그라운드 오류를 구분한다.
일반 재조회 실패는 이전 값과 안내를 유지하되 상세 POST_NOT_FOUND는 이전 본문을 숨긴다.
계정 경계에서 업무 캐시·화면 상태를 정리하고 숨겨진 화면의 observer·event listener를 정리한다.
세부 인터페이스는 [계약](contracts/member-notices.md)을 따른다.

## 단계와 리뷰 단위

| 단계 | 범위                     | 완료 기준                                             |
| ---- | ------------------------ | ----------------------------------------------------- |
| 1    | 명세·설계·작업·이슈 초안 | 문서 정합성·품질 게이트 제출, 리뷰 대기               |
| 2    | 기반과 US1 목록          | schema·mock·필터·페이지·URL/스크롤 회귀 통과          |
| 3    | US2 홈                   | 주간 경계·최대 3개·독립 오류·상세 이동 통과           |
| 4    | US3 본문 렌더러          | 의존성·URL/HTML·서식·레이아웃·번들 비교 제출          |
| 5    | US3 상세 조회            | 실제 상세·과제·이미지 만료·404/503·조회 무부작용 통과 |
| 6    | US4 읽음·통합            | 204·중복/지연·계정 격리·재조회 실패·전체 흐름 검증    |

순서대로 실행하고 각 단계 결과 제출·리뷰·다음 단계 진행 확인을 지킨다.
US1은 목록 탐색의 독립 증분이며 실제 공지 열람 MVP는 5단계까지다. 전체 완료는 6단계다.
단계와 PR은 별개다. 문서·조회·홈·렌더러·상세·읽음을 분리 가능한 목적별로 관리한다.
실제 base 대비 추가+삭제 650줄부터 분리를 검토하고 lockfile·문서·테스트 포함 800줄 미만을 유지한다.
브랜치 생성·전환·commit·push·PR은 별도 승인 전 수행하지 않는다.

## 검증과 복구

- [quickstart.md](quickstart.md)의 인접 테스트와 단계별 check, 화면·의존성 변경 시 build를 수행한다.
- 공용 UI·모바일 설정/의존성 변경이 없어 Storybook 공용 UI 갱신·expo:doctor는 현재 대상이 아니다.
- 저장과 조회 실패를 분리한다. 저장된 읽음은 취소하지 않는다. 서버·DB 마이그레이션은 없다.
- 문제 시 해당 웹 변경과 필요 시 렌더러 의존성을 되돌린다. 롤백으로 기존 고정 화면이 돌아오는 한계도 출시 리뷰에 명시한다.
- 문서·자동 검증·실서버·실기기 결과를 구분하고 validation.md에 누적한다.
