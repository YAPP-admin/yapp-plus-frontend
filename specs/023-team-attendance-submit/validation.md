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

### 2c — 개발 사진 입력·미리보기 구현

- `DongjaJ/team-photo-preview`는 사용자 승인으로 2b `45726d9d`에서 생성했다. push·PR·추가 commit은 수행하지 않았다.
- native 앨범·촬영 RPC와 브라우저 JPEG·PNG 변환을 연결했다. 미리보기는 전체 비율을 표시하고, 교체·이탈·계정 변경 시 Blob URL을 해제한다. 취소·실패는 이전 사진을 유지하며 늦은 응답은 폐기한다.
- 진행 상태는 `useMutation`으로 관리한다. 사진·원본 파일·Base64를 mutation variables/data에 넣지 않고 화면 상태로만 보관하며 재시도·오프라인 대기를 사용하지 않는다. 원문 예외를 사용자 안내로 정규화한다.
- 업로드 Activity 직접 진입은 `DEV && VITE_API_MOCKING === 'true'`에만 허용한다. 완료·오류로 이동하던 임시 제출을 제거하고 제출 버튼을 비활성화했다. 나머지 Activity 운영 차단과 제출 통합은 4단계에 남아 있다.
- 화면 테스트는 URL 해제·취소·권한 안내·준비 중 입력 차단·이탈 후 늦은 응답·계정 변경·파일 재선택을 확인한다. 변환 테스트는 JPEG 품질·축소/비확대·최종 용량·해독 실패를 검증하고 라이브러리 내부 기능을 반복하지 않는다.
- Chrome에서 초기 개발 화면·안내·비활성 제출 표시를 확인했다. 브라우저 도구의 `timeoutMs` 오류와 대상 창 불안정으로 실제 파일 선택·모바일 크기·다크 모드·터치·VoiceOver 검증과 유효한 스크린샷 저장은 완료하지 못했다.
- development build 생성과 실제 iPhone 촬영·HEIC·방향·메모리 검증은 미실행이다. 따라서 T011과 2c 실기기 완료 판정은 보류한다. 모바일 설정·의존성 변경이 없어 Expo Doctor는 이번 단계에서 재실행하지 않았다.
- 복구는 2c 화면·모델 변경을 되돌리되 업로드 Activity의 개발 전용 진입 조건과 제출 비활성화를 유지한다. 운영 데이터·API 변경은 없다.
- Modern Web Guidance `accessibility`의 “Announce dynamic errors via live regions”에 따라 오류·완료 안내에 `output`, 진행에는 `progress`를 사용하고 사진 입력 버튼에 키보드 기본 동작과 설명을 유지했다.
- 최종 `check` 통과: 웹 lint·typecheck·테스트 428개 새 실행, 나머지 lint·typecheck 각 6개 및 테스트 4개는 Turbo 캐시 재사용. `build`는 웹 새 실행·admin/Storybook 캐시 재사용으로 통과했다.

### 2c 리뷰 — SEED 파일 입력 적용

- 브라우저 파일 입력을 설치된 SEED `AttachmentInput.Root`·`HiddenInput`·`Trigger`로 교체했다. 직접 input ref·click·value 초기화와 숨김 스타일을 제거했다. 새 의존성·공용 스니펫은 추가하지 않았다.
- `acceptedFileEntries`를 빈 목록으로 제어해 원본 파일을 중복 보관하지 않고, 단일 사진 선택 뒤에도 교체를 허용한다. 크기 상한은 원본이 아닌 최종 JPEG에 계속 적용한다. native 선택·촬영은 기존 RPC를 사용한다.
- 같은 브라우저 파일을 재선택해 준비 훅에 다시 전달하는 연결 테스트만 추가했다. SEED 내부 파일 검증·이벤트 구현은 별도로 테스트하지 않는다.
- 리뷰 후 `check` 통과: 웹 lint·typecheck·테스트 429개 새 실행, 나머지 lint·typecheck 각 6개 및 테스트 4개는 캐시 재사용. `build`는 웹 새 실행·나머지 2개 캐시로 통과했다. 브라우저·실기기 검증은 이번 리뷰에서 재실행하지 않았다.

### 2c 리뷰 — SEED 이미지 미리보기 적용

- 직접 작성한 `PhotoPreview`·`img`를 SEED `ImageFrame`으로 교체했다. URL 생성·교체·해제는 사진 준비 훅에 모으고, 기존 `contain` 표시를 유지해 팀원 사진이 잘리지 않게 했다.
- 기존 URL 해제·취소·계정 변경·늦은 응답 테스트를 그대로 사용했다. `check` 통과: 웹 lint·typecheck·테스트 429개 새 실행, 나머지 lint·typecheck 각 6개 및 테스트 4개 캐시 재사용. 빌드는 웹 새 실행·나머지 2개 캐시 통과. 브라우저·실기기는 재검증하지 않았다.

