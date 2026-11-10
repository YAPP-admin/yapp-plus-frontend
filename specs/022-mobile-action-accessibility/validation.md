# 1단계 재현 기준과 검증 기록

**기준일**: 2026-11-10
**기준 commit**: `7bd77d09035d8c1a317469bc4d03caedb25955f1`
**작업 위치**: nairobi / `DongjaJ/plan-proceed`
**상태**: 2단계 US1 구현·자동 검증 완료. 실제 앱 UI 수용 측정과 2단계 리뷰 대기.

## 실행 환경과 구분

- 최신 origin/main을 fetch했고 시작 시 HEAD와 같으며 작업 트리는 깨끗했다.
- 이슈 #411 생성·담당자 DongjaJ·본문·OPEN 상태를 확인했다.
- Node.js 24.20.0 / pnpm 12.3.4. frozen-lockfile 설치 완료, lockfile 변경 없음.
- 로컬 Vite 8.2.2를 `172.30.1.80:5184`에서 실행했다. API mocking=true, static content=false. iOS 시뮬레이터 Safari가 이 개발 서버를 열었다.
- Chrome 기본 UI에서 설정·가입 이름 화면을 캡처했다. 해당 브라우저 조건에서는 두 하단 버튼이 보였다. native inset·소프트웨어 키보드 조건의 결함을 재현한 결과는 아니다.
- viewport 375×667을 설정하고 DevTools 읽기 전용 조회로 innerWidth=375, innerHeight=667을 확인했다. 종료 전 override를 복원했다.
- iPhone 15 / iOS 17.5 시뮬레이터 Safari에서 `/settings`와 `/signup`을 열었다. 실제 iOS 소프트웨어 키보드가 열린 가입 이름 화면에서 다음 버튼이 가려졌다.
- 실제 iPhone은 연결되지 않았다. 사용자가 실제 iOS 검증을 최종 완료 전까지 연기하도록 승인했다.

## 화면별 재현표

아래 코드는 결함 후보의 근거다. 렌더링 높이·버튼 rect·safe-area·스크롤 수치를 측정한 결과로 해석하지 않는다.
경로는 `apps/web/` 기준이며 실행 순서는 [quickstart.md](quickstart.md)를 따른다.

| 화면                       | 코드에서 확인한 기준 상태                                                  | 실행 측정·캡처                                                                                                                                                                                                          |
| -------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 설정                       | PageShell과 SettingsPage가 100dvh, 로그아웃 하단 34px; 메뉴 순서 유지 대상 | iPhone 15 Safari에서 로그아웃 전체 표시. `.context/ui-baseline/ios-simulator-settings-before-clean.png`                                                                                                                 |
| 가입 이름                  | AuthLayout의 PageShell 100dvh; 본문·액션에 flexGrow 사용                   | 키보드 닫힘은 다음 버튼 표시, 키보드 열림은 버튼이 Safari UI와 키보드 아래로 가려짐. `.context/ui-baseline/ios-simulator-signup-keyboard-before.png`                                                                    |
| 가입 휴대폰                | SignupPage useState 단계; AuthLayout 뒤로가기는 flow.pop                   | 미확인                                                                                                                                                                                                                  |
| 로그인                     | 고정 팝업 폭 290px, positioner 좌우 합계 40px                              | 미확인                                                                                                                                                                                                                  |
| 가입 완료                  | signup-complete-page.css.ts의 gap 160px                                    | 미확인                                                                                                                                                                                                                  |
| 출석 완료                  | 100dvh, marginBottom 160px, 하단 34px; 성공 이력 없으면 404                | 미확인                                                                                                                                                                                                                  |
| 팀 사진 업로드             | 100dvh, 하단 34px; 현재 샘플 사진·팀원 목록                                | 미확인                                                                                                                                                                                                                  |
| 팀 완료·오류 / 로그인 오류 | 페이지별 100dvh 및 일부 자체 헤더·하단 여백                                | 미확인                                                                                                                                                                                                                  |
| 홈·일정·게시판·MY          | 탭만 상단 inset 차감; 하단 34px + inset; 패널 DOM 유지                     | 로그인된 네이티브 WebView의 홈·게시판 빈 상태에서 탭 바·홈 인디케이터 분리 확인. 일정·MY와 탭 복귀는 미확인. `.context/ui-baseline/ios-simulator-native-home-logged-in.png`, `ios-simulator-native-board-logged-in.png` |
| 공지 상세·출석 규칙        | 본문 끝 확인 버튼 유지 및 팝업/긴 내용 회귀 대상                           | 미확인                                                                                                                                                                                                                  |

