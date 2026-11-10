# 1단계 재현 기준과 검증 기록

**기준일**: 2026-11-10
**기준 commit**: `7bd77d09035d8c1a317469bc4d03caedb25955f1`
**작업 위치**: nairobi / `DongjaJ/plan-proceed`
**상태**: 명세 작성 완료, 화면 기준 측정 미완료. 2단계 미착수.

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

| 화면                       | 코드에서 확인한 기준 상태                                                  | 실행 측정·캡처                                                                                                                                                    |
| -------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 설정                       | PageShell과 SettingsPage가 100dvh, 로그아웃 하단 34px; 메뉴 순서 유지 대상 | iPhone 15 Safari에서 로그아웃 전체 표시. `.context/ui-baseline/ios-simulator-settings-before-clean.png`                                                           |
| 가입 이름                  | AuthLayout의 PageShell 100dvh; 본문·액션에 flexGrow 사용                   | 키보드 닫힘은 다음 버튼 표시, 키보드 열림은 버튼이 Safari UI와 키보드 아래로 가려짐. `.context/ui-baseline/ios-simulator-signup-keyboard-before.png`              |
| 가입 휴대폰                | SignupPage useState 단계; AuthLayout 뒤로가기는 flow.pop                   | 미확인                                                                                                                                                            |
| 로그인                     | 고정 팝업 폭 290px, positioner 좌우 합계 40px                              | 미확인                                                                                                                                                            |
| 가입 완료                  | signup-complete-page.css.ts의 gap 160px                                    | 미확인                                                                                                                                                            |
| 출석 완료                  | 100dvh, marginBottom 160px, 하단 34px; 성공 이력 없으면 404                | 미확인                                                                                                                                                            |
| 팀 사진 업로드             | 100dvh, 하단 34px; 현재 샘플 사진·팀원 목록                                | 미확인                                                                                                                                                            |
| 팀 완료·오류 / 로그인 오류 | 페이지별 100dvh 및 일부 자체 헤더·하단 여백                                | 미확인                                                                                                                                                            |
| 홈·일정·게시판·MY          | 탭만 상단 inset 차감; 하단 34px + inset; 패널 DOM 유지                     | 로그인된 네이티브 WebView 홈에서 탭 바·홈 인디케이터 분리 확인. 일정·게시판·MY와 탭 복귀는 미확인. `.context/ui-baseline/ios-simulator-native-home-logged-in.png` |
| 공지 상세·출석 규칙        | 본문 끝 확인 버튼 유지 및 팝업/긴 내용 회귀 대상                           | 미확인                                                                                                                                                            |

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

## 측정 실패와 재개 조건

브라우저의 navigation·evaluate·screenshot API에서 `Cannot read properties of undefined (reading 'timeoutMs')`
오류가 발생했다. 기본 Chrome UI에서도 처음에는 본문 접근성 트리가 비고 캡처가 검게 나왔다.
사용자는 Mac이 잠겨 있지 않음을 확인했다. 창 활성화 후 두 화면 캡처와 DevTools 일부 수치를 확보했지만
일반 DOM API는 계속 실패했다. 가입 입력 후 클릭·키보드 조작에서도 상태가 변하지 않거나
`elementHasNoFrame`이 발생해 휴대폰 전환과 전체 측정은 완료하지 못했다.
초기 Simulator 앱 선택은 `Invalid app`으로 실패했지만 이후 Device Hub를 통해 기기 화면과 소프트웨어 키보드를 확인했다. Device Hub가 키보드 캡처를 전환하면 소프트웨어 키보드를 닫아 활성 CTA 상태를 같은 조건에서 재현하지 못했다. 이 도구 제한을 애플리케이션 결함으로 단정하지 않는다.
로그인 후 네이티브 홈에서는 Device Hub 화면 캡처를 얻었지만 기기 내부를 클릭하는 요청이 `noWindowsAvailable`으로 실패했다. 따라서 탭별·팀 인증 화면으로의 추가 전환은 수행하지 않았으며, 현재 홈 화면 캡처만 네이티브 근거로 사용한다.

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

제품 코드·브랜치·commit·push·PR 변경은 없다.
