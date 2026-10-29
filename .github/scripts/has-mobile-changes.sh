#!/usr/bin/env bash

set -euo pipefail

base_sha="${1:?비교 기준 commit SHA가 필요합니다.}"
head_sha="${2:?비교 대상 commit SHA가 필요합니다.}"

# catalog의 내부 값과 전이 의존성은 변경 줄의 문자열만으로 분류할 수 없습니다.
# 잘못된 비교 범위도 영향 없음으로 숨기지 않고 모바일 검사를 실행합니다.
if ! git diff --quiet "$base_sha" "$head_sha" -- \
  apps/mobile packages/app-bridge package.json pnpm-workspace.yaml pnpm-lock.yaml; then
  exit 0
fi

exit 1
