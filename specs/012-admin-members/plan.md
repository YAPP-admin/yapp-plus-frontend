# 구현 계획: 관리자 회원 관리 화면

**브랜치**: `brussels-v2/member-management-fixtures` | **작성일**: 2026-10-29
**명세**: [spec.md](spec.md) | **상태**: 1~5b단계 리뷰·커밋 완료 · 6a CSV 전용 전환·검증 완료 · 사용자 리뷰 대기

## 요약과 기술 맥락

화면·입력·실제 파일 검증을 먼저 완성한다. 화면은 읽기 전용 개발 fixture를 props로 받는다.
별도 모의 저장소·직접 mock 서비스·가짜 Query/Mutation·임의 API 경로를 추가하지 않는다.
저장·비활동·명단 반영은 비활성이고 기존 Faker·MSW는 후속 API 연동에서 재사용한다.

- TypeScript 6·React 19·TanStack Start/Router/Form·Zod 4·SEED·vanilla-extract를 유지한다.
- Node.js 24.20.0·pnpm 12.3.4를 사용한다. 테스트는 Vitest·Testing Library와 실제 브라우저다.
- TanStack Query는 후속 SDK 연결에서 사용한다. 이번 fixture 조회에는 네트워크 수명을 흉내 내지 않는다.
- Papa Parse 5.7.0과 `@types/papaparse`를 6a에서 catalog·manifest·lockfile에 고정하고 지연 로딩한다.
- 저장은 없으며 폼 초안·파일·검증 결과·중복 선택만 화면 수명 동안 메모리에 둔다.
- 관리자 데스크톱·375px을 대상으로 하며 10MB 파일 제한과 전체 결과 스크롤을 적용한다.
- 새 성능 SLA·가상화·공용 패키지·배포 정책은 추가하지 않는다.

## 지침 점검

헌법은 미작성 템플릿이므로 AGENTS.md와 사용자 확정 사항을 적용한다. 생성 파일은 직접 수정하지 않는다.
최신 origin/main은 93b74f4이며 착수 시 작업 트리는 깨끗했다. 2b는 사용자 승인으로 분리한 브랜치에서 진행하며 base는 brussels-v2/member-management-plan(9ca4901)이다.
사용자 승인으로 [이슈 #182](https://github.com/YAPP-admin/yapp-plus-frontend/issues/182)를 생성했고 담당자는 DongjaJ다.
사용자의 1단계 진행 확인과 이슈 생성 승인 후 2a단계에 착수했다. 사용자 승인 후 문서·2a를 커밋했다. 2b도 7af086c에 커밋했다. push·PR은 수행하지 않았다.
.specify/extensions.yml이 없어 specify·plan·tasks 전후 extension hook은 없다.
설계 전후 앱 경계·최소 변경·생성 계약·catalog·단계별 리뷰·민감 정보 제한을 점검했다.

## 구조와 책임

- apps/admin/src/features/member-management/model/: 두 페이지의 화면 타입·직군/권한·전화번호 규칙·읽기 전용 fixture. 외부는 index.ts만 사용한다.
- apps/admin/src/pages/members/: 검색·목록·팀 필터·수정 모달과 화면 상태. 다른 페이지를 직접 import하지 않는다.
- apps/admin/src/pages/member-import/: 파일 파싱·검증·중복 판정·업로드·미리보기. 아직 없는 재사용 계층은 만들지 않는다.
- apps/admin/src/routes/_dashboard/members/ 및 app/ui/: URL 어댑터·사이드바·현재 위치만 연결한다.
- 테스트는 해당 모델·UI 옆에 둔다. 재사용 UI 변경 시 관련 Storybook 사례도 갱신한다.
- specs/012-admin-members/: spec·plan·research·data-model·contracts·quickstart·tasks·checklists·검증 기록.

## 단계와 PR 경계

각 행은 별도 리뷰 단위다. 해당 단계에서 구현·테스트·화면 근거를 제출하고 사용자 확인 후 다음 행을 시작한다.
예상치는 문서·테스트·스타일·lockfile을 포함한 추가+삭제 줄 수이며 실제 크기를 보장하지 않는다.

| 단계 | 검토 결과                            | 선행             | 예상 줄 수            |
| ---- | ------------------------------------ | ---------------- | --------------------- |
| 1    | 명세·설계·작업·이슈 초안             | 없음             | 450~650               |
| 2a   | 최소 화면 모델·순수 변환             | 1 리뷰·이슈 확인 | 250~450               |
| 2b   | 읽기 전용 fixture·개발 페이지 입력   | 2a               | 250~450               |
| 3    | 회원 하위 탐색·URL·가입 대기 빈 화면 | 2b               | 400~650               |
| 4a   | 행 목록·빈 상태·조회 상태 표현       | 3                | 350~600               |
| 4b   | 검색·직군·URL 복원                   | 4a               | 250~450               |
| 4c   | 매핑 전후·팀 표시·필터               | 4b               | 250~450               |
| 5a   | 수정 폼·기수 정정 제한               | 4c               | 350~600               |
| 5b   | 모달 연결·초안 수명·접근성           | 5a               | 250~450               |
| 6a   | 파서 의존성·파일 읽기·양식           | 5b               | 300~650, 설치 후 실측 |
| 6b   | 행 검증·중복 분류                    | 6a               | 350~600               |
| 7a   | 파일 선택·드롭·읽기 상태             | 6b               | 300~500               |
| 7b   | 미리보기·중복 선택·예정 수           | 7a               | 350~600               |
| 8    | 통합·반응형·접근성·인수 기록         | 7b               | 200~400               |

650줄부터 분리를 검토하고 800줄 이상은 제출하지 않는다. 실제 base 대비 합계를 확인한다.
최소 의존성 변경도 제한을 넘으면 원인과 분리 가능성을 보고한다. 테스트·lockfile을 계산에서 빼지 않는다.
기본 base는 main이다. 선행 PR 미병합 시 종속 base 사용 또는 병합 대기는 별도 Git 승인 범위에서 결정한다.

## 후속 API 연결

전체 목록·상세·수정·비활동·이력·명단 검증/반영의 데이터와 오류 계약을 백엔드와 확정한다.
원본 OpenAPI에서 SDK·타입·Zod·Query·Faker·MSW를 생성하고 기존 공용 handler 구성에 연결한다.
수정 후 재조회가 필요한 테스트만 MSW handler 내부에 최소 상태를 둔다. 화면용 저장소는 만들지 않는다.
fixture 공급부를 SDK/Query로 교체하고 계약이 준비된 버튼부터 연결한다. 이번 tasks에는 실제 연결 작업을 넣지 않는다.

## 검증과 복구

[quickstart.md](quickstart.md)의 단계별 검증을 수행하며 모델 규칙을 여러 UI 계층에서 반복 검사하지 않는다.
기본 게이트는 mise exec -- node --run check, 앱·의존성 변경에는 mise exec -- node --run build도 실행한다.
새 실행·Turbo 캐시·실패·미실행을 구분한다. 1단계는 문서·설정만 변경하므로 앱 빌드는 대상이 아니다.
실제 서버·저장소 변경·마이그레이션·배포는 없다. 복구는 해당 독립 변경을 되돌리는 방식이다.
