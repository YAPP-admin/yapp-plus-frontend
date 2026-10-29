# 프로덕션 렌더링·탐색 검증 (V01 · #175)

## 이번 실행 환경

2026-10-29, 웹 제품 코드 기준 `7898ee6`, 고정 Node/pnpm의 Next production 빌드를
`next start --port 3100`으로 실행했다. 개발 서버의 HMR 동작을 production 증거로 쓰지 않았다.
Chrome의 실제 탐색과 반환된 HTML을 확인했으며 dots의 과거 검증과 별개다.

| 항목                                  | 이번 결과                                                |
| ------------------------------------- | -------------------------------------------------------- |
| 제품 13개 라우트 직접 HTTP 요청       | 모두 200, 고유 title 및 h1이 서버 HTML에 있음            |
| /dev/routes                           | production 404                                           |
| 홈 → 출석 내역                        | 링크로 이동, 제목·상세 레이아웃 표시                     |
| 브라우저 Back → Forward               | 홈·출석 내역 URL과 제목 복원                             |
| 출석 내역 새로고침                    | 같은 제목과 준비 화면 표시                               |
| 출석 내역 → 출석 규칙 → 화면 뒤로가기 | 출석 내역 복귀                                           |
| /settings 직접 진입 → 화면 뒤로가기   | fallback /my로 복귀                                      |
| CSS 320px 출석 내역·규칙              | 내역 화면 scrollWidth=innerWidth=320, 뒤로가기 조작 가능 |
| 위 탐색의 Chrome console              | 수집된 error/warn 0건                                    |

실제 CSS 폭을 evaluate로 측정했다. 브라우저 viewport override 값과 CSS 폭이 달라 조정한 뒤
320px를 확인했으며 검사 종료 후 override를 해제했다. 로컬 증거는 작업 공간
`.context/175-production-320.jpg`에 저장했다. 이미지 자체는 저장소에 포함하지 않는다.

## 이 결과로 보장하지 않는 범위

Back/Forward 성공은 BFCache 적중 증거가 아니다. pageshow.persisted·navigation restore를
관측하지 않았으며 BFCache·빠른 연속 입력·첫 다크 테마의 초기 paint·실제 노치 safe-area·
iOS WebView·VoiceOver/NVDA·터치는 이번에 검증하지 않았다. 준비 화면의 탐색 성공을 실제
회원 인증·API 데이터·필터 구현의 성공으로 확대하지 않는다.

이 브랜치에는 #156 Safe Area 수정과 #163 history 상태 보존 수정이 포함되지 않는다.
각 PR의 단위 검증을 통합된 브라우저 검증으로 대신하지 않으며 병합 후 같은 절차를 다시 확인한다.

## 남은 수용 절차

1. 수정 통합 SHA의 production 빌드에서 실제 브라우저 Back/Forward와 BFCache 관측을 분리한다.
2. 공지 query 포함 목록→상세→복귀와 연속 탐색 중 마지막 목적지·이력 entry를 확인한다.
3. 첫 문서 로드부터 다크 테마를 기록하고 hydration 전후 색·레이아웃 이동을 확인한다.
4. 실제 iOS WebView에서 지연 브리지 준비·회전·safe-area, 보조 기술의 제목·포커스 안내를 확인한다.
5. 각 실행의 브라우저/OS·SHA·캐시 상태·기대/실제 결과와 재현 증거를 기록한다. 실패하면 가장
   가까운 계층의 회귀 테스트와 수정 PR을 추가한다.

전체 수용 조건은 아직 충족하지 않아 #175는 Refs로 연결한다. 이번 PR은 실행 가능한 검증 결과와
남은 범위를 남기는 Draft이며 빈 확인표를 완료로 표시하지 않는다.
