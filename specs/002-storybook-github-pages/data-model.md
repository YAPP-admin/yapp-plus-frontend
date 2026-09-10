# Data Model: Storybook GitHub Pages 자동 배포

## Storybook 정적 산출물

- **의미**: Storybook manager, iframe, stories, addon과 정적 asset을 포함한 배포 대상 파일 묶음
- **생성 위치**: `apps/storybook/storybook-static`
- **검증 규칙**: `index.html`과 Storybook asset이 존재하고 비어 있지 않아야 함

## Pages artifact

- **의미**: GitHub Pages deployment job으로 전달되는 단일 압축 artifact
- **입력**: Storybook 정적 산출물 디렉터리
- **수명**: 하나의 workflow 실행에 종속되며 별도 저장소 데이터로 취급하지 않음

## Pages 배포 실행

- **의미**: 특정 `main` commit의 artifact를 GitHub Pages에 게시한 실행
- **식별 정보**: commit SHA, workflow run, Pages URL, 성공 또는 실패 상태
- **환경**: `github-pages`
- **상태 전이**: `build 성공` → `artifact 업로드` → `Pages 배포` → `URL 확인`
