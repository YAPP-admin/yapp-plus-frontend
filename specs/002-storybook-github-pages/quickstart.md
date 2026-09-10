# Quickstart: Storybook GitHub Pages 자동 배포

## 사전 조건

1. 저장소 Settings → Pages → Source를 **GitHub Actions**로 설정합니다.
2. Pages deployment 대상 environment로 `github-pages`를 사용하도록 허용합니다.
3. `main`에 반영된 workflow가 GitHub Actions를 실행할 수 있어야 합니다.

외부 Secret은 필요하지 않습니다. Pages Action은 GitHub Actions 기본 토큰과 OIDC 권한을 사용합니다.

## 로컬 정적 빌드 확인

저장소 루트에서 실행합니다.

```sh
pnpm install --frozen-lockfile
pnpm --filter @yapp-plus/storybook build
test -s apps/storybook/storybook-static/index.html
```

기대 결과: `apps/storybook/storybook-static/index.html`과 asset 디렉터리가 생성됩니다.

## 자동 배포 확인

1. `apps/storybook/stories/button.stories.tsx` 또는 `packages/ui`의 파일을 변경합니다.
2. 변경을 `main`에 반영합니다.
3. `Deploy Storybook` workflow가 실행되는지 확인합니다.
4. build job에서 Storybook 정적 출력과 artifact upload가 성공하는지 확인합니다.
5. deploy job의 `github-pages` environment URL을 열어 Storybook manager를 확인합니다.
6. `UI/버튼` story를 열고 iframe 및 addon asset 요청이 404가 아닌지 확인합니다.

## 무관한 변경 생략 확인

README 또는 제품 앱 파일만 변경해 `main`에 반영합니다. `Deploy Storybook` workflow가 시작되지 않아야 합니다.

## 수동 재배포 확인

1. GitHub Actions에서 `Deploy Storybook`을 선택합니다.
2. `Run workflow`를 실행합니다.
3. 코드 변경 없이 build → artifact upload → Pages deploy 순서가 완료되는지 확인합니다.

## 실패 시 확인

- Storybook build가 실패하면 `storybook-static/index.html` 생성 여부와 build log를 확인합니다.
- Pages deployment 권한 오류가 발생하면 workflow의 `pages: write`, `id-token: write`와 Pages source 설정을 확인합니다.
- project site에서 asset이 404이면 배포된 URL이 repository project site의 루트에서 열렸는지와 Storybook 산출물의 상대 asset 경로를 확인합니다.