## 확보한 브라우저 근거

캡처 위치는 저장소 루트 기준이며 gitignored 로컬 산출물이다.

| 근거                                                  | 결과                                                                                                     |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `.context/ui-baseline/chrome-settings-375x667.jpg`    | 설정 메뉴와 로그아웃 전체 표시. 정확한 버튼 rect·스크롤 수치는 미확인                                    |
| `.context/ui-baseline/chrome-signup-name-375x667.jpg` | 이름 입력과 다음 버튼 전체 표시                                                                          |
| 가입 이름 DevTools 조회                               | viewport 375×667, visualViewport.height=667 / offsetTop=0 / scale=1                                      |
| 가입 다음 버튼 rect                                   | x=16, y=603, width=343, height=52; 하단 655로 viewport 안에 있음                                         |
| 안전 여백 조회                                        | documentElement의 `--safe-area-inset-top/bottom`은 빈 값. native 기기 inset 적용 조건을 검증한 것이 아님 |
| 입력                                                  | 합성 이름 입력과 다음 버튼 활성화까지 확인. 실제 단계 전환·값 보존은 도구 입력 실패로 미확인             |

검게 캡처된 중간 파일 `chrome-signup-loading-invalid.jpg`는 유효한 화면 근거에서 제외한다.
성공 캡처는 브라우저 창을 활성화한 뒤 얻었으며 현재 제품 코드가 수정된 결과가 아니다.

## 확보한 iOS 시뮬레이터 근거

- 기기: iPhone 15 Simulator / iOS 17.5, 세로 방향, Safari. 화면 해상도는 1179×2556px이며 iPhone 15의 CSS viewport는 393×852 기준이다.
- 설정: `ios-simulator-settings-before-clean.png`에서 로그아웃 버튼 전체가 표시된다. 이 화면에는 Safari 하단 UI가 포함되므로 실제 설치 앱의 홈 인디케이터 검증을 대체하지 않는다.
- 가입 이름, 키보드 닫힘: 다음 버튼 전체가 표시된다.
- 가입 이름, 키보드 열림: `ios-simulator-signup-keyboard-before.png`에서 소프트웨어 키보드가 입력 본문 아래를 차지하고 다음 버튼은 가시 영역에 없다. 빈 입력이라 버튼이 비활성 상태인 점과 별개로 버튼 영역 자체가 키보드 위로 이동하지 않았다.
- 합성 입력값을 물리 키보드 붙여넣기로 넣으면 버튼은 활성화됐지만 iOS가 소프트웨어 키보드를 닫았다. 따라서 **활성 버튼과 열린 소프트웨어 키보드의 동시 상태** 및 휴대폰 단계 왕복은 아직 미확인이다.
- 이 시뮬레이터 Safari 결과는 설치 앱 WebView 결과와 구분한다. 실제 iOS 설치 앱과 Android 검증은 최종 수용 기준에 남긴다.
- 로그인 후 네이티브 WebView 홈: 같은 iPhone 15 / iOS 17.5에서 `ios-simulator-native-home-logged-in.png`를 확보했다. 하단 탭 바의 하단과 홈 인디케이터 사이에 여백이 있고 서로 겹치지 않는다. 출결 보고 카드는 현재 “준비 중” 비활성 상태여서 팀 인증 진입·업로드 CTA는 이 계정 상태에서는 확인할 수 없었다.
- 로그인 후 네이티브 WebView 게시판: `ios-simulator-native-board-logged-in.png`에서 빈 상태 콘텐츠와 하단 탭 바가 모두 보이며, 탭 바와 홈 인디케이터는 겹치지 않는다. 공지가 없어 목록 스크롤·상세·확인 CTA는 확인하지 못했다.

## 측정 실패와 재개 조건

