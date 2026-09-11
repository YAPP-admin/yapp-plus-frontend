# Implementation Plan: WebView 실행 환경 식별

**Branch**: `webview-web-detection-plan` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-webview-environment/spec.md`

## Summary

모바일 WebView의 기존 User-Agent 뒤에 고정 토큰 `YAPPPlusWebView`를 추가하고, 공용 브리지 패키지에서 명시적으로 전달받은 User-Agent를 판별하는 순수 함수를 제공합니다. Safe Area 값은 현재 `webview-bridge` shared state와 CSS 변수 경로를 그대로 유지합니다. 선택 근거와 외부 참고 자료는 별도 의사결정 문서에 기록합니다.

## Technical Context

**Language/Version**: TypeScript 6.0.3, Node.js 24.20.0

**Primary Dependencies**: React Native 0.86.3, Expo 57, `react-native-webview` 13.16.1, `@webview-bridge/react-native` 1.8.0, `@webview-bridge/web` 1.8.0

**Storage**: N/A

**Testing**: Vitest 4, TypeScript typecheck, Oxlint, Oxfmt, Turbo build, Expo Doctor

**Target Platform**: iOS/Android WebView와 일반 웹 브라우저

**Project Type**: pnpm/Turbo 모노레포의 모바일 앱과 공용 브리지 패키지

**Performance Goals**: User-Agent 판별은 문자열 길이에 선형인 동기 연산이며 렌더링이나 네트워크 요청을 추가하지 않음

**Constraints**: User-Agent에는 고정 식별자만 저장하고 Safe Area 값은 포함하지 않음. 식별 결과는 보안 경계로 사용하지 않음. 미배포 앱의 이전 형식 호환은 추가하지 않음

**Scale/Scope**: 모바일 WebView 한 곳, 공용 판별 계약 한 개, 단위 테스트 한 파일, 의사결정 문서 한 개

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- 공용 브리지 계약은 `packages/app-bridge`를 단일 진실 공급원으로 사용합니다.
- 모바일 앱은 공용 패키지의 공개 진입점만 사용하고 다른 앱의 내부 파일을 import하지 않습니다.
- 외부 입력인 User-Agent는 공용 함수 경계에서 문자열 여부와 독립 토큰 일치를 확인합니다.
- 기존 `react-native-webview` API와 `webview-bridge` 상태를 사용하며 새 의존성을 추가하지 않습니다.
- Safe Area 브리지 동작을 가장 가까운 패키지 테스트로 검증하고 `node --run check`, `node --run build`, `node --run expo:doctor`를 실행합니다.
- 인증이나 보안 경계에는 User-Agent 판별을 사용하지 않으며 비밀 값을 기록하지 않습니다.

## Project Structure

### Documentation (this feature)

```text
specs/004-webview-environment/
├── plan.md              # This file ($speckit-plan command output)
├── research.md          # Phase 0 output ($speckit-plan command)
├── data-model.md        # Phase 1 output ($speckit-plan command)
├── quickstart.md        # Phase 1 output ($speckit-plan command)
├── contracts/
│   └── user-agent.md    # 앱 식별 토큰과 판별 계약
├── checklists/
│   └── requirements.md  # 명세 품질 체크리스트
└── tasks.md             # Phase 2 output ($speckit-tasks command - NOT created by $speckit-plan)
```

### Source Code (repository root)

```text
apps/mobile/app/index.tsx                    # WebView User-Agent 식별 토큰 주입
packages/app-bridge/src/index.ts             # 공용 토큰과 판별 함수
packages/app-bridge/tests/user-agent.test.ts # User-Agent 계약 단위 테스트
packages/app-bridge/tests/safe-area.test.ts  # 기존 Safe Area 계약 검증
docs/decisions/webview-environment-and-safe-area.md # 의사결정 기록
```

**Structure Decision**: 실행 환경 식별자는 모바일과 웹이 함께 사용하는 안정된 계약이므로 `packages/app-bridge`가 소유합니다. 모바일 앱은 공개 상수를 WebView 설정에 적용하고, 웹 코드는 필요할 때 공개 판별 함수에 요청 또는 브라우저의 User-Agent를 명시적으로 전달합니다. Safe Area 구현 파일은 변경하지 않고 기존 테스트로 보존을 확인합니다.

## Complexity Tracking

추가적인 복잡성 위반은 없습니다.
