# 데이터 모델: Stackflow 기반 웹 내비게이션

이 기능은 서버 데이터 모델을 추가하지 않습니다. 아래 모델은 현재 앱 실행 동안만 존재하는 화면·이력·플랫폼 상태를 설명합니다.

## Navigation Surface

| 필드        | 설명                                                  | 규칙                                               |
| ----------- | ----------------------------------------------------- | -------------------------------------------------- |
| `id`        | Activity 식별자                                       | 공개 route와 일대일 대응하며 변경 시 URL 표를 갱신 |
| `kind`      | `tab`, `detail`, `auth`, `input`, `error`, `complete` | kind별 transition·fallback 정책을 가짐             |
| `path`      | 공개 URL 패턴                                         | query와 dynamic segment를 명시                     |
| `fallback`  | 직접 진입 시 복원할 부모 경로                         | 기존 BackButton 정책과 일치                        |
| `swipeBack` | iOS gesture 허용 여부                                 | 입력 화면은 `false`                                |
| `title`     | document title 의미                                   | 기존 route metadata와 동일                         |

## Navigation Entry

| 필드        | 설명                               | 수명                           |
| ----------- | ---------------------------------- | ------------------------------ |
| `surfaceId` | 현재 Activity                      | 앱 실행 중                     |
| `path`      | 현재 URL path                      | URL과 Stack 상태가 일치해야 함 |
| `query`     | 세션·출석·필터 등 query            | 정의된 key만 해석              |
| `parent`    | push된 부모 entry                  | pop 시 복원                    |
| `source`    | `link`, `back`, `direct`, `system` | 검증·fallback 구분용           |

## Tab State

- `tabId`: `home | schedule | notices | my`
- `scrollOffset`: 탭 실행 중 스크롤 위치
- `filters`: Notices 또는 Schedule의 현재 필터
- `draftInput`: 해당 탭의 입력 초안
- `lifetime`: 현재 앱 실행 동안만 유지. 새로고침·재실행 시 초기화

탭 전환은 Tab State를 삭제하지 않고 panel을 `replaceStep`합니다. 상세·알림으로 push했다가 pop하면 해당 탭의 State를 다시 표시합니다.

## Platform Context

```text
platform: ios | android | web
reducedMotion: boolean
isWebView: boolean
```

`platform`은 User-Agent에서 판별하며 브리지 저장 상태에 중복 기록하지 않습니다. `reducedMotion`은 브라우저 접근성 설정을 따릅니다.

## Safe Area Contract

```text
top, right, bottom, left: finite number >= 0
```

각 inset은 CSS pixel 문자열로 변환합니다.

| Native value | 기존 CSS 변수              | SEED alias(최종 단계)     |
| ------------ | -------------------------- | ------------------------- |
| `top`        | `--safe-area-inset-top`    | `--seed-safe-area-top`    |
| `right`      | `--safe-area-inset-right`  | `--seed-safe-area-right`  |
| `bottom`     | `--safe-area-inset-bottom` | `--seed-safe-area-bottom` |
| `left`       | `--safe-area-inset-left`   | `--seed-safe-area-left`   |

같은 inset을 PageShell, AppScreen, AppBar, content, bottom navigation이 각각 다시 더하지 않습니다.