브라우저의 navigation·evaluate·screenshot API에서 `Cannot read properties of undefined (reading 'timeoutMs')`
오류가 발생했다. 기본 Chrome UI에서도 처음에는 본문 접근성 트리가 비고 캡처가 검게 나왔다.
사용자는 Mac이 잠겨 있지 않음을 확인했다. 창 활성화 후 두 화면 캡처와 DevTools 일부 수치를 확보했지만
일반 DOM API는 계속 실패했다. 가입 입력 후 클릭·키보드 조작에서도 상태가 변하지 않거나
`elementHasNoFrame`이 발생해 휴대폰 전환과 전체 측정은 완료하지 못했다.
초기 Simulator 앱 선택은 `Invalid app`으로 실패했지만 이후 Device Hub를 통해 기기 화면과 소프트웨어 키보드를 확인했다. Device Hub가 키보드 캡처를 전환하면 소프트웨어 키보드를 닫아 활성 CTA 상태를 같은 조건에서 재현하지 못했다. 이 도구 제한을 애플리케이션 결함으로 단정하지 않는다.
로그인 후 네이티브 홈에서는 Device Hub 화면 캡처를 얻었지만 기기 내부를 클릭하는 요청이 `noWindowsAvailable`으로 실패했다. 따라서 탭별·팀 인증 화면으로의 추가 전환은 수행하지 않았으며, 현재 홈 화면 캡처만 네이티브 근거로 사용한다.
제어 세션을 초기화한 뒤 게시판 화면은 확보했으나, 일정 탭을 누르는 요청도 같은 오류로 실패했다. 사용자 또는 다른 도구가 변경한 화면 상태와 이 오류 뒤의 실제 입력 적용 여부는 구분할 수 없으므로, 성공적으로 확인한 화면만 근거로 기록한다.
재측정에서 화면 우측 상단의 회색 아이콘은 제품 설정이 아니라 Expo 개발 메뉴임을 확인했다. 이 메뉴는 접근성 트리에 노출돼 열고 닫을 수 있었지만, 로그인된 WebView 내부의 탭·버튼·스크롤 컨테이너는 노출되지 않았다. 따라서 이 개발 빌드에서는 원본 캡처의 시각적 겹침만 확인하고, 내부 버튼 rect·스크롤 수치를 자동 측정하지 않는다.

- 화면 도구가 정상화되면 quickstart의 모든 1단계 화면에서 수정 전 캡처와 수치를 확보한다.
- 키보드 전후는 소프트웨어 키보드가 실제 표시된 시뮬레이터에서 확인한다.
- 검은 캡처나 단위 테스트 통과를 화면 측정 완료 근거로 사용하지 않는다.
- 실제 iOS·Android와 큰 글자·테마·스크린 리더·터치 검증은 후속 단계의 미실행 항목으로 유지한다.

## 자동 검증

- 최초 check는 Spec Kit 원본 템플릿을 복사한 직후 실행해 spec.md·plan.md의 format에서 중단됐다. 제품 실패가 아니며 문서 완성·포맷 후 다시 실행한다.
- 최종 `mise exec -- node --run check` 통과: format 신규 실행, lint 7/7(신규 web 1·캐시 6), typecheck 7/7(신규 web 1·캐시 6), test 5/5(신규 web 1·캐시 4).
- web 테스트는 54개 파일·392개 테스트를 새로 실행해 통과했다. 나머지 ui·app-bridge·mobile·admin 테스트는 캐시 결과다.
- 최종 기록 보완 후 format:check를 새로 실행해 통과했다. Spec Kit prerequisites와 문서 내부 링크·템플릿 잔여 점검도 통과했다.
- 기존 테스트에서 React act 환경 경고와 의도된 오류 경계 로그가 출력됐으며 실패는 없었다. 로그: `.context/ui-baseline/check.log`.
- build·expo:doctor는 1단계 문서만 변경하므로 실행 대상이 아니다. 화면·모바일 설정 변경 단계에서 해당 조건에 따라 실행한다.

## 단계 리뷰 기준

1단계 완료에는 대상 화면 전체의 수정 전 재현표·유효한 캡처와 키보드 기준이 필요하다. 설정·가입 이름의 iOS 근거와 가입 키보드 결함은 확보했지만, 대상 화면 전체·활성 CTA 키보드 상태·휴대폰 단계는 아직 확인하지 못했으므로 이 조건은 충족하지 못했다.
명세와 계획은 검토할 수 있으나, 측정 완료 및 사용자 리뷰 전에 제품 코드 변경을 시작하지 않는다.

1단계에서는 제품 코드·브랜치·commit·push·PR 변경이 없었다.

## 2단계 US1 구현 기록

