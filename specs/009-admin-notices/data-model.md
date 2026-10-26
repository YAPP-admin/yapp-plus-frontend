# 데이터 모델

모든 타입과 Zod 스키마는 admin 내부에 둔다. 공용 API 계약의 회원 enum을 변경하지 않는다.

| 개념          | 필드·관계                                                                                                          | 불변 조건                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Notice        | id, category, title, bodyDocument, createdAt, audience, submission, attachments, readAtByMemberId, unansweredCount | id 고유, 작성일 수정 금지, 질문 수 0 이상                      |
| Member        | id, name, cohort, job, membership                                                                                  | 합성 명단만 사용; 직군은 PM/Design/Mobile/Web/Server/AI Native |
| Audience      | 일반: all/active/regular/completed, 제출: all 또는 jobs 배열                                                       | 제출은 활동회원만, all과 개별 직군 배타, 중복 제거·1개 이상    |
| Submission    | deadlineAt, method 또는 null                                                                                       | 제출 종류에서만 존재; method는 name과 url 입력 모두 필요       |
| Attachment    | id, name, blob (mimeType·size는 Blob에서 파생)                                                                     | JPG·PNG·WebP, 각 10MiB 이하, 합계 5개 이하                     |
| ReaderRow     | member, readAt 또는 null                                                                                           | 현재 대상마다 정확히 한 행, 원본 공지에서 파생                 |
| NoticeSummary | readCount, unreadCount, targetCount, readPercentage                                                                | 목록·상세가 동일 함수 사용; 대상 0이면 비율 0                  |

## 입력과 저장 경계

- category는 session/submission/operation이며 일반 공지는 session·operation이다.
- 제목은 trim 후 1~60자다. 본문은 지원 문서의 텍스트가 공백뿐이면 거절하며 빈 문단도 동일하다.
- 본문은 편집기가 생성한 JSON을 그대로 저장하며 공백뿐인 본문만 거절한다. 문서 구조·서식·속성은 중복 검증하지 않는다. 본문 링크에 별도 URL 검사를 추가하지 않으며 Tiptap 기본 링크 처리를 유지한다.
- 날짜·시간은 한국 시간 입력을 검증한 뒤 UTC ISO 문자열로 저장한다. 브라우저 현지 시간대를 사용하지 않는다.
- 과거 마감도 유효하다. now >= deadlineAt이면 마감, 이전이면 한국 날짜 차이로 D-day/D-N을 계산한다.
- 폼 입력의 빈 문자열·선택 상태와 저장 모델을 분리한다. 일반 종류로 저장하면 제출 전용 필드는 제거한다.
- 파일 목록 검증은 먼저 총개수를 검사한다. 초과 묶음은 전부 거절하고 나머지 경우 파일별 형식·크기·디코딩을 검사한다.
- 일반 대상의 active/regular/completed는 명단 구분과 일치하는 회원, all은 명단 전체다.

## 상태 전이

1. 생성: 검증 성공 후 id·createdAt 생성, 대상 모두 readAt=null, unansweredCount=0으로 원자적으로 저장한다.
2. 수정: 기존 id·createdAt·질문 수를 유지한다. 이전/새 대상 교집합만 읽음 기록을 보존하고 새 대상은 null로 만든다.
3. 제외 대상의 읽음 기록은 제거한다. 재추가하면 null이다. 본문·제목만 변경하면 기존 기록을 유지한다.
4. 삭제: 확인 후 성공 시 제거한다. 없는 공지 수정·삭제는 not-found 오류로 처리하며 새 공지를 만들지 않는다.
5. 실패: 저장소·캐시·기존 첨부는 그대로 유지하고 입력 초안도 보존한다.
6. 취소: 초안만 폐기한다. 화면 소유 객체 URL을 해제하며 저장된 Blob은 삭제하거나 바꾸지 않는다.

읽은 회원은 최초 확인 시각 내림차순, 미열람은 한국어 이름순이다. 동률은 id로 안정 정렬한다.
읽음 비율은 반올림한 정수다. 목록은 createdAt 내림차순, 동률은 id로 안정 정렬한다.

본문은 Tiptap `JSONContent`를 그대로 저장한다. Document·Paragraph·Text·H1~H6·HardBreak·BulletList·OrderedList·ListItem·CodeBlock·Blockquote·HorizontalRule과 Bold·Link·Code·Italic·Strike·Underline 마크만 허용한다. 지원 서식은 편집기 확장이 관리하며 저장 단계에서는 빈 본문만 검사한다.
