# 0단계 기준선·경로 인벤토리

## 기준점

- 기준 브랜치: `DongjaJ/stacflow`
- 기준 commit: `98ee1b9ab0b4b62b76d0e477ef645a92e3b0c7f4`
- `origin/main`과 fast-forward 동기화 완료
- 작업 전 추적 파일 변경 없음
- issue: [#259](https://github.com/YAPP-admin/yapp-plus-frontend/issues/259)

## 공개 URL 목록

| URL                         | 현재 Next 경로                            | query 또는 dynamic segment | 화면                  |
| --------------------------- | ----------------------------------------- | -------------------------- | --------------------- |
| `/`                         | `app/(tabs)/page.tsx`                     | `session`, `attendance`    | Home                  |
| `/schedule`                 | `app/(tabs)/schedule/page.tsx`            | 없음                       | Schedule              |
| `/notices`                  | `app/(tabs)/notices/page.tsx`             | `empty`는 Alerts 전용      | Notices               |
| `/notices/:noticeId`        | `app/notices/[noticeId]/page.tsx`         | `noticeId`                 | Notice detail         |
| `/my`                       | `app/(tabs)/my/page.tsx`                  | 없음                       | My                    |
| `/alerts`                   | `app/(tabs)/alerts/page.tsx`              | `empty=true`               | Alerts                |
| `/my/attendance`            | `app/my/attendance/page.tsx`              | `mode`                     | Attendance            |
| `/my/attendance/rules`      | `app/my/attendance/rules/page.tsx`        | 없음                       | Attendance rules      |
| `/attendance/complete`      | `app/attendance/complete/page.tsx`        | 없음                       | Attendance complete   |
| `/settings`                 | `app/settings/page.tsx`                   | 없음                       | Settings              |
| `/team-attendance/upload`   | `app/team-attendance/upload/page.tsx`     | `error=true`               | Team upload           |
| `/team-attendance/error`    | `app/team-attendance/error/page.tsx`      | 없음                       | Team error            |
| `/team-attendance/complete` | `app/team-attendance/complete/page.tsx`   | 없음                       | Team complete         |
| `/login`                    | `app/(auth)/login/page.tsx`               | `error=true`               | Login                 |
| `/login/error`              | `app/(auth)/login/error/page.tsx`         | 없음                       | Login error           |
| `/signup`                   | `app/(auth)/signup/page.tsx`              | 없음                       | Signup                |
| `/signup/status`            | `app/(auth)/signup/status/page.tsx`       | 없음                       | Signup status         |
| `/signup/complete`          | `app/(auth)/signup/complete/page.tsx`     | 없음                       | Signup complete       |
| `/signup/unregistered`      | `app/(auth)/signup/unregistered/page.tsx` | 없음                       | Signup unregistered   |
| `/error`                    | `app/error/page.tsx`                      | 없음                       | Login error 호환 진입 |
| `/_not-found`               | `app/not-found.tsx`                       | 없음                       | NotFound              |
| `/dev/routes`               | `app/dev/routes/page.tsx`                 | 개발 환경 전용             | 개발 route            |

## query 소비처

- `HomePage`: `session=team`이면 팀 세션, `attendance=attended`이면 출석 완료 상태를 표시합니다.
- `AttendancePage`: `mode`가 `active` 또는 `history`이면 해당 모드, 그 밖에는 기본 모드를 사용합니다.
- `AlertsPage`: `empty=true`이면 빈 알림 상태를 표시합니다.
- `LoginPage`: `error=true`이면 로그인 오류 대화상자를 표시합니다.
- `TeamAttendanceUploadPage`: `error=true`이면 제출 후 오류 Activity로 이동합니다.
- 완료 화면의 확인 링크는 `/` 또는 `/?attendance=attended`의 기존 query 의미를 유지합니다.

## 현재 BackButton fallback

현재 `apps/web/src/app/navigation/back-button.tsx`는 `NavigationHistory`의 `canGoBack()`이 참이면 `router.back()`, 거짓이면 `router.replace(fallback)`을 실행합니다.

| 화면                | 코드 위치                                                                 | fallback                | 현재 정책            |
| ------------------- | ------------------------------------------------------------------------- | ----------------------- | -------------------- |
| Signup              | `src/app/layouts/auth-layout.tsx`                                         | `/login`                | icon back 표시       |
| Signup status       | `src/app/layouts/auth-layout.tsx`                                         | `/login`                | icon back 표시       |
| Alerts              | `src/pages/alerts/ui/alerts-page.tsx`                                     | `/`                     | Home으로 복귀        |
| Attendance complete | `src/pages/attendance-complete/ui/attendance-complete-page.tsx`           | `/?attendance=attended` | 출석 상태 query 유지 |
| Attendance          | `src/pages/attendance/ui/attendance-page.tsx`                             | `/my`                   | MY로 복귀            |
| Attendance rules    | `app/my/attendance/rules/page.tsx` → `DetailLayout`                       | `/my/attendance`        | 출석 내역으로 복귀   |
| Notice detail       | `src/pages/notice-detail/ui/notice-detail-header.tsx`                     | `/notices`              | 공지 목록으로 복귀   |
| Notice error        | `src/pages/notices/ui/notice-error-page.tsx`                              | `/notices`              | 공지 목록으로 복귀   |
| Login error         | `src/pages/login-error/ui/login-error-page.tsx`                           | `/login`                | 로그인으로 복귀      |
| Settings            | `src/pages/settings/ui/settings-page.tsx`                                 | `/my`                   | MY로 복귀            |
| Team upload         | `src/pages/team-attendance-upload/ui/team-attendance-upload-page.tsx`     | `/`                     | Home으로 복귀        |
| Team error          | `src/pages/team-attendance-error/ui/team-attendance-error-page.tsx`       | `/`                     | Home으로 복귀        |
| Team complete       | `src/pages/team-attendance-complete/ui/team-attendance-complete-page.tsx` | `/`                     | Home으로 복귀        |

## safe-area inventory

| 계층              | 현재 계약                                                                                               | 근거                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Native iOS        | `react-native-safe-area-context`의 `initialWindowMetrics`와 `useSafeAreaInsets`                         | `apps/mobile/src/bridge.ts`, `apps/mobile/app/index.tsx` |
| Bridge state      | `safeAreaInsets: { top, right, bottom, left }`                                                          | `packages/app-bridge/src/index.ts`                       |
| CSS adapter       | 브리지 응답 전 `env()`를 사용하고 응답 후 `--safe-area-inset-*`와 `--seed-safe-area-*`를 함께 px로 갱신 | `packages/app-bridge/src/web.ts`                         |
| Page shell        | 상단 padding 없음, 하단은 하단 메뉴가 없는 셸에서만 `var(--safe-area-inset-bottom, env(...))` 적용      | `apps/web/src/app/layouts/page-shell.css.ts`             |
| Bottom navigation | bottom indicator와 snackbar 위치에 브리지 CSS 변수와 `env()` fallback 사용                              | `apps/web/src/app/layouts/bottom-navigation.css.ts`      |
| Viewport          | `viewportFit: 'cover'`                                                                                  | `apps/web/app/layout.tsx`                                |
| SEED variables    | 브리지 응답 전 `env()` fallback, 응답 후 `--seed-safe-area-*` px 값                                     | `packages/app-bridge/src/web.ts`                         |

현재 정책: 좌우·상단은 AppScreen, 하단은 화면별 하단 메뉴 또는 home-indicator 영역이 소유합니다. 같은 가장자리에 두 레이어가 padding을 추가하지 않도록 화면별 셸을 확인해야 합니다.

## 기준선 검증 결과

실행 환경: Node.js `24.20.0`, pnpm `12.3.4`, `pnpm install --frozen-lockfile` 완료.

| 검증                        | 결과         | 증거                                                                                                                                       |
| --------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `node --run check`          | PASS         | 8개 workspace lint·typecheck·test 성공, 웹 25개 파일/86개 테스트 성공                                                                      |
| `node --run build`          | PASS         | 웹 Next.js 16.3.4 production build 성공, 22개 route 생성                                                                                   |
| 웹 route bundle             | 기록         | `apps/web/.next` 17MB, `.next/static` 4.6MB, JS 1,267,732 bytes                                                                            |
| Stackflow dependency search | PASS(기준선) | `pnpm-lock.yaml`, `apps`, `packages`에 Stackflow 패키지 없음                                                                               |
| iOS Simulator availability  | PASS         | iPhone 15 Pro (iOS 17.5) Simulator 부팅 및 Expo Go 58.0.7 설치 완료                                                                        |
| iOS WebView launch          | PASS         | Expo WebView 셸이 `http://localhost:3000`의 YAPP+ Home을 로드함                                                                            |
| iOS WebView navigation      | PARTIAL      | Home·safe area·하단 네비게이션은 확인했으나 CUA surface에서 Simulator 터치 입력이 노출되지 않아 edge swipe/back은 Stage 2 이후 재검증 필요 |

`node --run check` 실행 중 기존 관리자 테스트가 의도적으로 오류 경계 로그를 출력했지만 529개 테스트는 모두 통과했습니다. 이는 실패가 아니라 오류 UI 회귀 사례를 검증하는 stderr입니다.

실행 캡처: [iOS Simulator Home](../../.context/ios-simulator-stage0.png)

## 다음 단계 영향

- Stage 1은 `apps/web`에만 dependency·seed config·공식 snippet을 추가해야 하며 `packages/ui` diff가 없어야 합니다.
- Stage 2의 호환성 판정은 이 문서의 22개 URL, query, fallback과 현재 25개 웹 테스트를 기준으로 합니다.
- Stage 3 이후 iOS gesture와 Android system back은 실제 터치 가능한 WebView surface 또는 네이티브 팀 계약 검증 전까지 완료로 표시하지 않습니다.

## 탭 panel 생명주기 정책

- TabsActivity의 Home·Schedule·Notices·My panel은 React 19 `<Activity>`로 표시·숨김을 제어합니다.
- 숨겨진 panel은 state·DOM을 유지하고 Effect를 정리하므로, 탭별 스크롤·필터·입력 상태는 실행 중 보존하고 polling·타이머·구독은 비활성화합니다.
- URL을 소유하는 하단 메뉴는 typed `Link`를 유지합니다. SEED Tabs는 URL navigation과 분리된 local tab control이 필요한 화면에서만 검토합니다.
- `unmountOnExit`를 사용하는 SEED Tabs와 Activity를 중첩할 때는 Activity가 보존할 panel을 제거하지 않도록 `unmountOnExit={false}`를 명시해야 합니다.

## Activity·WebView·focus 검증 (2026-11-02)

| 대상                        | 결과 | 증거·남은 위험                                                                                                                                                                                                                                                                                                                     |
| --------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 브라우저 탭 전환 focus      | PASS | `/` → `/schedule` 전환 뒤 클릭한 `일정` 링크가 `document.activeElement`로 유지됨                                                                                                                                                                                                                                                   |
| 브라우저 상세 진입 focus    | PASS | 공지 상세 진입 시 AppScreen content layer가 focus를 받고, 뒤로 복귀하면 진입 공지 링크가 focus를 복원함                                                                                                                                                                                                                            |
| 브라우저 탭 상태            | PASS | Notices에서 `과제` 필터를 선택한 뒤 Home 왕복 후 `aria-selected=true` 유지                                                                                                                                                                                                                                                         |
| iOS Simulator WebView 로드  | PASS | iPhone 15 Pro iOS 17.5에서 Expo Go가 `http://localhost:3000`의 Home을 로드함                                                                                                                                                                                                                                                       |
| iOS safe area               | PASS | Xcode 기반 iPhone 15 Pro Max(iOS 17.5)에서 세로 화면의 상태바·홈 인디케이터 영역과 AppScreen content가 겹치지 않음을 확인했습니다. 회전 화면 캡처도 남겼으며, 실기기별 inset 값은 별도 확인이 필요합니다.                                                                                                                          |
| iOS touch·edge swipe        | PASS | Xcode가 실행한 Simulator에서 공지 목록 → 상세 진입과 화면 왼쪽 edge swipe를 수행해 상세 → 목록 복귀를 확인했습니다. 캡처: `.context/ios-xcode-home-final.png`, `.context/ios-xcode-rotation.png`                                                                                                                                   |
| Android AVD 부팅            | PASS | `Medium_Phone_API_35` 부팅 및 ADB 연결 확인                                                                                                                                                                                                                                                                                        |
| Android native WebView 로드 | PASS | `expo run:android`로 SDK 58용 debug APK를 빌드·설치하고 `http://10.0.2.2:3000`의 YAPP+ Home을 로드함. 캡처: `.context/android-native-debug.png`                                                                                                                                                                                    |
| Android 앱 내부 뒤로가기    | PASS | 공지 상세에서 AppBar 뒤로가기 버튼으로 Home에 복귀함. 캡처: `.context/android-in-app-back-result.png`                                                                                                                                                                                                                              |
| Android system back         | PASS | `BackHandler`가 WebView `canGoBack` 상태를 추적하고, 공지 상세에서 `adb shell input keyevent 4` 실행 시 Notices로 복귀함. Home에서 다시 실행하면 root의 기본 Android 종료 동작으로 런처에 복귀함. 캡처: `.context/android-back-fixed-detail.png`, `.context/android-back-fixed-result.png`, `.context/android-back-fixed-root.png` |

브라우저 focus 검증은 React Activity의 state·DOM 보존과 Stackflow 복귀 focus를 확인한 것이며, 실제 iOS VoiceOver·Android TalkBack 및 native back 검증을 대체하지 않습니다.

### Xcode 기반 iOS WebView 검증

`pnpm --filter @yapp-plus/mobile ios`로 Xcode workspace를 빌드·설치·실행했습니다. Xcode의 직접 Run은 Metro 포트 환경변수를 자동 주입하지 않아 JS 번들을 찾지 못했으므로, Expo `run:ios`가 제공하는 Metro URL 주입 경로를 사용했습니다.

- 빌드 결과: `Build Succeeded`, 오류 0건, Expo 모듈 접근 수준 경고 1건
- 실행 대상: iPhone 15 Pro Max, iOS 17.5
- 웹 서버: Vite `http://localhost:3000`, Metro `http://localhost:8081`
- 캡처: `.context/ios-xcode-home-final.png`, `.context/ios-xcode-rotation.png`

### 시뮬레이터와 실기기 검증 범위

이번 전환의 탐색 계약에 필요한 시뮬레이터 검증은 완료했습니다. iOS Simulator에서는 WebView 로드, 공지 상세 진입, edge swipe back, 회전과 safe-area 시각적 겹침을 확인했고, Android AVD에서는 WebView 로드와 앱 내부·시스템 Back 및 root 종료를 확인했습니다.

실제 기기에서만 의미가 있는 항목은 출시 전 별도 QA로 남깁니다.

| 검증 항목                                    | 시뮬레이터 | 실기기 필요 여부 | 이유                                            |
| -------------------------------------------- | ---------- | ---------------- | ----------------------------------------------- |
| Stackflow push/pop, browser back, edge swipe | 완료       | 아니오           | 시뮬레이터 입력으로 탐색 계약을 재현할 수 있음  |
| 기본 safe-area 중복 여부                     | 완료       | 권장             | 기기별 노치·홈 인디케이터 조합이 다름           |
| 실제 native inset 값과 회전                  | 부분 완료  | 권장             | 모델·OS별 inset 및 회전 정책 차이를 확인해야 함 |
| VoiceOver/TalkBack                           | 미실행     | 권장             | 실제 스크린 리더 초점·제스처 확인 필요          |
| 키보드·사진/카메라 업로드·저사양 성능        | 미실행     | 예               | 하드웨어와 실제 메모리·네트워크 조건이 필요함   |

따라서 시뮬레이터만으로 Stackflow 전환의 기본 탐색·Back·safe-area 회귀를 판단할 수 있지만, 출시 승인은 실제 iOS·Android 기기 각각 최소 1대의 native QA를 포함해야 합니다.

# Stage 10 Vite·Vercel 최종 검증

## 배포 설정

- `apps/web/vercel.json`에서 Framework를 `vite`, Output Directory를 `dist`로 고정했습니다.
- 모든 공개 경로의 새로고침이 Vite의 `index.html`로 전달되도록 SPA rewrite를 추가했습니다.
- `apps/web/vercel.json` 변경은 앱 영향도 계산과 무관하게 Web/Admin 배포 설정 검증을 실행합니다.
- Stage 9에서 임시 이름으로 남아 있던 `stackflow-spike` 디렉터리를 `stackflow`로 정식화하고 미사용 스파이크 Activity를 제거했습니다.

## 검증 기록

검증 명령과 결과는 Stage 10 구현 완료 후 아래 표에 기록합니다.

| 검증                                | 결과       | 비고                                                                                                                                              |
| ----------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TURBO_FORCE=true node --run check` | PASS       | lint 7개, typecheck 7개, test 4개; Web 26개 파일/97개 테스트, Admin 46개 파일/529개 테스트                                                        |
| `TURBO_FORCE=true node --run build` | PASS       | Web Vite·Admin·Storybook 3개 build task, 캐시 0                                                                                                   |
| `node --run expo:doctor`            | PASS       | 20/20 checks passed                                                                                                                               |
| 공개 URL 직접 진입·새로고침         | PASS(로컬) | 2026-11-02 빌드 산출물을 `vite preview`로 서빙하고 기준선의 22개 공개 경로를 각각 요청해 모두 HTTP 200을 확인했습니다. `/notices/1`을 포함합니다. |
| Vercel Preview                      | 대기       | push/CI 권한과 Secret이 필요하므로 로컬에서 생성하지 않음                                                                                         |

## 남은 기술 부채와 중단 조건

- 현재 URL adapter는 `initialTab` query를 사용합니다. Stage 4 이전 Stackflow plugin 확장 지점을 확인한 뒤 URL 템플릿 자체를 교체합니다.
- iOS edge swipe와 Simulator 회전은 Xcode 기반 검증을 완료했습니다. 다만 실제 iOS 기기별 safe-area inset과 VoiceOver는 아직 별도 검증 대상입니다. Android system back은 debug WebView에서 `canGoBack → goBack`과 root 종료 동작을 확인했습니다.
- 실제 iOS·Android 기기 QA와 Vercel Preview는 사용자 결정에 따라 이번 전환 범위에서 생략합니다. 따라서 기기별 inset·스크린 리더·하드웨어 동작과 Preview 환경의 rewrite·asset 오류는 출시 전 별도 검증 위험으로 인수합니다.