### 2c 리뷰 — 사진 변환을 native로 한정

- 사용자 승인에 따라 `prepareBrowserPhoto`와 변환 테스트 4개, 브라우저 `AttachmentInput`·파일 ref·수락/거부 경로를 제거했다. `preventDocumentDrop` 옵션도 함께 제거됐다.
- 브라우저에는 정적 JPEG 패턴 fixture와 오류 안내 토글만 제공한다. fixture는 실제 사진·개인정보가 없는 640×360 패턴이고, 업로드 초안·mutation·native RPC로 전달되지 않는다. JPEG 생성은 개발 자산 제작 시 한 번만 수행했으며 실행 중 변환 코드는 없다.
- 웹의 `photo-blob.ts`는 검증된 native JPEG Base64를 Blob으로 옮길 뿐 해독·리사이즈·재압축을 하지 않는다. 실제 선택·촬영·변환 검증은 native development build에서 수행한다.
- 브라우저 재선택·형식 오류 테스트는 fixture 화면·오류 안내·브리지 미호출 테스트로 대체했다. 기존 native 미리보기 수명·취소·권한·이탈 테스트는 유지한다.
- 변경 후 `check` 통과: 웹 lint·typecheck·테스트 424개 새 실행, 나머지 lint·typecheck 각 6개 및 테스트 4개는 캐시 재사용. 빌드는 웹 새 실행·나머지 2개 캐시 통과. 브라우저·실기기 검증은 이번 변경에서 재실행하지 않았다.

### 2c 리뷰 — 화면 컨텍스트와 사진 선택 버튼

- `useScreenActiveContext`로 페이지의 컨텍스트 접근을 감쌌고 사진 선택 버튼을 공용 `ActionButton`으로 교체했다. `useId`는 화면별 안내 문구 연결을 위해 유지한다.
- unmount 후 늦은 native 응답으로 해제되지 않는 Blob URL을 생성하지 않도록 mounted 검사를 유지하며, Blob 변환 전부터 반환한다. 해당 수명 정책과 접근성 연결 이유를 코드 주석으로 기록했다.
- `check` 통과: 웹 lint·typecheck·테스트 424개 새 실행, 나머지 lint·typecheck 각 6개 및 테스트 4개 캐시 재사용. 빌드는 웹 새 실행·나머지 2개 캐시 통과. 브라우저·실기기 검증은 미실행이다.

### 3단계 — 제출 로직과 리뷰 반영

- `DongjaJ/team-photo-submit`을 사용자 승인으로 `6760f635`에서 생성했다. 검토 base는 `DongjaJ/team-photo-preview`이며 사용자 리뷰 후 3단계 커밋을 진행한다. push·PR은 수행하지 않는다.
- 공급 대상과 폼 입력은 Zod·TanStack Form으로 검증한다. 사진은 Zod 내장 MIME·크기 검증을 사용하고, 본인 포함·명단 부분집합·중복 정책은 프로젝트 테스트로 확인한다. native 사진은 재변환하지 않고 SHA-256 Base64를 presign에 전달한다.
- 사용자 요청에 따라 스냅샷 복사, 서명 응답의 주소·만료·헤더 검증과 요청 옵션 헬퍼를 제거했다. 오류 메시지는 `TEAM_PHOTO_ERROR_MESSAGE_BY_HTTP_STATUS`로 명명했다.
- 생성 `presignMutation`·`submitMutation` options와 PUT mutation을 `mutateAsync`로 연결한다. 생성 options가 HTTP 상태를 반환하지 않아 최종 201·확정 4xx 판정은 응답 훅에 두며 인증 Provider의 기존 훅을 보존한다.
- PUT은 인증 설정을 전달하지 않는 `ky.put`을 사용한다. `timeout: 30_000`, `retry: 0`, credentials·redirect·referrer 정책과 화면 이탈 signal을 유지한다. 프론트엔드 가이드에도 생성 SDK 밖의 직접 작성 요청은 ky를 사용하도록 기록했다.
- pending은 세 mutation의 `isPending`을 합산한다. `completionRef`와 폼 `isSubmitting` 구독을 제거했다. 체크섬 계산 중·연속 클릭의 중복 실행과 성공·결과 불명 뒤 재전송은 `controllerRef`로 차단한다.
- 사진은 PUT mutation 변수·결과에 넣지 않고 ref에서 소비한다. 완료·실패 시 mutation을 reset하고 `gcTime: 0`으로 정리한다. 최종 201/PENDING과 유효한 ID·시각만 접수로 인정하며 응답 유실·5xx·잘못된 성공 응답은 결과 불명으로 처리한다.
- 폼 검증 중 이탈, 늦은 접수 무시, 재제출 정책, 요청 순서·체크섬·인증 분리·30초 timeout을 검증한다. 각 HTTP 단계 응답 대기 중 pending 유지와 완료 후 해제를 추가 검증하며 삭제한 검증·복사 정책은 테스트하지 않는다.
- 계정·대상 변경 시 폼 remount는 호출 화면의 계약이다. 시뮬레이터에서 picker 반환만 대체해 JPEG·PNG·HEIC 변환과 취소·손상 파일·캐시 정리를 확인했다. 실제 선택창·WebView 미리보기·실기기·실서버 제출은 미검증이다. 인증 갱신 timeout으로 화면 진입이 막혔으며 화면 연결은 4단계로 남긴다. 복구는 아직 화면에 연결하지 않은 feature를 제거하면 된다.
- Modern Web Guidance에서 요청 진행 표시를 검색했으나 이번 상태 합산에 적용할 UI 가이드는 없었다. [TanStack Query 공식 문서](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)의 mutation 상태와 순차 실행 방식을 따른다.
- 최종 `check` 통과: 웹 lint·typecheck·456개 테스트(제출 관련 32개) 새 실행, 나머지 lint·typecheck 각 6개와 테스트 4개 캐시 재사용. 빌드는 웹 새 실행·나머지 2개 캐시 통과이며 기존 큰 청크 경고만 남았다.

