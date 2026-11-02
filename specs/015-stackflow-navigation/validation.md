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

| 계층              | 현재 계약                                                                       | 근거                                                     |
| ----------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Native iOS        | `react-native-safe-area-context`의 `initialWindowMetrics`와 `useSafeAreaInsets` | `apps/mobile/src/bridge.ts`, `apps/mobile/app/index.tsx` |
| Bridge state      | `safeAreaInsets: { top, right, bottom, left }`                                  | `packages/app-bridge/src/index.ts`                       |
| CSS adapter       | `--safe-area-inset-top/right/bottom/left`                                       | `packages/app-bridge/src/web.ts`                         |
| Page shell        | `var(--safe-area-inset-*, env(safe-area-inset-*, 0px))`                         | `apps/web/src/app/layouts/page-shell.css.ts`             |
| Bottom navigation | bottom indicator와 snackbar 위치에 `env(safe-area-inset-bottom)`                | `apps/web/src/app/layouts/bottom-navigation.css.ts`      |
| Viewport          | `viewportFit: 'cover'`                                                          | `apps/web/app/layout.tsx`                                |
| SEED variables    | 아직 브리지에서 설정하지 않음                                                   | Stage 8에서 alias 추가 예정                              |

현재 위험: AppScreen 도입 후 PageShell, AppScreen, bottom navigation이 같은 inset을 각각 적용할 수 있으므로 Stage 8에서 한 번만 적용하도록 통합해야 합니다.

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
