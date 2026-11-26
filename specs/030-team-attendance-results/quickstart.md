# 팀 출석 결과 검증 안내

## 준비와 자동 검증

mise의 저장소 고정 Node.js·pnpm과 설치된 의존성을 사용한다. 제품 구현 전 관련 테스트를 작성하고
각 단계에 해당하는 파일만 먼저 실행한다. 실제 경로는 tasks.md를 따른다.

```sh
pnpm --filter @yapp-plus/web exec vitest run src/pages/home/model/team-attendance-result.test.ts src/pages/home/model/team-attendance-result-storage.test.ts src/pages/home/model/use-team-attendance-result.test.tsx
pnpm --filter @yapp-plus/web exec vitest run src/pages/home/ui/team-attendance-result-sheet.test.tsx
node --run check
node --run build
```

모델·UI 파일이 아직 없는 1단계에서는 위 기능 테스트를 실행 완료로 기록하지 않는다.
node --run check는 단계 기본 게이트, build는 제품 화면 변경 단계부터 실행한다.
문서만 바뀐 경우 Markdown 형식·로컬 링크·작업 ID·요구사항과 테스트 대응도 확인한다.

## 계층별 시나리오

| 계층      | 입력·행동                                                   | 기대 결과                                      |
| --------- | ----------------------------------------------------------- | ---------------------------------------------- |
| 결과 모델 | ABSENT와 팀 APPROVED, 본인 미선택                           | 결석 우선, 팀 승인만으로 완료하지 않음         |
| 결과 모델 | 미확정 본인 REJECTED와 같은 상태의 최신 사진                | 반려, 불일치는 보류                            |
| 결과 모델 | photo:null / imageUrl:null / 사진 오류                      | 각각 식별자 null / 기존 ID / 표시 보류         |
| 조회 조합 | 첫 페이지가 이미 본 결과이며 다음 페이지에 미표시 과거 결과 | 커서를 따라 한 건 선택 후 탐색 중단            |
| 조회 조합 | 시작 전 심사 완료 후 시작 이후 홈 복귀                      | 시작 전은 안내하지 않고 시작 후 최신 결과 안내 |
| 저장      | 203/REJECTED 저장 후 204/REJECTED 조회                      | 새 반려 표시; 동일 결과 재조회는 생략          |
| 저장      | 다른 사용자·기수, 손상 JSON·읽기/쓰기 실패                  | 범위 분리, 오류 전파 없음, 메모리 중복 방지    |
| 시트      | 반려·결석 고정 사유·제출 가능·기한 종료                     | 고정 문구 표시·재업로드·확인 전환              |
| 홈 연결   | 배경 탭·다른 Activity·늦은 조회·계정 전환                   | 화면 비활성 중 열기·기록 없음                  |
| 홈 연결   | 열기 후 배경 닫기·확인·재진입                               | 실제 표시 이력 유지, 진입당 최대 한 건         |
| 제출 연결 | 최종 접수 성공·실패·선택 취소                               | 성공만 Query 무효화, 표시 이력 삭제 없음       |

## 두 팀원의 재제출 흐름

1. 독립된 A·B 저장소에 세션 101의 203/REJECTED 표시 기록을 준비한다.
2. A가 재제출해 photoId 204가 생긴다. 양쪽의 기존 표시 기록은 삭제하지 않는다.
3. B가 PENDING을 조회하면 결과 모달을 열지 않는다. B가 이 구간을 건너뛴 경우도 별도로 확인한다.
4. B가 홈에 복귀해 204의 반려 또는 본인 확정 출결을 조회하면 해당 시트를 한 번 표시한다.
5. B의 기록만 새 값으로 갱신하고 다음 진입에서는 생략한다. A도 독립적으로 같은 규칙을 적용한다.

## 화면·실기기 확인

개발 모킹 또는 승인된 테스트 계정으로 세 Figma 상태와 기한 종료·과거 세션을 확인한다.
fixture는 개발 전용으로 제한하고 운영에 가짜 결과·접수 성공을 노출하지 않는다.
작은 화면·safe-area·가로 스크롤·다크 모드, Tab/Shift+Tab·Esc·터치 닫기, VoiceOver 제목·설명·
버튼 탐색·포커스 복귀와 reduced motion을 확인한다. 문의는 기존 채널의 브라우저·WebView 이동 규칙을 따른다.
실제 사진 제출·실기기·VoiceOver를 실행하지 못하면 자동 테스트 통과와 분리해 미검증으로 기록한다.