### 4단계 — 개발 제출 화면 통합

- 사용자 승인으로 `a6e613b6` 위에 `DongjaJ/team-photo-integration`을 만들었다. 검토 base는 `DongjaJ/team-photo-submit`이며 commit·push·PR은 수행하지 않았다.
- 사용자가 iPhone 15 Pro 시뮬레이터의 앨범 선택·미리보기 시나리오 완료를 확인했다. 카메라는 실기기에서 추후 점검하기로 했다. 이 기록을 모의 제출까지의 터치 검증으로 확대하지 않는다.
- 본인만 기본 선택·잠금하고 다른 팀원은 폼으로 선택한다. native Blob은 재인코딩 없이 File로 연결한다. 제출 중 입력 잠금, 확정 실패의 입력 유지·재시도, 결과 불명의 재제출 차단·홈 복귀를 제공한다.
- 접수 응답과 당시 명단을 Stack 범위 메모리에 전달한다. 완료 화면 이탈·계정 변경 시 폐기하고 URL·영구 저장소로 복원하지 않는다. 완료 직접 진입은 404 안내이며 모든 팀 인증 Activity는 개발·모의 환경 외에서 차단한다.
- MSW 정상·PUT 실패·409·최종 응답 유실을 추가했다. 생성 SDK에는 같은 origin의 `/__team-photo-mock` base를 전달하므로 fixture가 실제 API로 나가지 않는다. 브라우저 고정 JPEG의 제출은 계속 차단한다. production 산출물에서 개발 명단·모의 imageKey 문자열이 제거됨을 확인했다.
- 사진 미선택·명단 선택·실패 재시도·pending 잠금·결과 불명은 페이지 테스트에서, 완료 이동·계정 변경·홈 복귀·운영/직접 URL 차단은 Stackflow 연결 테스트에서 검증한다. 기존 제출 훅의 HTTP 실패 조합을 페이지에서 반복하지 않는다.
- Modern Web Guidance `forms`의 의미 있는 form/submit 버튼, 입력 안내 연결, 오류 알림과 미선택 시 사진 버튼 포커스를 적용했다. 기존 SEED Checkbox·ActionButton·ImageFrame을 재사용했다.
- 초기 전체 검사에서 새 브리지 mock이 위치 모듈 export를 가린 실패를 수정했다. 기존 탭 키보드 탐색 테스트는 한 번 URL 타이밍 실패 후 별도 재실행·전체 검사에서 통과했다.
- 실제 앱 재시작 후 인증 복구 화면에 머물러 새 제출 흐름의 터치·VoiceOver·레이아웃 검증은 미완료다. Chrome 도구는 DOM 연결 오류와 검은 캡처를 반환해 화면 근거로 쓰지 않았다. 검증용 native 진입 경로 변경은 원복했고 모바일 제품 코드 변경은 없다.
- 최종 `check` 통과: 웹 lint·typecheck·465개 테스트 새 실행, 나머지 lint·typecheck 각 6개 및 테스트 4개는 Turbo 캐시 재사용. `build`는 웹 새 실행·나머지 2개 캐시로 통과했다. 기존 큰 청크 경고가 남는다. 모바일 설정·의존성 변경이 없어 expo:doctor는 재실행하지 않았다.

