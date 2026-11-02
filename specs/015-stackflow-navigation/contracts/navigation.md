# 내비게이션 계약

## 공개 URL 계약

회원 웹은 다음 URL을 공개 계약으로 유지합니다.

| 영역    | URL                         | 화면 역할             | 직접 진입 fallback      |
| ------- | --------------------------- | --------------------- | ----------------------- |
| 탭      | `/`                         | Home                  | 루트                    |
| 탭      | `/schedule`                 | Schedule              | 루트                    |
| 탭      | `/notices`                  | Notices               | 루트                    |
| 탭      | `/my`                       | My                    | 루트                    |
| 추가    | `/alerts`                   | Alerts                | Home                    |
| 인증    | `/login`                    | Login                 | 없음                    |
| 인증    | `/login/error`              | Login error           | Login                   |
| 인증    | `/signup`                   | Signup 입력           | Login                   |
| 인증    | `/signup/status`            | Signup status         | Login                   |
| 인증    | `/signup/complete`          | Signup complete       | 명시된 Home 이동        |
| 인증    | `/signup/unregistered`      | Signup unregistered   | Login 또는 명시된 이동  |
| 상세    | `/notices/:noticeId`        | Notice detail         | Notices                 |
| 상세    | `/my/attendance`            | Attendance            | My                      |
| 상세    | `/my/attendance/rules`      | Attendance rules      | Attendance              |
| 상세    | `/settings`                 | Settings              | My                      |
| 출석    | `/attendance/complete`      | Attendance complete   | `/?attendance=attended` |
| 팀 출석 | `/team-attendance/upload`   | Upload 입력           | Home                    |
| 팀 출석 | `/team-attendance/error`    | Upload error          | Home                    |
| 팀 출석 | `/team-attendance/complete` | Upload complete       | Home                    |
| 오류    | `/error`                    | Login error 호환 진입 | Login                   |
| 오류    | `/notices` error boundary   | Notices error         | Notices                 |
| 공통    | `/_not-found`               | NotFound              | 루트                    |
| 개발    | `/dev/routes`               | 개발 경로 목록        | 개발 환경에서만         |

## query 계약

| key          | 허용 값                            | 소비 화면          | 새로고침 수명 |
| ------------ | ---------------------------------- | ------------------ | ------------- |
| `session`    | `team` 또는 미지정                 | Home               | URL에 유지    |
| `attendance` | `attended` 또는 미지정             | Home               | URL에 유지    |
| `mode`       | `active`, `history`, 기타는 기본값 | Attendance         | URL에 유지    |
| `empty`      | `true`                             | Alerts             | URL에 유지    |
| `error`      | `true`                             | Login, Team upload | URL에 유지    |

정의되지 않은 query는 화면을 깨뜨리지 않고 기존 기본 상태를 사용합니다.

## BackButton/defaultHistory 계약

- 내부 이력이 있으면 현재 Activity를 pop합니다.
- 내부 이력이 없으면 표의 직접 진입 fallback으로 replace합니다.
- `Signup`, `Signup status`, `Team upload`는 iOS swipe를 차단하지만 AppBar의 명시적 back은 유지합니다.
- `Notice detail` 직접 진입은 Notices를 부모로 복원합니다.
- `Alerts` 직접 진입은 Home을 부모로 복원합니다.
- `Attendance complete`의 fallback은 `/?attendance=attended`로 query 의미를 유지합니다.

## Android Native contract

Android Native WebView는 다음 순서를 사용합니다.

1. WebView history 또는 Stackflow entry가 있으면 `webView.goBack()`을 호출합니다.
2. root entry이고 웹이 더 이상 뒤로 갈 수 없으면 Android의 root back 정책(종료 또는 네이티브 상위 화면)을 적용합니다.
3. deep link로 상세가 열린 경우 웹은 `defaultHistory`에 부모 Activity를 복원합니다.
4. User-Agent에는 표준 Android token을 유지하고, 웹은 `android` 문맥으로 전환합니다.

이 저장소는 Android Native 코드를 소유하지 않으며 위 계약과 검증 시나리오만 제공합니다.
