#!/usr/bin/env bash

set -euo pipefail

base_sha="${1:?비교 기준 commit SHA가 필요합니다.}"
head_sha="${2:?비교 대상 commit SHA가 필요합니다.}"

if ! git diff --quiet "$base_sha" "$head_sha" -- apps/mobile packages/app-bridge; then
  exit 0
fi

# 루트 설정에서는 Expo 관련 줄이 바뀐 경우만 모바일 검증 대상으로 봅니다.
if git diff --unified=0 "$base_sha" "$head_sha" -- package.json pnpm-workspace.yaml \
  | grep -Eq '^[+-][^+-].*(expo|catalog:expo)'; then
  exit 0
fi

exit 1
