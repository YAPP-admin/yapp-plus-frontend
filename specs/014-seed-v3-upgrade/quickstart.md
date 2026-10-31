# 구현·검증 절차

명세·계획 리뷰가 승인된 뒤에만 아래 절차를 실행합니다.

## 1. 기준 확인

```bash
git fetch origin
git status --short --branch
git rev-list --left-right --count HEAD...origin/main
```

작업 트리가 깨끗하고 기준 branch와 예상한 관계인지 확인합니다. Node.js와 pnpm은 `mise.toml`·`mise.lock`에 고정된 버전을 사용합니다.

## 2. 의존성 갱신

- catalog를 SEED React·CSS `3.1.0`, Vite plugin `2.1.1`, `clsx` `2.1.1`로 맞춥니다.
- `packages/ui`의 SEED peer를 `^3.1.0`으로 바꾸고 `clsx`를 runtime dependency에 추가합니다.
- pnpm으로 lockfile을 한 번 갱신하고 예상하지 않은 의존성 변경을 확인합니다.

## 3. snippet 갱신

충돌과 사용자 정의를 항목별로 확인할 수 있도록 다음 명령을 순차 실행합니다.

```bash
pnpm dlx @seed-design/cli@1.7.3 add ui:action-button --cwd packages/ui --on-diff backup
pnpm dlx @seed-design/cli@1.7.3 add ui:badge --cwd packages/ui --on-diff backup
pnpm dlx @seed-design/cli@1.7.3 add ui:date-picker --cwd packages/ui --on-diff backup
pnpm dlx @seed-design/cli@1.7.3 add ui:time-picker --cwd packages/ui --on-diff backup
```

각 실행 뒤 `legacy-*`와 새 파일을 비교해 Action Button의 기존 API와 사용자 정의를 병합합니다. 종속 `loading-indicator`, `progress-circle`, `wheel-picker`도 검토하고 병합이 끝난 백업만 제거합니다.

## 4. 계약과 사용처 이동

- [공개 UI 계약](./contracts/ui-public-api.md)에 따라 export와 앱 import를 갱신합니다.
- Alert Dialog를 먼저 옮긴 뒤 일반 Dialog를 옮겨 이름 충돌을 피합니다.
- Radio Group, Chip, 첨부 파일 계약과 mock을 갱신합니다.
- 웹의 `vars.$color.bg.layerFill`을 `vars.$color.bg.neutralMuted`로 교체합니다.

## 5. 자동 검증

```bash
pnpm --filter @yapp-plus/ui test
pnpm --filter @yapp-plus/admin test
pnpm --filter @yapp-plus/web test
pnpm dlx @seed-design/cli@1.7.3 compat --cwd packages/ui
node --run check
node --run build
```

Turbo 출력에서 새로 실행된 작업과 캐시 재사용 작업을 구분해 기록합니다. 모바일 설정·의존성을 바꾸지 않으므로 `node --run expo:doctor`는 실행하지 않습니다.

## 6. 수동 확인

- 관리자: Badge, Menu, Select, 일정 선택, Alert Dialog
- 웹: `neutralSolid` 버튼과 `neutralMuted`로 교체한 표면
- Storybook: Badge, Date/Time Picker, ActionButton `neutralSolid` loading
- 모든 대상: 라이트·다크, 키보드, 스크린 리더 이름, 터치, 중첩 Dialog의 Escape
- v3 기본 Badge 너비, Scale, 로딩 색상, safe-area를 구버전 스타일로 되돌리지 않았는지 확인

## 7. 변경량과 복구

```bash
git diff --numstat origin/main...
```

추가·삭제 합계가 800줄 이상이면 commit·push·PR을 중단하고 원인과 독립 분리안을 보고합니다. 검증 실패 시 lockfile만 부분적으로 되돌리지 않고 이번 업그레이드의 의존성·snippet·공개 export·앱 사용처를 함께 이전 상태로 되돌립니다.
