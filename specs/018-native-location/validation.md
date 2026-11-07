# 검증 기록

## 1단계 — 명세·계획·계약과 이슈 초안

작성일: 2026-11-07. 실제 브랜치는 `DongjaJ/m29b9`이며 변경하지 않았다.
`git fetch origin` 후 HEAD와 origin/main은 모두 `4fc4cd837bc04df3d7c2c99152af5ce6ba68c744`였다.
시작 시 작업 트리는 깨끗했고 이 단계는 `specs/018-native-location/` 문서만 추가한다.

### 작성·검토

- 사용자 결정: iOS·Android, 요청 시 단발, 정확도 전달, 설정 열기, 출석 제출 제외.
- Spec Kit specify·plan·tasks의 문서 구조와 저장소 이슈 템플릿을 적용했다.
- `.specify/feature.json`은 gitignored 로컬 상태로 새 기능을 가리킨다. 기존 파일은 없었다.
- setup-plan JSON의 BRANCH는 기능 해석값 `018-native-location`이며 실제 Git 브랜치 이름이 아니다.
- `.specify/extensions.yml`이 없어 specify·plan·tasks의 전·후 hook은 실행하지 않았다.
- 열린 위치 관련 이슈 검색은 0건이다. 이슈 초안만 작성했으며 원격 생성·커밋·push는 하지 않았다.

### 검증 결과

- 새 실행 통과: setup-plan, setup-tasks, check-prerequisites의 명세·작업 목록 필수 검사.
- 새 실행 통과: 로컬 Markdown 링크, 명확화 자리 표시자 없음, 작업 ID T001~T024 연속성 검사.
- 최초 `mise exec -- node --run check`는 의존성이 없어 `oxfmt: command not found`로 종료했다.
- `mise exec -- pnpm install --frozen-lockfile`로 기존 lockfile을 유지해 의존성을 설치했다. 패키지 다운로드 없이 로컬 store를 재사용했다.
- 새 실행 통과: 변경 문서 10개 oxfmt 정리, 루트 format:check 809개 파일 검사.
- 최종 `mise exec -- node --run check` 통과: lint 7/7, typecheck 7/7, test 5/5는 모두 Turbo 공유 worktree 캐시를 재사용했다. 이번에 새로 실행한 앱 테스트로 보고하지 않는다.

### 미실행·리뷰 경계

- build·expo:doctor·위치 기능 테스트·실기기 검증은 미실행이다. 이 단계는 문서만 변경하며 네이티브 의존성·설정·앱 소스는 수정하지 않았다.
- 기능 구현은 아직 없으며 사용자 승인 이슈 번호는 #353이다. 문서 검사 통과는 앱 기능 검증을 뜻하지 않는다.
- 사용자 리뷰와 이슈 생성 승인, 다음 단계 진행 확인 전에는 2단계를 시작하지 않는다.
- origin/main 대비 변경량은 신규 문서 10개, 추가 580줄·삭제 0줄이다. untracked 문서까지 포함해 계산했다. 650줄 미만으로 현재 단계 분리는 필요 없다. 이후 구현은 별도 리뷰/PR 단위로 분리해 800줄 제한을 지킨다.

## 이슈 생성 — 2026-11-07

