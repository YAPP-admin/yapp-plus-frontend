# Rebase와 충돌 해결

## 진단과 시작

- 원인 질문에는 먼저 `git status`, 진행 중인 rebase 상태, 최근 이력과 실제 오류를 확인합니다.
  진단을 위해 현재 브랜치에서 rebase를 실행하지 않습니다. 충돌 예측과 실제 실패 로그는 구분합니다.
- 실행을 승인받으면 `git fetch origin` 후 대상 base와 작업 트리를 확인합니다. 미커밋 변경이 있으면
  임의로 stash하거나 삭제하지 않고 보존 방법을 확인합니다. 이미 진행 중인 rebase가 있으면
  대상과 멈춘 커밋부터 확인하며 새 rebase를 시작하지 않습니다.
- 시작 HEAD, base SHA, 현재 브랜치, upstream 원격 브랜치와 원격 SHA를 `.context/`에 기록합니다.
  브랜치 이름을 바꾸지 않습니다. 중단 시 진행 중인 rebase는 `git rebase --abort`로 시작 상태로
  돌아갈 수 있지만, 완료 후 복구를 위해 `reset --hard`를 자동 실행하지 않습니다.
- 재적용 대상의 merge 커밋은 `git show --remerge-diff <merge SHA>`로 확인합니다. 일반 rebase는
  merge 커밋을 그대로 재적용하지 않으므로 충돌 해결뿐 아니라 그때 추가한 문서·수정도 빠질 수
  있습니다. 해당 변경의 보존 위치를 정하고, 요청 범위를 넘는 amend나 새 commit은 확인받습니다.

## 충돌 해결

- 승인된 base로 rebase하고, 멈춘 커밋마다 변경 의도를 비교해 해결합니다. `ours`·`theirs`를
  브랜치 이름으로 단정하지 않습니다. rebase에서는 `ours`가 base와 이미 재적용한 결과이고
  `theirs`가 지금 재적용하는 커밋입니다. 파일 전체를 한쪽으로 선택해 반대쪽 변경을 버리지 않습니다.
- 해결한 파일만 stage한 뒤 `git rebase --continue`로 진행합니다. 충돌이 있다는 이유만으로
  `--skip`하지 않습니다. 생성 코드 충돌은 원본 명세·설정을 해결한 뒤 해당 도구로 생성합니다.

### pnpm lockfile

1. `package.json`들과 `pnpm-workspace.yaml`을 먼저 합칩니다. main의 catalog 전환과 브랜치의
   의존성 추가를 함께 보존하되 지금 재적용 중인 커밋에 없는 후속 변경을 미리 넣지 않습니다.
2. 충돌 마커가 남은 lockfile로 설치하지 않습니다. pnpm이 이를 무시하고 의존성을 새로 해석할 수
   있습니다. 현재 단계에 맞는 정상 lockfile을 기준으로 선택하고 다른 쪽의 의도적인 버전 변경도
   확인합니다. lockfile을 삭제하거나 무조건 한쪽 최종본으로 덮어쓰지 않습니다.
3. `mise.toml`과 `package.json`에 고정된 Node.js·pnpm으로 `pnpm install --lockfile-only`를
   실행합니다. 정상 기준 파일 대비 diff에서 요청하지 않은 버전·integrity 변경, importer 누락,
   peer dependency 해석 변경을 확인합니다. 공급망 보호 설정은 유지합니다.
4. rebase 완료 후 `pnpm install --frozen-lockfile`로 manifest와 lockfile의 일치를 확인합니다.

## 완료 검증과 보고

- 시작 HEAD와 완료 HEAD의 diff를 확인해 새 base의 변경과 충돌 해결에 필요한 차이만 남았는지
  검토합니다. merge에서만 추가했던 내용도 확인합니다. `git range-diff`는 커밋 대응 확인을
  보조할 수 있지만 최종 파일 비교를 대신하지 않습니다.
- `node --run check`를 실행하고 앱·빌드 설정이 영향을 받으면 `node --run build`도 실행합니다.
  모바일 설정·의존성이 바뀌면 `node --run expo:doctor`를 실행합니다. 캐시 재사용과 새 실행은
  구분해 보고하고, 실제 재실행이 필요한 검사만 캐시 없이 확인합니다.
- `git status`와 `git ls-files --unmerged`로 미해결 충돌과 남은 변경을 확인합니다. rebase 상태가
  종료됐고 대상 base가 HEAD의 조상인지 확인합니다. 시작·완료 SHA, 보존한 변경, 검증 결과와
  원격 반영 여부를 보고합니다. push는 [PR 지침](pull-request.md)의 별도 승인 절차를 따릅니다.
