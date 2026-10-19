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

1. 실제 PR base와 연결된 issue를 확인합니다. 기본 base는 `origin/main`이며, 종속 PR은 직전
   PR의 브랜치를 base로 삼아 아래 크기 기준으로 diff를 확인합니다.
2. `.github/pull_request_template.md`를 매번 읽고 제목과 섹션 순서를 유지합니다.
3. `무엇을 변경했나요?`, `왜 변경했나요?`, `어떻게 확인했나요?`, 영향 범위와 확인 사항을 실제
   변경 및 검증 결과로 채웁니다.
4. 확인하지 않은 체크박스는 체크하지 않습니다. 해당 없는 항목은 근거 없이 통과로 표시하지
   않습니다.
5. `왜 변경했나요?`에 `Closes #<issue-number>`를 사용해 선행 issue를 연결합니다.
6. PR 제목은 `<type>(<scope>): <subject>` 형식으로 작성하고, 제목과 본문의 설명은 한국어로
   작성합니다.

사용자에게 제목, 본문, base/head 브랜치를 보여주고 PR 생성 승인을 요청합니다.

## PR 크기와 분리

- PR마다 실제 base 대비 추가 줄 수와 삭제 줄 수의 합계를 800줄 미만으로 유지합니다.
  문서·테스트·스타일·생성 파일·lockfile을 포함하며 파일 종류에 따른 예외는 두지 않습니다.
- commit된 변경은 `git diff --numstat <base>...HEAD`로 확인합니다. commit 전에는
  `git merge-base <base> HEAD`로 기준 SHA를 구한 뒤 `git diff --numstat <기준-SHA>`로
  작업 트리까지 포함해 확인합니다. untracked 파일은 diff에 포함되지 않으므로 별도로 확인하여
  추가 줄 수에 합산합니다. 줄 수가 숫자로 표시되지 않는 파일은 자동으로 0줄 처리하지 않고
  별도로 보고합니다.
- 단계 리뷰와 PR 생성·갱신 전에는 base, 추가 줄 수, 삭제 줄 수와 합계를 보고합니다.
  base가 바뀌면 merge-base와 변경량을 다시 확인합니다.
- 합계 650줄부터 독립적인 검토 목적별 분리를 검토하고, 800줄 이상이면 PR을 분리합니다.
  데이터 기반·UI·동작 연결처럼 이해하고 검증할 수 있는 경계를 사용하며 필요한 테스트도 해당
  변경에 포함합니다. 줄 수를 맞추려고 테스트를 빼거나 생성 파일을 직접 쪼개지 않습니다.
- commit도 목적별로 나누되 같은 PR 안의 commit 분리는 PR 전체 크기를 줄이지 않습니다.
  PR 제한을 넘으면 commit 분리만으로 완료 처리하지 않습니다.
- 서로 독립적인 PR은 각각 `main`을 base로, 종속 PR은 직전 PR을 base로 계획합니다.
  아래 PR 병합 후 남은 PR의 base와 diff를 재확인합니다. 실제 브랜치·commit·push·PR 작업은
  기존 승인 범위를 따릅니다.
- 최소한의 의존성 변경처럼 분리해도 제한을 지키기 어려우면 파일별 변경량·원인·분리 가능성을
  사용자에게 보고하고 진행을 멈춥니다. 계산에서 파일을 임의로 제외하거나 제한을 초과하지 않습니다.

## Draft PR 생성

- 사용자가 PR 작성을 명시적으로 요청해도 항상 Draft PR로 생성합니다.
- PR 본문은 임시 Markdown 파일로 작성하고 `gh pr create --draft --body-file <path>`와 동등한
  방식으로 생성합니다. 자동으로 ready 상태로 바꾸지 않습니다.
- branch가 push되지 않았다면 push 승인을 먼저 받아야 하며, PR 승인으로 이를 대신하지 않습니다.
- 생성 또는 수정 후 `gh pr view`로 제목, 본문, base, head, Draft 상태와 URL을 확인해 보고합니다.
- PR 제목·본문·라벨·assignee 변경, 댓글 작성과 종료도 실행 전에 승인받습니다.