- `ActivityScreen`의 실제 `AppScreenContent` 스크롤 레이어에 `min-height: 0`을 부여하고, 기존 시작점 observer와 활성 화면 cleanup을 유지했다.
- `PageShell`·탭 셸·가입 공통 화면은 상위 Activity가 제공한 `height: 100%`를 사용하도록 바꾸고, 자식의 `100dvh` 중복 요구를 제거했다.
- 설정 화면의 중복 `100dvh`와 로그아웃 영역의 고정 34px 하단 여백을 제거했다. 가입 이름 화면은 공통 `screen / form / body / footer` 프레임을 사용하도록 연결했다.
- 하단 탭의 고정 34px 영역을 없애고 `--safe-area-inset-bottom`만 최하단 여백으로 사용하도록 변경했다. 탭 panel의 DOM·스크롤 보존 계약은 기존 `tabs-layout.test.tsx` 회귀 테스트로 유지한다.
- 사용자 리뷰 후 하단 탭의 위치 변경은 현 단계에서 생략하기로 했으며, `TabsLayout`과 하단 탭의 기존 34px·safe-area 처리로 되돌렸다. T010은 미완료로 유지한다.
- 설정 로그아웃은 `PageShell`이 네이티브 브리지의 `--safe-area-inset-bottom`을 단독 소유하고, 화면 로컬 footer는 Figma의 `12px 16px`만 사용한다. safe-area padding이 `100dvh` 바깥으로 추가되어 CTA가 스크롤로 밀리던 문제는 `PageShell`의 `box-sizing: border-box`로 수정했다.
- Figma `222:40475` 재대조 후 로그아웃 CTA를 설정 `main`에서 분리된 footer sibling으로 배치했다. 본문은 남은 높이를 사용하고, footer 아래의 네이티브 홈 인디케이터 영역은 `PageShell` safe-area가 제공한다. footer가 `main` 밖에 있다는 회귀 테스트를 추가했다.
- T006 회귀 테스트는 구현 전 `ActivityScreen` 스크롤 레이어와 `PageShell` 높이 계약에서 실패했고, 구현 후 `activity-screen`, `page-shell`, `tabs-layout`, `settings`, `signup` 관련 5개 파일·28개 테스트가 통과했다.
- 전체 `mise exec -- node --run check` 통과: format 신규 실행, lint 7/7(신규 web 1·캐시 6), typecheck 7/7(신규 web 1·캐시 6), test 5/5(신규 web 1·캐시 4). web 테스트는 54개 파일·392개 테스트를 새로 실행해 통과했다. 기존 React act 경고와 의도된 오류 경계 로그는 실패가 아니다.
- 전체 `mise exec -- node --run build` 통과: web build 신규 실행, admin·storybook build는 Turbo 캐시 재사용. 기존 web 청크 크기 경고만 출력됐고 실패는 없다.
- 로컬 Vite로 브라우저 재확인을 시도했으나 브라우저 연결이 `timeoutMs` 오류로 실패해 유효한 전후 캡처를 얻지 못했다. 이 결과를 시각 검증 통과 근거로 사용하지 않는다. 실제 앱 UI 측정은 사용자 요청에 따라 후속 수용 검증으로 남긴다.
- WebView 연결 확인: 이 워크트리의 `@yapp-plus/web` Vite 서버를 `http://localhost:3000`에서 실행한 뒤 iPhone 15 Simulator의 Expo 개발 메뉴에서 앱을 재로드했다. 약 15초 로딩 뒤 로그인된 홈 화면이 표시됐다. 네이티브 셸은 기존 Metro `http://localhost:8081` 연결을 유지했으며, `resolveMobileWebUrl()`의 개발용 포트 3000 경로로 이 워크트리 웹 콘텐츠를 불러온 결과다. 캡처: `.context/ui-baseline/ios-simulator-nairobi-webview-verified.png`. 이는 WebView URL 연결 검증이며, 화면별 수용 측정 완료 근거는 아니다.
- VE 전환 후 iPhone 15 Simulator Safari에서 `/`, `/schedule`, `/notices`, `/my`, `/settings`, `/signup`을 새로 열어 확인했다. 하단 탭·홈 인디케이터·설정 로그아웃·가입 CTA의 레이아웃이 깨지지 않았으며, 캡처는 `.context/ui-baseline/ios-simulator-{home,schedule,notices,my,settings,signup}-after-ve.png`에 보관했다. 가입 화면은 빈 입력의 비활성 CTA까지만 확인했다. Device Hub가 Safari WebView의 입력 필드를 접근성 트리에 노출하지 않아, 소프트웨어 키보드를 연 활성 CTA 상태는 재현하지 못했다.
- 네이티브 WebView를 새로 기동해 같은 검증을 재시도했으나, 기존 Metro `http://localhost:8081`이 `react-native/setup-env` 모듈을 찾지 못해 Expo의 컴파일 오류 화면을 표시했다. 이번 웹 스타일 변경과 별개인 네이티브 번들 오류이며, 네이티브 UI 수용 검증은 이 Metro 오류가 해소된 뒤 재실행해야 한다.
- 앱 내부 WebView 재검증: 이 워크트리의 Expo Metro를 `http://localhost:8082`, 웹 Vite를 `http://localhost:3000`으로 실행하고 설치된 YAPP+ 개발 클라이언트를 `org.yapp.yappplus://expo-development-client/?url=http://localhost:8082`로 연결했다. iPhone 15 Simulator에서 로그인된 홈과 설정 화면을 실제 WebView로 확인했다. 홈은 하단 탭과 홈 인디케이터가 겹치지 않았고, 설정은 하단 로그아웃 CTA가 온전히 표시됐다. 캡처: `.context/ui-baseline/ios-simulator-native-nairobi-home-restored.png`, `ios-simulator-native-nairobi-settings-after-ve.png`. 앱 내부 WebView 요소가 Device Hub 접근성 트리에 노출되지 않아 임시 로컬 리다이렉트로 설정 경로를 초기 로드했으며, 제품 코드에는 변경이 없다. 이후 로그아웃 버튼의 하단 잘림을 재현했고, `PageShell`의 `box-sizing` 수정 뒤 Expo reload가 네이티브 로그인 세션을 초기화해 로그인 화면으로 전환됐다. 따라서 최신 수정의 실제 WebView 수용 확인은 로그인 후 재실행이 필요하다. 캡처: `.context/ui-baseline/ios-simulator-native-nairobi-settings-one-owner-safe-area.png`, `ios-simulator-native-nairobi-settings-box-sizing-after-wait.png`.

