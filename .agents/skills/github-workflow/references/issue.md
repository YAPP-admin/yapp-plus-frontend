# Issue 지침

## 기존 issue 확인

제목의 핵심 용어, 영향받는 앱과 관련 라벨로 열린 issue를 먼저 검색합니다. 사용자에게 연결할
issue가 지정되어 있으면 상태와 내용이 현재 작업과 일치하는지 확인합니다. 동일한 목적의 issue를
중복 생성하지 않습니다.

## 초안 작성

- 버그는 `.github/ISSUE_TEMPLATE/bug_report.md`를 읽고 같은 섹션 구조를 사용합니다.
- 기능, 개선, 문서와 설정 작업은 `.github/ISSUE_TEMPLATE/feature-request.md`를 읽고 같은 섹션
  구조를 사용합니다.
- 제목은 템플릿의 `bug:` 또는 `feature:` 접두사를 유지하고 한 가지 결과를 표현합니다.
- 제목과 본문은 한국어로 작성하고 패키지명, API 식별자, 명령어와 파일 경로는 원래 표기를
  유지합니다.
- 확인하지 않은 재현 환경, 완료 조건, 디자인 또는 API 정보를 만들어내지 않습니다.
- 작업 내용은 구현 단위가 아니라 검증 가능한 결과 중심의 체크리스트로 작성합니다.
- 담당자가 필요하면 `DongjaJ`를 제안하되, 라벨과 milestone은 근거가 있을 때만 추가합니다.

제목, 본문, assignee와 추가하려는 metadata를 사용자에게 보여주고 issue 생성 승인을 요청합니다.

## 생성과 변경

- 사용자가 issue 생성을 명시적으로 승인한 뒤에만 생성합니다.
- 본문은 임시 Markdown 파일로 작성하고 `gh issue create --body-file <path>`로 전달합니다. 저장소
  템플릿의 YAML frontmatter는 본문에 포함하지 않습니다.
- 생성 후 issue 번호와 URL을 보고하고 이후 작업 및 PR에서 같은 번호를 사용합니다.
- 생성 또는 수정 후 `gh issue view`로 제목, 본문, 상태, 담당자와 URL을 확인합니다.
- issue 본문 수정, 종료, 재개도 각각 외부 변경이므로 실행 전에 승인받습니다.
- 작업이 완료되어도 merge 승인만으로 issue를 직접 종료하지 않습니다. PR의 closing keyword가
  merge 시 처리하도록 둡니다.
