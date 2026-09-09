# PR Ready 및 Merge 지침

## 상태 확인

merge를 준비할 때 다음 항목을 읽기 전용으로 확인해 사용자에게 보고합니다.

- PR이 Draft인지 여부
- base와 head 브랜치
- merge 가능 여부와 conflict
- 필수 및 선택 CI 결과
- 미해결 리뷰와 요청된 변경
- 연결된 issue와 closing keyword
- merge 후 브랜치 삭제 여부

## Ready 전환

Draft PR을 ready 상태로 전환하는 것은 별도 외부 변경입니다. CI가 통과했거나 구현이 끝났다는 사실만
으로 자동 전환하지 않고 사용자의 명시적인 승인을 받습니다.

## Merge

- CI가 실패하거나 pending이고 사용자가 조건부 승인을 하지 않았다면 merge하지 않습니다.
- conflict 또는 미해결 변경 요청이 있으면 merge하지 않습니다.
- 대상 PR, rebase merge 방식과 브랜치 삭제 여부를 보여주고 merge 승인을 요청합니다.
- 이 저장소는 rebase merge를 사용합니다. 다른 방식을 사용하려면 사용자가 명시해야 합니다.
- `merge해`라는 승인은 브랜치 삭제를 포함하지 않습니다. 삭제가 필요하면 함께 승인받습니다.
- merge 명령이 일부 성공한 뒤 로컬 정리에서 실패하면 재실행하지 말고 PR과 원격 브랜치 상태를
  다시 조회해 이미 적용된 변경을 먼저 확인합니다.
- 완료 후 PR URL, merge 결과 commit SHA, issue 종료 여부와 브랜치 상태를 보고합니다.
