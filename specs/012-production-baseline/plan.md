# 구현 계획: 앱별 Production 배포 기준

> #132 후속 변경: 아래 배포 시작은 도메인을 바꾸는 승격 시작을 뜻합니다. 준비 빌드·업로드는
> 이력 생성 전이며, 미확정 승격은 운영 확인 후에만 재개합니다. 현재 절차는
> [승격 순서 계획](../014-production-ordering/plan.md)을 따릅니다.

**브랜치**: `fix/131-production-baseline` | **작성일**: 2026-10-29 | **명세**: [spec.md](spec.md)

## 요약

GitHub Deployments에 Vercel 프로젝트별 시도를 먼저 기록하고 실제 배포 후 성공으로 표시한다.
CD는 가장 최근 시도가 성공한 경우에만 해당 SHA를 Turbo 비교 기준으로 사용한다.
확정할 수 없는 상태는 강제 배포하며 조회 자체의 오류는 job을 실패시킨다.

## 기술 맥락

- Node 24.20.0 내장 모듈과 GitHub CLI, 기존 GitHub Actions·Vercel CLI 59.13.1을 사용한다.
- 저장소: GitHub Deployments, task `deploy:yapp-plus`, environment `production-<project-id>`.
- 대상: Web/Admin 자동·수동 Production. Preview 동작은 유지한다.
- 검증: Node 내장 test runner, 실제 임시 Git 이력과 메모리 GitHub 응답, check·build.
- 제약: 새 의존성·Secret 없음, Production job에만 deployments 쓰기 권한, 변경량 800줄 미만.

## 저장소 원칙 확인

constitution은 템플릿이므로 AGENTS.md를 실제 규칙으로 적용한다. 제품 앱/API 변경은 없다.
배포 정책 변경에 앞서 명세·설계·복구 절차를 작성했다. 생성 파일과 다른 workspace는 수정하지 않는다.
초기 설계와 최종 설계 모두 최소 권한·한국어 문서·테스트·PR 크기 기준을 충족해야 한다.

## 구조와 구현

- `.github/scripts/production-baseline.mts`: GitHub 조회·시도 생성·성공 기록 CLI.
- 공용 Vercel action: Production 시작 전 시도 생성, 완료 후 같은 시도에 success 기록.
- CD: toolchain 설정 후 앱별 baseline 조회, 기존 affected 및 설정 변경 판정에 연결.
- 수동 Production: 같은 action과 기록 권한 사용. 실제 checkout HEAD를 기록한다.
- 루트 test에 배포 회귀 테스트를 연결하고 배포 설정 변경 감지 목록에 새 script를 포함한다.
- 상세 상태와 검증 절차는 [data-model.md](data-model.md), [quickstart.md](quickstart.md)를 따른다.

## 적용과 복구

첫 실행은 이력이 없어 앱별 강제 배포한다. 새 환경 설정이나 Secret은 요구하지 않는다.
기록 생성 실패는 Vercel 실행 전 중단, 성공 기록 실패는 미확정 이력으로 남아 다음 실행을 강제한다.
외부 Vercel 콘솔 변경 후에는 GitHub 수동 Production으로 검증된 main을 다시 배포한다.
문제 발생 시 이 변경을 revert하고 기존 수동 Production으로 검증된 main을 배포한다.
과거 push SHA 비교 방식으로 돌아가는 동안 자동 배포 생략에 의존하지 않는다.
실제 Production 배포·권한 확인은 merge 이후 운영 검증이며 이번 작업에서 실행하지 않는다.