### 4단계 리뷰 — 기본 API 주소와 성공 콜백

- 사용자 승인으로 개발 제출의 별도 base URL·props·주소 state를 제거했다. MSW에서는 두 팀 사진 POST만 passthrough하고 그 밖의 미정의 API 차단을 유지한다. 실행 앱의 모의 접수 응답은 제거하고 자동 테스트에서만 사용한다. 실제 사진 전송·서버 이미지 삭제는 실행하지 않았다. 운영 진입 차단과 개발 대상 명단은 유지한다.
- `locked`를 `isPhotoSubmissionFormDisabled`로 변경했다. 사진 준비 성공 콜백에서 File을 폼에 넣고, 제출 훅은 성공 시 직접 onSubmitted를 호출한다. UploadPage의 사진 동기화·접수 감시 effect와 useEffectEvent를 제거했다. 화면 이탈 시 HTTP 취소·URL 해제, 완료 Activity의 이탈 감지 effect는 유지한다.
- 성공 콜백은 네트워크 오류 처리 밖에서 호출하여 화면 이동 오류를 제출 실패로 오인하지 않는다. 한 번만 호출하고 이탈 후 늦은 결과에서는 호출하지 않는 것을 기존 훅 테스트에 추가했다.
- 리뷰 후 `check` 통과: 웹 lint·typecheck·465개 테스트 새 실행, 다른 lint·typecheck 각 6개와 테스트 4개는 캐시 재사용. `build`는 웹 새 실행·다른 2개 캐시 통과. 실제 서버 요청·앱 터치 검증은 실행하지 않았다.

### 4단계 리뷰 — 제출 mutation과 흐름 수명

- 별도 error·receipt state와 try/catch를 상위 제출 mutation의 error·data·isPending 및 onError·호출별 onSuccess로 대체했다. 내부 presign·PUT·submit mutation은 유지한다. 입력 검증과 제출 시작은 onSubmit에서 처리하고 상위 mutation에는 제출 Promise와 AbortSignal만 전달한다. 입력 전달용 ref와 null 검사는 제거했으며 사진 파일은 mutation 변수에 보관하지 않는다. controllerRef는 즉시 중복 제출 차단·화면 이탈 취소와 성공·결과 불명 뒤 재전송 차단에 사용한다.
- TeamPhotoFlowProvider·접수 Context·owner 문자열과 비교를 제거했다. 입력과 완료를 한 Activity의 단계로 묶고 접수 정보는 활성 흐름의 로컬 state에만 둔다. 기존 인증 경계의 key가 계정 변경 시 이를 초기화하고, 이탈 시 흐름을 unmount한다. 완료 Activity의 정리 effect도 제거했다. 기존 업로드·완료 URL은 유지하며 접수 정보 없는 완료 직접 진입은 404다.
- 타입 검사와 관련 68개 테스트가 통과했다. 상위 mutation 대기 상태·사진을 캐시 변수에 넣지 않는 정책을 기존 중복 제출 테스트에 추가했다. 650줄에서 분리를 검토했으며 현재 리뷰의 상태·탐색 변경은 하나의 목적이고 총량은 800줄 미만이라 같은 브랜치에서 유지한다.
- 추가 리뷰에 따라 mutation 내부의 사진 검증을 제거했다. 폼 스키마가 명단·사진을 검증하고 onSubmit에서 사진의 null 타입을 확정한다. mutation은 확정된 입력을 소비해 제출만 실행한다. 사용처가 없어진 내부 세 mutation의 pending 합산과 이를 반복하던 3개 테스트도 제거했다.
- 최종 `check` 통과: 웹 lint·typecheck·462개 테스트 새 실행, 나머지 lint·typecheck 각 6개·테스트 4개 캐시 재사용. `build`는 웹 새 실행·나머지 2개 캐시 통과. 기존 큰 청크 경고만 남으며 실제 서버 전송·앱 터치 검증은 실행하지 않았다.

### 4단계 후속 앱 검증 — 2026-11-16

