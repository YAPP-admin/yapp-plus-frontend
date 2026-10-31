# 구현 계획: SEED React 3 업그레이드

**Branch**: `DongjaJ/seed-version-upgrade` | **Date**: 2026-10-31 | **Spec**: [spec.md](./spec.md)

**Input**: `specs/014-seed-v3-upgrade/spec.md`

## 요약

SEED React·CSS를 `3.1.0`, Vite plugin을 `2.1.1`로 함께 올리고, 고정된 CLI로 공용 UI snippet을 갱신합니다. 관리자 앱의 제거된 v2 계약을 v3 공개 계약과 `@yapp-plus/ui` 공개 진입점으로 옮기며, 웹의 제거된 배경 토큰은 렌더링 값이 같은 의미 토큰으로 교체합니다. 기존 회귀 테스트와 Storybook·호환성 검사·전체 품질 게이트로 동작과 시각적 의미를 확인합니다.

## 기술 맥락

- **언어/버전**: TypeScript 6.0.3, Node.js 24.20.0
- **주요 의존성**: React 19.2.8, `@seed-design/react`·`@seed-design/css` 3.1.0,
  `@seed-design/vite-plugin` 2.1.1, `clsx` 2.1.1
- **저장소**: 해당 없음. 제품 데이터와 API 계약을 바꾸지 않음
- **테스트**: Vitest, Testing Library, Storybook, SEED CLI `compat`, Turbo 품질 게이트
- **대상 플랫폼**: 관리자 Vite 웹 앱, 회원 Next.js 웹 앱, Storybook, 공용 React UI 패키지
- **프로젝트 유형**: pnpm/Turbo 모노레포의 프론트엔드 앱과 공용 UI 패키지
- **성능 목표**: 기존 빌드·상호작용 성능을 유지하고 새 런타임 계층을 추가하지 않음
- **제약**: 24시간 release-age, pnpm catalog, 고정 CLI, PR당 800줄 미만, 단계별 리뷰,
  StackFlow·모바일·데이터 제외
- **범위**: catalog와 lockfile, `packages/ui`, `apps/admin`, `apps/web`, `apps/storybook`

## 헌법 점검

기준은 `origin/main`의 `57287cff5e856358c0c04e752c7cf5c9a2975544`이며, 루트 `AGENTS.md`와 `.specify/memory/constitution.md`를 확인했습니다.

| 항목                    | 판정 | 근거                                                                                                                                         |
| ----------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 제품 맥락·최소 범위     | 통과 | `docs/mission.md`의 회원·운영진 흐름을 유지하고 StackFlow·데이터·API·모바일은 제외합니다.                                                    |
| 앱·공용 계약 경계       | 통과 | 앱은 `@yapp-plus/ui` 공개 진입점을 사용하고 내부 구현인 `WheelPicker`는 공개하지 않습니다.                                                   |
| 재현 가능한 도구·의존성 | 통과 | catalog와 `workspace:*` 규칙을 유지하고 SEED CLI를 `1.7.3`으로 고정합니다. `clsx`만 Time Picker의 실제 런타임 요구로 추가합니다.             |
| 변경에 가까운 검증      | 통과 | 공용 UI·관리자 회귀 테스트, Storybook, compat, `check`, `build` 순으로 검증합니다.                                                           |
| 검토 가능한 변경·복구   | 통과 | 명세 리뷰 뒤 구현하며 실제 base diff가 800줄 이상이면 Git 작업을 멈추고 분리합니다. 의존성·UI·앱 사용처는 하나의 원자적 되돌리기 단위입니다. |

## 프로젝트 구조

### 이 기능의 문서

```text
specs/014-seed-v3-upgrade/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-public-api.md
└── checklists/
    └── requirements.md
```

### 변경 대상

```text
pnpm-workspace.yaml
pnpm-lock.yaml
packages/ui/
├── package.json
└── src/
    ├── index.ts
    └── seed-design/ui/
apps/admin/src/
apps/web/src/
apps/storybook/stories/
```

**구조 결정**: SEED를 조합한 재사용 컴포넌트는 `packages/ui`에 두고 공개 진입점으로 내보냅니다. 앱별 사용처와 화면 스타일은 각 앱에 남깁니다. 생성 코드와 앱 간 직접 import는 변경하지 않습니다.

## 구현 단계

1. catalog·워크스페이스 의존성을 목표 버전으로 맞추고 lockfile을 한 번 갱신합니다.
2. CLI `1.7.3`으로 Action Button·Badge·Date Picker·Time Picker와 종속 snippet을 순차 생성합니다. `legacy-*`와 새 파일을 비교해 사용자 정의를 병합한 뒤 백업 파일을 제거합니다.
3. `@yapp-plus/ui` 공개 export와 props 타입, peer/runtime 의존성 계약을 갱신합니다.
4. 관리자 앱의 Dialog·Chip·Radio Group·첨부 파일·Badge·Picker 사용처와 테스트를 v3 계약으로 옮깁니다.
5. 웹의 `layerFill`을 값이 같은 `neutralMuted`로 교체하고 별도 색상 값이나 구버전 보정 스타일을 만들지 않습니다.
6. 회귀 테스트와 Storybook 사례를 갱신하고 자동·수동 검증을 수행합니다.
7. `origin/main` 대비 실제 변경량을 계산합니다. 800줄 이상이면 commit·push·PR 없이 원인과 분리안을 보고합니다.

## 설계 후 헌법 재점검

`research.md`, `data-model.md`, 공개 계약과 `quickstart.md` 작성 후에도 위 다섯 항목은 모두 통과합니다. 새 앱·공용 계층·데이터 모델·배포 경로를 추가하지 않으며, 구현 범위와 검증·복구 절차가 명세 경계를 넘지 않습니다.

## 복잡성 추적

헌법 위반이나 별도 정당화가 필요한 복잡성은 없습니다.
