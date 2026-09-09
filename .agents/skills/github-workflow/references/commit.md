# Commit 지침

## 준비

1. `git status`, `git diff`와 필요하면 `git diff --staged`로 변경 범위를 확인합니다.
2. 사용자가 만든 변경과 현재 issue에 속하지 않는 변경을 제외합니다.
3. 저장소 지침에 맞는 검증을 실행하고 성공·실패·미실행 결과를 기록합니다.
4. 민감 정보, 디버그 출력, 임시 파일과 생성 산출물의 의도하지 않은 변경이 없는지 확인합니다.

## 메시지

`<type>(<scope>): <subject>` 형식의 Conventional Commits를 사용합니다. `type`과 `scope`는
영문을 유지하고 subject와 body는 한국어로 작성합니다. `scope`는 변경 범위를 명확히 할 때만
사용합니다. 하나의 commit에는 독립적으로 이해하고 검증할 수 있는 한 가지 목적만 포함합니다.

실행 전에 staging 대상, 검증 결과와 commit 메시지를 사용자에게 보여주고 승인을 요청합니다.

## 실행

- 사용자가 commit을 명시적으로 승인한 뒤에만 staging과 commit을 수행합니다.
- 승인받지 않은 파일은 stage하지 않습니다.
- Git hook이 실패하면 원인을 수정하고 새 승인을 받은 뒤 다시 commit합니다. `--no-verify`로
  우회하거나 실패한 commit을 amend하지 않습니다.
- 기존 commit의 amend, rebase, squash 또는 삭제는 사용자가 해당 변경을 별도로 승인해야 합니다.
- commit 승인에는 push 승인이 포함되지 않습니다.
- 완료 후 `git status`와 생성된 commit을 다시 확인하고 SHA, 메시지와 포함된 파일을 보고합니다.
