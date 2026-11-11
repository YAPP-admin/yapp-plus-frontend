# Modern Web Guidance 사용법

이 저장소는 웹 UI·CSS·클라이언트 로직을 작성하거나 수정할 때 Modern Web Guidance를 먼저
조회합니다. 공식 스킬은 `.agents/skills/modern-web-guidance/SKILL.md`에 고정하고, Claude Code는
같은 파일을 `.claude/skills/modern-web-guidance`에서 읽습니다.

## 조회

저장소 루트에서 `pnpm`을 사용하고 CLI 버전은 `1.0.0`으로 고정합니다. 작업과 관련된 단일
플랫폼 기능을 2~5개 단어로 검색한 뒤 결과의 guide ID를 조회합니다.

```sh
pnpm dlx modern-web-guidance@1.0.0 search "confirmation dialog"
pnpm dlx modern-web-guidance@1.0.0 retrieve "<guide-id>"
```

`apps/web`, `apps/admin`, `packages/ui`의 실제 제품 계약과 SEED·Stackflow 규칙이 일반 예시보다
우선합니다. 새 HTML 속성에 무검증 `any` 단언을 추가하거나 Vite 빌드 타깃·fallback을 바꾸기
전에 현재 브라우저와 WebView 지원 범위를 확인합니다.

## 설정과 갱신

`.mwgrc`는 Baseline Widely Available을 기준으로 하며 Origin Trial과 단일 엔진의 변동 기능은
허용하지 않습니다. 실험 기능을 도입하려면 해당 기능을 별도 작업으로 검토하고 이 설정을
변경합니다.

공식 스킬을 갱신할 때는 `modern-web-guidance@1.0.0`과 upstream 커밋을 함께 확인하고, `SOURCE.md`
및 `skills-lock.json`의 해시를 갱신합니다. 가이드 본문 전체를 커밋하지 않습니다.

## 현대화 진단

기존 코드베이스 전체를 진단하는 별도 작업에서는 다음 명령을 사용합니다.

```sh
pnpm dlx modern-web-guidance@1.0.0 legacy-scan apps/web --json
```

스캔 결과는 후보 목록일 뿐입니다. 각 결과의 `keepWhen`·`dropWhen` 조건과 fallback, 생성 코드,
WebView 호환성을 확인한 뒤 수정 여부를 결정합니다.
