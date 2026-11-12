# 검증 기록

## 1단계 — 명세·계약

- [x] `git fetch origin` 후 HEAD `f8a554ef`, origin/main `73f8a0c2`, 7커밋 차이, 깨끗한 작업 트리를 확인했다.
- [x] 팀 사진·팀 인증 열린 이슈를 검색했다. #385는 팀 사진 제외이며 [#428](https://github.com/YAPP-admin/yapp-plus-frontend/issues/428)을 생성·확인했다.
- [x] spec·plan·research·data model·contract·quickstart·tasks를 작성했다. 링크·template placeholder·작업 ID를 검사했다.
- [x] `setup-plan.sh --json`, `setup-tasks.sh --json`으로 Spec Kit이 이 디렉터리와 design 문서를 인식하는 것을 확인했다.
- [x] `git diff --check`를 실행했다.
- [x] 의존성 설치 후 `mise exec -- node --run check` 통과. 포맷 검사는 새 실행, lint 7개·typecheck 7개·test 5개 작업은 모두 Turbo 캐시 재사용이다.
- [ ] build·expo:doctor·실기기·접근성은 제품 변경 전이라 실행하지 않았다.

사용자의 “커밋하고 다음작업 진행해”로 1단계 리뷰와 2단계 진행을 확인했다. origin/main의 merge-base 대비 문서 9개, 267줄 추가·0줄 삭제다. 이전 보고의 534줄은 합계 중복 집계로 정정한다. 이 단계는 제품 코드·의존성·빌드 산출물을 변경하지 않았다.

## 2a — 공용 사진 계약

- [x] Spec Kit 전제조건과 명세 체크리스트 12개를 확인했다. extension hook 설정은 없다.
- [x] JPEG 전송 스키마·타입·상수와 공개 export를 추가했다. 인코딩·크기·메타데이터 검증은 이미지 디코딩 가능성 검사와 구분한다.
- [x] 리뷰 후 사진 계약 테스트를 44개에서 14개로 줄였다. Zod의 enum·타입·Base64 구문 동작을 반복하는 사례는 제거했다. 제품 용량·치수 경계, 자체 바이트 길이·패딩 비트 검사, 권한 안내 필수 정보와 민감 필드 노출 방지 계약은 유지했다. 제한값은 구현 상수를 참조하지 않고 명세 값으로 검증한다.
- [x] 설치된 Zod 4.5.4의 `z.base64()`로 구문 검증을 대체했다. 길이 제한을 먼저 적용하고 내장 검사에서 허용하는 비표준 패딩 비트와 sizeBytes 일치만 별도로 검사한다. Zod는 내부적으로 `atob`을 사용하므로 native 메모리 검증은 후속 단계에서 수행한다.
- [x] `mise exec -- node --run check` 통과. 포맷 검사는 새 실행, lint·typecheck는 각각 bridge/mobile/web 3개 새 실행·나머지 4개 캐시다. test는 bridge 75개·mobile 157개·web 418개 새 실행, ui/admin 2개 작업은 캐시다.
- [ ] build·expo:doctor·실기기는 미실행이다. 앱 코드·설정·의존성을 아직 변경하지 않았으며 실제 선택·촬영·변환·RPC·화면 연결도 미구현이다.

origin/main의 merge-base 대비 작업 트리와 새 파일을 포함해 463줄 추가·0줄 삭제다. 사용자의 “커밋하고 다음 진행해”로 2a 리뷰와 2b 진행을 확인했다. 후속 단계에서 실제 JPEG 변환과 원본 비확대·캐시 정리·WebView 전달·화면 수명을 검증해야 한다. 현재 계약만으로 사진 제출 기능이 동작하지는 않는다.
