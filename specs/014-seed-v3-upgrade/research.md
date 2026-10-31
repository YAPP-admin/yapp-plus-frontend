# 조사 결과: SEED React 3 업그레이드

## 기준 자료

- [SEED React 3 업그레이드 가이드](https://seed-design.io/react/updates/upgrade/v3)
- [SEED React Changelog](https://seed-design.io/react/updates/changelog)
- [SEED CLI 명령](https://seed-design.io/react/getting-started/cli/commands)
- 확인 기준일: 2026-10-31

## 결정 사항

### 1. 호환되는 안정 버전을 한 번에 적용

- **결정**: `@seed-design/react@3.1.0`, `@seed-design/css@3.1.0`, `@seed-design/vite-plugin@2.1.1`을 사용합니다.
- **근거**: React와 CSS는 같은 3.1 계열이며 React의 CSS peer가 `^3.1.0`입니다. Vite plugin 2.1.1은 CSS 3 peer 범위를 지원합니다. 세 버전은 24시간 release-age를 충족합니다.
- **대안 제외**: 3.0 최소 버전이나 서로 다른 minor 조합은 최신 안정판 요구와 peer 정렬을 동시에 만족시키지 못합니다.

### 2. 공식 snippet을 고정 CLI로 재생성

- **결정**: `@seed-design/cli@1.7.3`과 `--on-diff backup`을 사용해 `ui:action-button`, `ui:badge`, `ui:date-picker`, `ui:time-picker`를 순차 적용합니다. 함께 설치되는 `loading-indicator`, `progress-circle`, `wheel-picker`도 검토합니다.
- **근거**: snippet은 복사된 소스라 패키지 설치만으로 갱신되지 않습니다. 백업과 새 파일의 diff로 기존 Action Button 사용자 정의를 명시적으로 병합할 수 있습니다.
- **대안 제외**: `latest`는 재현할 수 없고, 파일을 수동 재작성하면 공식 메타데이터와 종속 snippet을 놓칠 수 있습니다.

### 3. 공용 UI 계약은 현재 소비 범위만 공개

- **결정**: `Badge`, `DatePicker`, `TimePicker`와 각각의 props 타입만 `@yapp-plus/ui`에서 공개합니다. `WheelPicker`와 추가 Date Picker 변형은 내부 구현으로 둡니다. 기존 `ActionButton` API는 유지합니다.
- **근거**: 둘 이상의 앱이 사용할 수 있는 안정된 UI 계약은 패키지에 두되, 실제 소비가 없는 확장 지점은 만들지 않는 저장소 원칙을 따릅니다.
- **대안 제외**: 관리자 앱에서 SEED 완성형 컴포넌트를 직접 가져오면 v3의 snippet 전환과 공용 진입점 원칙을 위반합니다.

### 4. 제거된 API는 의미를 보존해 일대일 이동

- **결정**:
  - Alert 용 `Dialog`는 `AlertDialog`, 일반 `ContentDialog`는 `Dialog`로 이동합니다.
  - `Chip.Root`는 `Chip.Button`으로 이동합니다.
  - primitive Radio Group은 `RadioGroupField.Root.Primitive`와 `RadioGroup.Item.Primitive`를 사용합니다.
  - `FileEntry`와 `useFileUploadContext`는 `AttachmentInputFileEntry`와 `useAttachmentInputContext`로 이동합니다.
  - rejection 타입은 `AttachmentInputRootProps`의 `onFileReject`에서 파생합니다.
- **근거**: 공식 v3 이름과 공개 export를 사용하면서 기존 역할·닫힘 조건·파일 검증을 유지합니다.
- **대안 제외**: 별도 headless 파일 업로드 패키지는 현재 공개 타입만으로 해결할 수 있어 추가하지 않습니다.

### 5. 색상은 동일 값의 의미 토큰으로 교체

- **결정**: 웹의 `vars.$color.bg.layerFill`을 모두 `vars.$color.bg.neutralMuted`로 바꿉니다. 새 색상 literal, 병렬 토큰, 구버전 테마 보정은 추가하지 않습니다.
- **근거**: 두 토큰은 라이트·다크 모드에서 값이 같고, `neutralMuted`가 v3에서 유지되는 배경 의미입니다. `color` 지침에 따라 색상 변경은 의미 토큰으로 제한하고 두 모드에서 상태 대비를 직접 확인합니다.
- **대안 제외**: 이전 이름을 로컬 alias로 복원하면 제거된 계약을 남기고 이후 마이그레이션 비용을 늘립니다.

### 6. v3 기본 디자인을 수용

- **결정**: Badge 자연 너비, Menu·Select Content Scale, `neutralSolid` 로딩 색상, safe-area 보정을 되돌리지 않습니다.
- **근거**: 의도된 디자인 변경이며 현재 사용처에서 구버전 DOM·너비에 의존하는 계약은 발견되지 않았습니다. Storybook과 실제 화면에서 회귀만 확인합니다.
- **대안 제외**: 구버전 스타일 재현은 v3 채택 목적을 약화하고 별도 유지보수 계층을 만듭니다.

### 7. 검증과 롤백을 변경 경계에 맞춤

- **결정**: 공용 UI·관리자 회귀 테스트, Storybook, `compat`, `node --run check`, `node --run build`를 수행하고 수동 라이트·다크·키보드·터치 점검을 기록합니다. 실패 시 의존성·snippet·사용처를 함께 되돌립니다.
- **근거**: Dialog와 Picker는 이름만 바뀌어도 런타임 의미가 달라질 수 있어 타입 검사만으로 충분하지 않습니다.
- **대안 제외**: 패키지만 먼저 배포하거나 일부 사용처를 v2로 남기는 혼합 상태는 peer와 런타임 계약이 불안정합니다.
