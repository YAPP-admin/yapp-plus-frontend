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

## 2b — native·RPC 연결

- [x] 사용자 승인으로 `a65210ad`의 두 커밋을 `73f8a0c2` 위에 rebase했다. 결과는 `53471a0d`, `9d7a7f1a`이며 range-diff와 파일 비교에서 기존 변경 보존을 확인했다. 충돌 없이 `DongjaJ/team-photo-native`를 생성했고 push·PR 생성은 하지 않았다.
- [x] Expo SDK 권장 사진 모듈 3개와 한국어 권한 문구를 추가했다. 마이크 권한은 제외했다. 네이티브 변경 규칙에 따라 앱·OTA runtime을 1.0.4로 구분한다.
- [x] 앨범 입력·카메라 권한·JPEG 0.9·디코딩 상한 2,560px·용량 확인 후 Base64 읽기·캐시/이미지 참조 정리·RPC 검증을 연결했다. 삭제 대상은 이번 호출이 반환한 앱 캐시 URI뿐이다.
- [x] `node --run test` 통과. bridge 79개·mobile 171개·web 419개는 새 실행, ui/admin은 캐시 재사용이다. 새 테스트 18개는 브리지 연결과 작업 잠금·권한·변환 설정·정리에 집중한다.
- [ ] `node --run check`: 포맷·lint 통과, 웹 typecheck에서 React 19.2/19.3 타입 충돌 9개로 중단. lint는 bridge/mobile/web 새 실행·4개 캐시, typecheck는 bridge/mobile 새 실행 통과·4개 캐시다. `73f8a0c2`의 웹 소스를 별도 디렉터리에 추출해 같은 설치 의존성으로 검사했으며 같은 9개 위치의 TS2322가 재현됐다. 사진 관련 코드의 오류는 없다.
- [x] `node --run build` 3개 작업 모두 새 실행 통과. 이 명령은 웹·관리자·Storybook 빌드이며 iOS 바이너리 빌드가 아니다.
- [x] `node --run expo:doctor` 20/20 통과. `expo config --type introspect`에서 버전 1.0.4·사진/카메라 문구·마이크 권한 제외를 확인했다.
- [x] `expo export --platform ios --output-dir ../../.context/team-photo-ios --no-bytecode` 새 실행 통과. iOS JavaScript 번들 생성만 확인했으며 네이티브 바이너리·실기기 검증은 아니다.
- [ ] development build·실제 iPhone 촬영/HEIC/방향/비확대/메모리·VoiceOver·화면 이탈 검증은 2c에서 수행한다. 이번 단계에는 화면·운영 진입점을 연결하지 않았다.

최초 2b 보고의 base `DongjaJ/team-session-auth-develop` 대비 새 파일 포함 546줄 추가·6줄 삭제(총 552줄)다. 복구 시 사진 RPC 연결과 추가 모듈을 함께 되돌린 새 바이너리를 사용하고 운영 진입 차단을 유지한다. 타입 충돌 해결과 실기기 검증 전 출시 완료로 판단하지 않는다. Modern Web Guidance `security`의 메시지 입력 검증 지침을 RPC 양쪽 경계에 적용했고 전역 보안 정책은 변경하지 않았다.

### 2b 리뷰 — 사진 처리 책임 분리

- `prepare`에서 권한 확인·해독·JPEG 변환을 분리했다. 각 함수가 생성한 이미지 참조를 해제하며 가변 실패 코드와 선택적 자원 변수를 없앴다. 파일 삭제는 전체 결과를 모아 판단해 `cleanupFailed` 누적 변수를 제거했다.
- 모바일 테스트 172개와 모바일 타입 검사는 새 실행 통과. `check`의 포맷·lint 통과(모바일 새 실행·6개 캐시), typecheck는 모바일 새 실행 통과·5개 캐시이며 웹의 기존 타입 충돌로 중단됐다. JPEG 읽기 실패 시 오류 분류·캐시/이미지 정리 회귀 테스트를 추가했다.
- `build`는 3개 작업 모두 캐시 재사용으로 통과했다. 실기기 검증은 여전히 미실행이며 설정·의존성 변경이 없어 Expo Doctor는 다시 실행하지 않았다.

### 2b 리뷰 — 캐시 정리를 최선 노력 방식으로 변경

- 사용자 승인에 따라 삭제 실패는 사진 준비 결과를 바꾸지 않는다. 파일별 예외 처리는 유지하되 boolean 반환·결과 집계·정리 실패 예외를 제거했다. 잠금 변수는 `isPhotoOperationInProgress`로 변경했다. 삭제하지 못한 파일은 앱 캐시에 남을 수 있다.
- 성공 결과 유지·기존 용량 초과 오류 유지 테스트 2개가 수정 전 실패하고 수정 후 통과했다. 모바일 테스트 173개와 모바일 lint·typecheck는 새 실행 통과했다.
- `check`는 포맷·lint 통과(모바일 새 실행·6개 캐시), typecheck에서 기존 웹 React 타입 충돌로 중단됐다(모바일 새 실행 통과·5개 캐시). `build`는 3개 작업 모두 캐시 재사용으로 통과했다. 이번 수정에서는 iOS 번들 생성·실기기·Expo Doctor를 다시 실행하지 않았다.

### 2b 리뷰 — 잠금 수명 위임

- 이미 인증 코드에서 사용하는 `p-mutex`로 잠금 수명을 위임해 수동 boolean·해제용 finally를 없앴다. `isLocked`로 추가 호출을 먼저 거절하므로 사진 선택 요청은 대기열에 쌓이지 않는다. 입력 오류는 INVALID_INPUT, OS 예외·응답 검증 실패는 PROCESSING_FAILED로 유지한다.
- 기존 중복 호출·취소/예외 후 재호출 테스트를 포함해 모바일 173개 테스트와 모바일 lint·typecheck는 새 실행 통과했다. 전체 `check`는 기존 웹 타입 충돌로 중단됐고 나머지 lint 6개·typecheck 5개는 캐시를 재사용했다. `build`는 3개 모두 캐시 재사용으로 통과했다. 네이티브 번들·실기기 검증은 이번 수정에서 다시 수행하지 않았다.

### 2b 최종 리뷰 — main 동기화와 실행 제어 확정

- `origin/main`의 React 19.3.0 통일 수정(`00ce0a75` 기준) 위로 커밋 3개를 rebase했다. 미커밋 사진 구현을 보존했고 frozen lockfile 설치가 통과했다. 기존 웹 타입 충돌은 해결됐다.
- 설계 결정대로 `p-mutex` 대신 지역 boolean과 `try/finally`로 실행 수명을 관리한다. 기존 중복 호출·취소/실패 뒤 재호출 테스트로 정책을 확인하며 라이브러리 기본 동작 테스트는 추가하지 않았다.
- 최종 `check` 통과: 모바일 lint·typecheck·테스트(185개)는 새 실행, 나머지 lint·typecheck 각 6개와 테스트 4개는 캐시 재사용. 직전 rebase 검증에서는 브리지·웹 검사도 새 실행으로 통과했다.
- 최종 `build`는 3개 모두 캐시 재사용으로 통과했다. 직전 rebase 검증에서 웹 빌드는 새 실행, Expo Doctor는 20/20 통과했다. 실기기·development build 검증은 아직 수행하지 않았다.
- 2b 검토 기준은 rebase된 2a 커밋 `69cafa0c`다. 650줄을 넘겨 후속 2c는 별도 브랜치·PR로 분리한다. 기존 2a 브랜치 정렬과 push·PR은 수행하지 않았다.