**2단계 리뷰 대기**: 실제 앱 UI 수용 측정을 제외한 자동 검증은 완료했다. 기준 `origin/main` 대비 변경량은 단계 제출 시 산출하며, 사용자 리뷰와 3단계 진행 확인 전에는 가입 키보드·탐색 구현(T012–T017)을 시작하지 않는다.

## 3단계 US2 구현 기록

- `useSignupViewport`·`rootRef`·동적 CSS 변수·`@vanilla-extract/dynamic`은 실제 WebView에서 `dvh`·flex만으로 CTA가 가려진다는 재현 근거가 없어 제거했다. 키보드 보정은 필요한 결함이 재현될 때만 추가한다.
- 가입 단계는 화면 로컬 state가 아니라 Signup Activity 내부의 `useSignupFunnel` step API가 소유한다. 이름 제출은 phone step을 추가하고, 헤더·브라우저 뒤로가기는 phone step에서 name step으로 복귀한다. 직접 `/signup` 진입은 URL params와 무관하게 name부터 시작하며 폼 값은 같은 화면 인스턴스가 보존한다.
- 단일 TanStack Form 인스턴스를 유지해 name/phone 왕복과 서버 name 오류 복귀 시 입력·다른 필드 오류를 보존한다. native 가입 요청 pending 동안 `다음` 버튼은 loading 표시와 함께 비활성화해 중복 제출을 막는다.
- 새로 실행한 가입 관련 검증: `use-signup-viewport`, `signup-page`, `stack` 3개 파일·34개 테스트 통과, `@yapp-plus/web` lint·typecheck 통과.
- 전체 `mise exec -- node --run check` 통과: format 신규 실행, lint는 web·admin 신규/나머지 캐시 5개, typecheck·test는 lockfile 변경으로 모두 신규 실행됐다. web 55개 파일·398개 테스트가 통과했다.
- 전체 `mise exec -- node --run build` 통과: web·admin·storybook build를 새로 실행했다. 기존 web 및 storybook 청크 크기 경고만 출력됐다.
- 실제 앱 내부 WebView는 iPhone 15 / iOS 17.5에서 로컬 `/signup` 진입과 키보드 닫힘 레이아웃을 확인했다. 캡처: `.context/ui-baseline/ios-simulator-stage3-signup-retry.png`. Device Hub 입력 제어가 `noWindowsAvailable` 오류로 실패해 소프트웨어 키보드가 열린 활성 CTA의 최종 수동 확인은 남아 있다.

**3단계 리뷰 대기**: 코드·자동 검증은 완료했다. 실제 iOS 키보드 열린 상태의 CTA 탭 가능 여부와 Android back은 다음 단계로 넘어가기 전 사용자/정상화된 도구로 확인한다.
