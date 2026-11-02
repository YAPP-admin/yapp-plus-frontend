# 검증 가이드

## 현재 기준선 재현

저장소 루트에서 고정 도구를 사용합니다.

```sh
pnpm install --frozen-lockfile
node --run check
node --run build
```

기대 결과:

- `check`가 모든 workspace의 lint·typecheck·test를 통과합니다.
- 웹 테스트는 25개 파일, 86개 테스트를 통과합니다.
- `build`가 Next.js route 22개를 생성합니다.

## Stage 1 peer 검증

```sh
pnpm --filter @yapp-plus/web exec seed compat
pnpm --filter @yapp-plus/web exec tsc --noEmit
pnpm install --frozen-lockfile
pnpm --filter @yapp-plus/web list --depth 1
```

기대 결과:

- SEED 공식 snippet에 비호환 peer 경고가 없습니다.
- Stackflow core/react 1.x와 `@seed-design/stackflow@2.1.0`이 계획된 범위로 해석됩니다.
- `packages/ui` package와 lockfile에 Stackflow 직접 의존성이 생기지 않습니다.

## Stage 2 호환성 셸

```sh
node --run dev:web
```

검증 순서:

1. `/`에서 `/notices`로 이동합니다.
2. 공지 항목에서 `/notices/:noticeId`로 이동하고 AppBar back으로 목록에 돌아옵니다.
3. 상세 URL을 새 탭에서 직접 열고 `defaultHistory`가 Notices 부모를 복원하는지 확인합니다.
4. browser back·refresh·lazy loading 실패를 확인합니다.
5. Home·Notices·Detail 세 Activity가 초기 번들에 모두 포함되지 않는지 확인합니다.

실패 시 Stage 2를 중단하고 Next 구조를 유지합니다.

## 이후 단계 공통 경로

| 단계 | 최소 검증                                                                 |
| ---- | ------------------------------------------------------------------------- |
| 3    | iOS·Android·Web transition, reduced-motion, focus                         |
| 4    | 네 탭 왕복 상태·history와 Alerts 부모 복원                                |
| 5    | 공지 필터·스크롤·직접 URL·unknown ID                                      |
| 6    | 출석·팀 업로드 입력 swipe 차단과 fallback                                 |
| 7    | 로그인·가입·오류 직접 진입과 title                                        |
| 8    | iOS 노치·홈 인디케이터·회전 및 bridge 변수                                |
| 9    | Next import/config 검색, Vite production build                            |
| 10   | Vercel Preview, 공개 URL 직접 진입·새로고침, 최종 check/build/expo doctor |

## 수동 WebView 검증 기록 규칙

- iOS는 실제 Simulator 또는 등록 기기에서 edge swipe, safe area, 회전을 캡처합니다.
- Android는 Native 팀이 `canGoBack`, `webView.goBack()`과 root back 결과를 계약 문서와 함께 확인합니다.
- reduced-motion은 OS 설정과 브라우저 `prefers-reduced-motion` 두 경로에서 확인합니다.
- 화면 변경이 있는 단계는 `.context/`에 캡처를 저장하고 리뷰 메시지에 링크합니다.