사용자의 이슈 생성 승인으로 [#353](https://github.com/YAPP-admin/yapp-plus-frontend/issues/353)을 생성했다.
재조회로 제목·본문·OPEN 상태·담당자 DongjaJ·추가 라벨/milestone 없음을 확인했다.
2단계 진행 승인은 별도로 대기하며 앱 구현·커밋·push는 하지 않았다.

## 출시 전 호환성 범위 조정

사용자 지시에 따라 UNSUPPORTED 코드와 구버전 앱 지원 검사·fallback·검증을 제거했다.
일반 브라우저는 호출을 막고 앱 이용을 안내한다. 새 네이티브 모듈의 바이너리 재빌드와 런타임 분리는 유지한다.
로컬 명세·계약·작업 목록·이슈 본문 초안을 동기화했다. 원격 #353 본문은 수정 승인 범위에 포함되지 않아 유지했다.
이번 수정은 문서 포맷 검사·diff 공백 검사만 새로 통과했다. 전체 check와 앱 검증은 재실행하지 않았다.

## 출석 허용 반경과 측정 품질 정리

사용자 승인으로 출석 허용 반경 100m를 예정 기준으로 명세·계획·계약·조사·검증 절차·로컬 이슈 초안에 반영했다.
accuracy는 측정 품질 정보로만 전달하며 허용 반경에 더하지 않는다. 재측정 임계값·출석 판정 구현은 후속 API 범위다.
앱 소스와 원격 #353 본문은 변경하지 않았다.
새 실행: 문서 포맷 검사 통과. node --run check 통과 중 lint 7/7·typecheck 7/7·test 5/5는 모두 Turbo 캐시 재사용이다.
build·expo:doctor·실기기 검증은 문서만 수정해 미실행이며 실제 위치 동작은 아직 검증되지 않았다.

## TypeScript 계약 설명 보강

문자열 리터럴 유니온의 의미와 각 타입·필드·허용 문자열의 한국어 주석을 추가했다.
권한 조회 성공과 권한 허용, 위치 측정 성공과 출석 완료, 설정 실행 성공과 권한 변경의 차이를 명시했다.
타입의 값이나 실행 동작은 변경하지 않았다. 앱 소스·원격 이슈도 변경하지 않았다.
새 실행: 문서 포맷 검사 통과. check의 lint 7/7·typecheck 7/7·test 5/5는 Turbo 캐시 재사용이다.
build·expo:doctor·실기기 검증은 문서 변경으로 미실행이다.

## 문서 커밋과 2단계 진행 승인

사용자가 문서 커밋과 다음 작업 진행을 승인했다. 문서·계약 기반은 현재 브랜치에서 진행하고, PR 제한에 따라 2-1 공용 계약을 먼저 리뷰한다.
이 승인에 push·PR 생성·브랜치 전환·후속 구현 커밋은 포함하지 않는다.

## 2-1단계 — 공용 계약

문서 커밋: f4fd5fded92226ecd27a9fe073b6d543cab783f4. 타입·스키마·공개 export와 계약 테스트를 추가했다.
새 계약 테스트 23개가 구현 전 실패하고 구현 후 통과했다. check 통과: app-bridge·mobile·web의 lint/typecheck/test 새 실행, 나머지 lint 4개·typecheck 4개·test 2개는 캐시 재사용.
build·expo:doctor·실기기는 미실행이다. 앱/모바일 설정 변경은 없고 위치 수집·RPC 등록은 2-2에 남아 있다.
현재 base origin/main 대비 총 변경량은 796줄(모두 추가)이다. 650줄 분리 검토 기준에 따라 이후 네이티브 구현은 별도 종속 PR로 분리하며, 2-1 리뷰와 브랜치 작업 승인 전에는 진행하지 않는다.

## 2-2단계 — 네이티브 위치 구현

사용자 승인으로 2-1을 `53c29215f2051181e53f7820b7ce8e4676a14d46`에 커밋하고 `DongjaJ/native-location-runtime`으로 분기했다.
종속 PR base는 `DongjaJ/m29b9`다. push·PR 생성·2-2 커밋은 수행하지 않았다.

- Expo Location 58.0.20을 SDK 호환 설치했으며 공급망 보호 예외는 추가하지 않았다.
- 권한 조회·단발 위치·설정 열기를 RPC에 연결하고 브리지 debug 로그를 껐다. 정밀/대략 위치와 오차 200m·null도 측정 결과로 전달한다.
- 15초 측정 제한·150초 전체 제한, 중복 요청, 권한 대기 잠금, 늦은 구독·권한 응답·실패, background 정리를 검증했다. inactive는 취소하지 않는다.
- 최초 actions 테스트는 모듈 미구현으로 실패했고 구현 후 통과했다. 초기 lint 실패는 중괄호·명시적 mock 타입·enum 비교 규칙을 적용해 해결했다.
- 최종 check 통과: mobile lint/typecheck와 109개 테스트(위치 신규 33개)는 새 실행했다. 나머지 lint 6개·typecheck 6개·test 4개는 캐시 재사용이다. 앞선 동일 작업의 실행에서 app-bridge·web 검사도 새로 통과했다.
- build 통과: web은 새 실행, admin·storybook은 Turbo 캐시를 재사용했다. 이 명령은 네이티브 바이너리를 빌드하지 않는다.
- expo:doctor 20/20 새 실행 통과. expo config introspect에서 한국어 사용 중 위치 문구·앱 버전 1.0.1·appVersion 정책을 확인했다. 상시 위치·동작 감지·임시 정밀 권한 문구와 background location 모드는 없다.
- iOS Expo export로 최종 JavaScript 번들을 새로 생성했다. 앱 바이너리 재빌드·설치와 실기기 권한 팝업·GPS 검증은 미실행이다.
- 이 저장소의 실제 네이티브 구현/빌드는 iOS 범위로 정정했다. Android는 별도 프로젝트이며 정밀 권한 변환의 단위 테스트만 수행했다. 원격 #353 본문은 수정하지 않았다.
- 종속 base 대비 추가 739줄·삭제 28줄, 합계 767줄이다. 650줄부터 분리를 검토했으며 네이티브 동작과 인접 테스트를 한 리뷰 단위로 유지하고 800줄 미만을 지켰다.

3단계 웹 연결·개발 검증 화면·실기기 통합 검증은 미구현/미실행이다. 2-2 리뷰 후 다음 단계 진행을 확인한다.

## 2-2 리뷰 반영 — 단순화

백그라운드 수집은 사용하지 않는다. 기본값이 false인 플러그인 옵션 3개와 Android 정밀도 변환·테스트를 제거했다.
내부 권한 결과를 LocationPermission으로 지정해 중복 스키마 검증을 제거하고, 외부 좌표 검증과 구독 수명 보호는 유지했다.
오류 코드는 9개에서 6개로 축소했다. 응답 검증·통신·설정 실행 실패는 LOCATION_UNAVAILABLE로 통합하고 계약 문서를 동기화했다.
React Query 의존성은 추가하지 않았다. 웹 요청 상태 관리는 3단계에서 검토하며 좌표를 쿼리 캐시에 저장하지 않는다.

검증: check 통과. app-bridge·mobile·web의 lint/typecheck/test는 새 실행(모바일 106개), 나머지 lint/typecheck 각 4개·test 2개는 캐시 재사용이다.
build는 web 새 실행·admin/storybook 캐시 재사용, expo:doctor 20/20·iOS introspect 권한 부재 검사는 새 실행으로 통과했다. 네이티브 바이너리·실기기는 미검증이다.
종속 base DongjaJ/m29b9 대비 추가 748줄·삭제 42줄, 합계 790줄로 단일 네이티브 리뷰 단위를 유지했다. 커밋·원격 변경·3단계 구현은 하지 않았다.

## 2-2 리뷰 반영 — Expo 단발 API

사용자 승인으로 watchPositionAsync를 getCurrentPositionAsync로 교체했다. 실행 코드 202줄을 143줄로 줄이고 구독·AppState listener·150초 전체 타이머를 제거했다.
권한 대기 잠금·15초 측정 응답 대기·좌표 검증을 유지한다. timeout은 OS 측정을 취소하지 않으며 재시도와 겹칠 수 있지만 늦은 응답은 반영하지 않는다. 활성 상태는 시작·권한 확인 후·위치 반환 시 확인한다.
명세·계획·계약·수명 모델·테스트 절차를 동기화했다. 웹 연결은 다음 단계이며 네이티브 변경만으로 화면 이탈 처리를 구현한 것은 아니다.
최초 check의 테스트 mock require-await 오류를 수정했다. 최종 check 통과: app-bridge·mobile·web lint/typecheck/test 새 실행, 나머지 lint/typecheck 각 4개·test 2개 캐시 재사용. 모바일 102개(위치 26개) 통과 후 테스트 시각 생성 개선도 모바일 전체 새 실행으로 확인했다.
build는 web 새 실행·admin/storybook 캐시 재사용, iOS Expo export는 새 실행 통과했다. 설정·의존성 변경이 없어 expo:doctor는 재실행하지 않았다. 네이티브 바이너리·실기기는 미검증이다.
종속 base DongjaJ/m29b9 대비 추가 573줄·삭제 98줄, 합계 671줄로 네이티브 구현과 인접 테스트를 한 리뷰 단위로 유지한다. 커밋·원격 변경·다음 단계 구현은 수행하지 않았다.

## 2-2 리뷰 반영 — 책임 분리와 선언적 변환

actions.ts 내부의 비공개 resolvePermission·measureLocation으로 권한 확보와 측정/타이머 정리를 분리했다. createLocationActions는 요청 잠금·실행 순서·오류 변환을 담당한다. 외부 API와 동작은 유지했다.
permission은 재할당 없이 반환값으로 결정하고 iOS precision은 상수 매핑으로 변환한다. 실제 수명 상태인 busy와 timer만 let으로 유지했다. 추가 파일·클래스·의존성은 없다.
check 통과: mobile lint/typecheck와 테스트 102개 새 실행, 나머지 lint/typecheck 각 6개·test 4개 캐시 재사용. build 3개 모두 캐시 재사용, iOS Expo export 새 실행 통과. 설정·의존성 변경이 없어 doctor는 재실행하지 않았다. 네이티브 바이너리·실기기 검증은 미실행이다.
종속 base DongjaJ/m29b9 대비 추가 597줄·삭제 98줄, 합계 695줄로 현재 리뷰 단위를 유지했다. 커밋·원격 변경·3단계 구현은 수행하지 않았다.

## 2-2 리뷰 반영 — 주석과 문맥 구분

frontend-development.md의 코드 주석·공개 계약 지침과 모바일 README를 확인했다. 위치 소스·테스트 파일의 책임과 경계, 팩토리의 클로저 수명, 반환 함수의 권한·timeout·설정 실행 조건을 주석으로 보강하고 문맥별 개행을 추가했다.
중첩 함수는 runtime과 busy를 캡처하는 기존 구조를 유지했다. 실행 로직은 변경하지 않았다. check 통과: 모바일 lint/typecheck·102개 테스트 새 실행, 나머지 lint/typecheck 각 6개·test 4개 캐시 재사용. 주석·개행만 수정해 build·doctor·실기기는 재실행하지 않았다.
종속 base DongjaJ/m29b9 대비 추가 654줄·삭제 98줄, 합계 752줄이며 현재 리뷰 단위를 유지한다. 커밋·원격 변경·다음 단계 구현은 하지 않았다.
