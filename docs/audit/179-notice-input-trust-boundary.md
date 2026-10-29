# 공지 외부 입력의 검증 경계와 연결 전 기준 기록

발견 ID: V05. 관련 이슈: #179.

## 현재 경계

`noticeDocumentSchema`는 `z.custom<JSONContent>()`와 본문 텍스트 존재 여부를 사용합니다.
주석도 Tiptap이 만든 JSON 전용이라고 명시합니다. 외부 JSON의 노드 종류·속성·중첩 깊이를
검증하는 파서가 아니므로 실제 API 응답에 그대로 적용하면 안전한 오류 처리를 보장하지
못합니다. 현재는 내부 편집기와 합성 저장소를 사용하며 실행 가능한 XSS는 확인하지 않았습니다.

첨부 선택 단계의 개수·형식 검사와 읽기 실패 처리는 서버 응답 검증과 다릅니다. 응답에서
파일명·URL·크기·type을 받는다면 선택 단계의 File 검사를 통과했다고 간주할 수 없습니다.

## API 연결 전 완료 기준

1. 서버와 문서 포맷·허용 노드/mark/URL·최대 크기/깊이를 합의합니다. 버전 필드는 합의 없이
   추가하지 않습니다. 경계 파서는 unknown에서 시작해 malformed JSON을 화면 오류로 처리합니다.
2. 첨부 metadata와 URL 계약을 검증하고 크기·type 정책을 서버 검사와 맞춥니다. 파일 확장자나
   브라우저 MIME만으로 실제 이미지 디코딩이 성공한다고 판단하지 않습니다.
3. 실제 디코딩 실패·손상 파일·초과 크기·읽기 실패에서 입력과 순서를 유지하고 중복 첨부가
   발생하지 않는지 확인합니다. 업로드 네트워크 모킹은 #170과 함께 검증합니다.
4. 실제 한글 IME 조합 중 Enter, 링크 입력 Enter(#142), 터치 툴바 선택과 VoiceOver/NVDA의
   이름·오류 연결을 확인합니다. happy-dom 이벤트는 실제 IME 검증을 대체하지 않습니다.

현재 형식을 일괄 변환하거나 sanitization 규칙을 추측해 추가하지 않습니다. 외부 API 연결은
Spec Kit에서 신뢰 경계·실패 화면·복구를 정하고 malformed fixture를 포함해 검증합니다.
기존 내부 문서 테스트 통과를 외부 입력 검증 완료로 표현하지 않습니다.

관련: #44, #108, #142, #145, #170.

## 근거와 완료 판정

기준: `e0d4bf92f007c075b53adc0938d9abe5e8ba4572`.

- [apps/admin/src/features/notice-management/model/notice-document.ts](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/admin/src/features/notice-management/model/notice-document.ts)
- [apps/admin/src/features/notice-management/model/notice.ts](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/admin/src/features/notice-management/model/notice.ts)
- [apps/admin/src/features/notice-management/model/notice-attachments.ts](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/admin/src/features/notice-management/model/notice-attachments.ts)
- [apps/admin/src/features/notice-management/ui/notice-editor.tsx](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/admin/src/features/notice-management/ui/notice-editor.tsx)

이번 PR은 확인된 현재 상태와 후속 검증 기준을 기록합니다. 미실행 항목을 통과로 처리하지 않으며,
이슈는 실제 완료 조건을 충족할 때 닫습니다. dots 보고서의 재현은 기존 검증이며 아래 신규 확인과
구분합니다.
