# 조사 결정

기준: `7bd77d09`, 2026-11-10. 코드 확인과 실행 재현은 구분한다.

| 결정                                   | 근거                                                                           | 검토한 대안                                                       |
| -------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| 실제 콘텐츠 높이로 통일                | ActivityScreen의 상단 safe-area 안에서 PageShell·설정이 다시 100dvh를 요구한다 | 화면별 높이 보정 복제 대신 프레임에서 소유                        |
| 하단 여백은 최하단 영역 한 곳에서 적용 | bottom-navigation.css.ts의 content-box 34px에 inset padding이 합산된다         | 고정 34px 빈 요소 유지 제외                                       |
| 본문만 스크롤                          | 헤더·액션과 본문을 분리해야 작은 화면과 큰 글자 모두 대응한다                  | fixed CTA로 본문을 덮는 배치 제외                                 |
| 실제 본문을 observer root로 사용       | activity-screen.tsx는 현재 외부 Layer sentinel을 관찰한다                      | 외부 Layer 관찰만 유지하면 내부 스크롤을 놓친다                   |
| 가입 단계는 Activity step, 초안은 폼   | 현재 SignupPage의 useState 단계와 AuthLayout flow.pop이 분리돼 있다            | 입력값을 탐색 params에 저장하거나 전역 폼 store를 추가하지 않는다 |
| 가시 영역 훅은 가입 활성 수명에 한정   | ScreenActiveContext가 이미 존재한다                                            | 전역 키보드 store·브리지 이벤트 추가 제외                         |

[MDN VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport)에서
height·offsetTop·scale과 resize·scroll 이벤트를 확인했다. 화면 키보드와 확대는 layout viewport와
독립적으로 visual viewport를 줄일 수 있다. 이 사실에 따라 앱 영역과 가시 영역의 교집합을 사용한다.
확대 상태에서는 키보드 전용 보정을 적용하지 않는다.

## 기존 계약과 회귀 위험

- `packages/app-bridge/src/web.ts`가 `--safe-area-inset-*`와 `--seed-safe-area-*`를 함께 갱신한다.
- `docs/webview-navigation-contract.md`와 native WebView 설정은 자동 inset을 끄고 웹에서 적용하도록 한다.
- `/signup`은 `Login → Signup` 직접 진입 이력을 가진다. history-sync 복원과 새로고침 초기화 요구를 함께 검증한다.
- Android 시스템 back은 WebView history를 사용하므로 헤더 버튼만 수정해서는 충분하지 않다.
- 탭 lazyMount·마운트 유지·inert·ScreenActiveContext를 보존한다. 내부 스크롤 변경 후 목록 observer도 확인한다.
- 스낵바 전역 위치에는 inset + 108px이 남아 있다. 탭 높이를 줄인 후 실제 표시 위치를 확인한다.
- 팝업은 최소 290px과 positioner 좌우 각 20px을 요구해 320px 폭에서 잘릴 가능성이 있다. rect 측정이 필요하다.
- 설정 스위치의 52×28px control 크기는 실제 전체 터치 영역과 같다고 단정하지 않는다.
- SEED Vite 설정은 현재 light-only다. OS 다크 환경의 가독성을 확인하되 새로운 다크 테마 정책은 도입하지 않는다.
- 출석 완료 직접 URL은 성공 mutation 근거가 없으면 404다. 정상 출석 흐름 또는 명시적 테스트 fixture로만 측정한다.

## 후속 기능 기록

| 항목              | 코드 근거                                                              | 사용자 영향                         | 필요한 확인                                      |
| ----------------- | ---------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------ |
| 알림 설정 저장    | SettingsPage의 로컬 useState                                           | 화면 수명 이후 선택이 유지되지 않음 | 회원 알림 설정 조회·저장 API, 기기 권한과의 관계 |
| 팀 사진 실제 제출 | TeamAttendanceUploadPage.handleSubmit이 완료/오류 Activity로 바로 이동 | 실제 제출 없이 완료 안내 가능       | 업로드·인증 제출 API, 팀원 계약, 서버 성공 판정  |

두 기능의 개발은 이번 UI 작업에 포함하지 않는다.
