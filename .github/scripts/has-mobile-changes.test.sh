#!/usr/bin/env bash

set -euo pipefail

script="$(cd "$(dirname "$0")" && pwd)/has-mobile-changes.sh"
fixture="$(mktemp -d)"
trap 'rm -rf "$fixture"' EXIT
# hook에서 실행해도 현재 workspace의 Git 메타데이터를 사용하지 않습니다.
while IFS= read -r name; do unset "$name"; done < <(git rev-parse --local-env-vars)
cd "$fixture"
git init -q
git -c user.name=Test -c user.email=test@example.invalid commit --allow-empty -qm initial
base="$(git rev-parse HEAD)"

expect_changed() {
  local path="$1"
  mkdir -p "$(dirname "$path")"
  printf 'changed\n' >> "$path"
  git add "$path"
  git -c user.name=Test -c user.email=test@example.invalid commit -qm fixture
  bash "$script" "$base" HEAD
}

for path in apps/mobile/app.config.ts packages/app-bridge/src/web.ts \
  package.json pnpm-workspace.yaml pnpm-lock.yaml; do
  expect_changed "$path"
  base="$(git rev-parse HEAD)"
done

# expo 문자열이 없는 catalog 버전 변경도 감지합니다.
printf 'catalogs:\n  expo:\n    react: 19.3.0\n' > pnpm-workspace.yaml
git add pnpm-workspace.yaml
git -c user.name=Test -c user.email=test@example.invalid commit -qm catalog
base="$(git rev-parse HEAD)"
printf 'catalogs:\n  expo:\n    react: 19.3.1\n' > pnpm-workspace.yaml
git add pnpm-workspace.yaml
git -c user.name=Test -c user.email=test@example.invalid commit -qm version
bash "$script" "$base" HEAD
base="$(git rev-parse HEAD)"
printf '문서만 변경\n' > README.md
git add README.md
git -c user.name=Test -c user.email=test@example.invalid commit -qm docs
if bash "$script" "$base" HEAD; then
  echo '문서만 변경했는데 모바일 변경으로 감지했습니다.' >&2
  exit 1
fi
bash "$script" "$(printf '%040d' 0)" HEAD 2>/dev/null
printf '모바일 변경 감지 회귀 검증 통과\n'
