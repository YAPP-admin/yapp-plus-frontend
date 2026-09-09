# Push 및 Pull Request 지침

## 명령 선택

- 루트 `package.json`의 script는 `node --run <script>`로 실행합니다. 예: `node --run check`,
  `node --run build`, `node --run expo:doctor`.
- 의존성 설치·변경, `pnpm --filter`, `pnpm exec`와 package manager 동작이 필요한 작업은 `pnpm`을
  사용합니다.
- `node --run`은 `pre*`와 `post*` script를 자동으로 실행하지 않습니다. lifecycle script에
  의존하는 작업은 `pnpm run`을 사용하고 그 이유를 보고합니다.

## Push

- `git fetch origin` 후 작업 트리와 upstream의 ahead/behind 상태를 확인합니다.
- upstream이 없으면 원격에 같은 브랜치가 없는지 확인한 뒤 최초 push에서 `-u`를 사용할 수
  있습니다.
- 로컬 브랜치가 upstream보다 뒤처졌고 fast-forward만 필요하면 대상 commit을 보여주고 별도 승인을
  받은 뒤 `git pull --ff-only`를 실행합니다. bare `git pull`은 사용하지 않습니다.
- 로컬과 upstream이 갈라졌거나 충돌 가능성이 있으면 pull이나 push를 실행하지 않고 보고합니다.
- `origin/main`이 변경되어 현재 브랜치에 반영해야 하면 자동으로 merge하거나 rebase하지 않습니다.
  차이를 보고하고 이력 변경을 별도로 승인받습니다.
- 저장소 지침에 따라 `node --run check`를 실행하고, 배포 가능한 앱이나 빌드 설정 변경에는
  `node --run build`, 모바일 설정이나 의존성 변경에는 `node --run expo:doctor`도 실행합니다.
- push 전에 현재 브랜치, 대상 remote, 전송할 commit과 검증 결과를 보여주고 승인을 요청합니다.
- 사용자가 push를 명시적으로 승인한 경우에만 실행합니다.
- `main`에 직접 push하지 않습니다. force push는 사용자가 대상과 이유를 명시적으로 승인한 경우에만
  수행합니다.
- commit 승인은 push 승인을 포함하지 않고, PR 생성 승인도 선행 push 승인을 포함하지 않습니다.
- push 후 upstream, 원격 commit SHA와 현재 브랜치 상태를 다시 확인합니다.

## PR 초안

1. `origin/main...HEAD` diff와 연결된 issue를 확인합니다.
2. `.github/pull_request_template.md`를 매번 읽고 제목과 섹션 순서를 유지합니다.
3. `무엇을 변경했나요?`, `왜 변경했나요?`, `어떻게 확인했나요?`, 영향 범위와 확인 사항을 실제
   변경 및 검증 결과로 채웁니다.
4. 확인하지 않은 체크박스는 체크하지 않습니다. 해당 없는 항목은 근거 없이 통과로 표시하지
   않습니다.
5. `왜 변경했나요?`에 `Closes #<issue-number>`를 사용해 선행 issue를 연결합니다.
6. PR 제목은 `<type>(<scope>): <subject>` 형식으로 작성하고, 제목과 본문의 설명은 한국어로
   작성합니다.

사용자에게 제목, 본문, base/head 브랜치를 보여주고 PR 생성 승인을 요청합니다.

## Draft PR 생성

- 사용자가 PR 작성을 명시적으로 요청해도 항상 Draft PR로 생성합니다.
- PR 본문은 임시 Markdown 파일로 작성하고 `gh pr create --draft --body-file <path>`와 동등한
  방식으로 생성합니다. 자동으로 ready 상태로 바꾸지 않습니다.
- branch가 push되지 않았다면 push 승인을 먼저 받아야 하며, PR 승인으로 이를 대신하지 않습니다.
- 생성 또는 수정 후 `gh pr view`로 제목, 본문, base, head, Draft 상태와 URL을 확인해 보고합니다.
- PR 제목·본문·라벨·assignee 변경, 댓글 작성과 종료도 실행 전에 승인받습니다.