- iPhone 15 Pro에서 사용자의 로그인 재시도 후 Google 인증 성공, 로그인 API HTTP 200(178ms), 최종 SIGNED_IN과 앱 홈 표시를 확인했다. 이전 로그인 실패 원인은 재현되지 않아 확정하지 않았다. 인증 값 없이 상태만 수집한 임시 런타임 진단은 제거했다.
- Device Hub 화면 캡처는 가능하지만 터치 명령은 noWindowsAvailable로 실패하고 앱 내부 접근성 트리도 제공되지 않았다. 사진 입력·팀원 선택·이탈·VoiceOver의 새 앱 검증은 미완료이며 T020을 유지한다. 실제 사진 제출은 실행하지 않았다. 홈 화면 근거는 로컬 .context/team-photo-logged-in-home.png에 보관했다.

- 후속 사용자 수동 검증: 1번 본인 선택·잠금과 다른 팀원 선택/해제, 2번 앨범 선택·미리보기·교체·취소 시 유지가 통과했다. 3번 실제 제출은 실패했고 4번에는 제출 실패·재시도 안내가 표시됐다. 재시도 성공·완료 화면은 미검증이며, 5번 이탈 후 재진입은 사용자 요청으로 추후 검증한다. 카메라·VoiceOver도 미완료로 유지한다.
- 현재 일반 제출 실패 안내는 체크섬 계산·presign·PUT 단계의 예외를 동일하게 표시하므로 문구만으로 실패 원인이나 서버 접수 여부를 확정하지 않는다. 개발 대상은 sessionId=1 및 고정 회원 명단이며 실제 계정의 제출 권한과 일치하는지는 확인하지 않았다.

### 공통 HTTP 오류 반영 — 2026-11-16

- PR #453 머지 후 `origin/main` `5e6b1637` 위로 사진 작업 10개 커밋을 rebase했다. 기존 통합 HEAD `11090d7d`는 `0b4c9a57`로 바뀌었다. main의 알림 브리지·Firebase·Expo 버전을 보존하고 사진 모듈을 합쳤으며 앱 버전은 1.0.6에서 1.0.7로 올렸다. lockfile은 main 기준으로 다시 계산하고 frozen 설치를 통과했다.
- 보관했던 수동 검증 기록을 복원했다. 사용자 요청에 따라 임시 앱 시작 주소·개발 진단 문구·진단 전용 테스트는 제거했다. 원본 stash는 삭제하지 않았다.
- presign의 임시 응답 훅을 제거하고 최종 제출 실패를 공통 `ApiError.status`로 판정한다. 최종 제출의 알려진 4xx는 확정 실패, 5xx·응답 유실은 결과 불명으로 유지한다. 성공 상태가 201인지 확인하는 훅만 유지하며, PUT은 기존 격리된 ky 요청을 유지한다. 본문·토큰·업로드 URL은 표시하지 않는다.
- 새 사진 모듈 때문에 기존 알림 브리지 테스트가 Expo 런타임을 불러오는 문제를 사진 런타임 mock으로 해결했다. 앱 전역에 __DEV__를 추가하거나 실제 네이티브 동작을 우회하지 않는다.
- 기존 통합 단계는 재작성된 제출 커밋 `961b9514` 대비 738줄이다. 후속 변경을 합치면 800줄을 초과하므로 `DongjaJ/team-photo-api-errors`로 분리했다. 후속 검토 base는 `DongjaJ/team-photo-integration`이며 기존 단계 브랜치들은 아직 이전 이력에 있어 stacked PR 생성 전에 정렬해야 한다. push·PR 생성은 하지 않았다.
- 사용자 요청으로 이번 단계의 실제 앱 제출 재검증은 생략했다. 카메라·VoiceOver 실검증도 수행하지 않았다. 기존 제출 실패 원인은 아직 확정되지 않았으며 T020을 유지한다. 실패 시 후속 오류 처리 변경만 되돌릴 수 있고 원본 작업은 stash와 기존 커밋으로 보존되어 있다.
- 검증: `check` 통과. 웹 499개·모바일 284개 테스트 새 실행, 브리지 96개는 이번 rebase 검증에서 실행 후 최종 검사에서 캐시 재사용, 관리자 659개·UI 10개는 기존 캐시 재사용이다. `build`는 웹 새 실행, 관리자·Storybook 캐시 재사용으로 통과했다. `expo:doctor`는 20/20 새 실행 통과. 기존 큰 청크 경고는 남아 있다. 로그는 `.context/photo-resume-{check,build,doctor}.log`에 보관한다.
- 임시 코드 제거 후 최종 검증: `check` 통과(웹 497개·모바일 284개 테스트 새 실행, 브리지 96개·관리자 659개·UI 10개 캐시 재사용). `build`는 웹 새 실행, 관리자·Storybook 캐시 재사용으로 통과했다. 앱 시작 주소는 기본 홈으로 복구했고 진단 전용 테스트 2개를 제거했다. 로그는 `.context/photo-final-{check,build}.log`에 보관한다.
