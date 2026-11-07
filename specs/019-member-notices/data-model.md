# 데이터 모델

공개 네트워크 타입은 `@yapp-plus/api/generated`가 단일 원천이다. 별도 DTO나 API schema를 복제하지 않는다.

| 개체   | 기존 타입·필드                                                                                                 | 화면 규칙                                                  |
| ------ | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 요약   | UserPostListItemResponse: postId, type, title, createdDate, daysUntilDeadline                                  | ID는 링크에서 문자열, OPERATION은 기타                     |
| 페이지 | UserPostListResponse: totalPostCount, items, nextCursor                                                        | null 커서면 종료, 총 개수를 받은 목록 길이로 대체하지 않음 |
| 상세   | UserPostDetailResponse: postId, type, title, contentMarkdown, createdDate, assignment, images, readCount, read | 읽음은 서버 값, assignment=null이면 제출 안내 없음         |
| 과제   | UserPostAssignmentResponse: deadlineDate, positions, submissionUrl, submissionLinkText                         | 날짜만 표시, 대상을 추측해 재분류하지 않음                 |
| 이미지 | UserPostImageResponse: imageKey, filename, contentType, sizeBytes, displayOrder, readUrl, readUrlExpiresAt     | 순서대로 표시, 실패 시 상세 재조회                         |

## 검증과 변환

- 생성 Zod를 확장해 소비 int64의 안전한 정수 범위 확인 후 number로 변환한다. postId는 양수, count·size·displayOrder는 음수가 아니어야 한다.
- 실제 날짜와 날짜/시간 형식을 검증한다. daysUntilDeadline는 음수를 허용하고 상세 날짜는 서울 기준이다.
- 커서는 null 또는 비어 있지 않은 문자열이다. 반복 커서는 페이지 연결 계층에서 검출한다.
- 구조 오류는 조회 오류다. 잘못된 링크는 텍스트, 이미지 URL·지원되지 않는 MIME은 대체 안내로 처리한다.
- HTTP(S) 절대 URL만 허용하고 URL 사용자 정보는 허용하지 않는다. 기존 첨부 MIME 계약을 따르고 임의 크기 제한은 추가하지 않는다.
- responseTransformer의 검증 반환값을 사용해 bigint가 Query 캐시나 JSX에 남지 않게 한다.

## 상태와 관계

- 목록: 초기 로딩 → 성공/빈 결과/초기 오류. 추가 로딩·추가 오류·백그라운드 오류는 기존 항목과 분리한다.
- 홈: 단일 페이지 → 현재 서울 주간 필터 → 최대 3개. 무한 목록과 캐시 형태를 공유하지 않는다.
- 상세: 초기 로딩 → 성공/접근 불가/일시 오류. 재조회 POST_NOT_FOUND이면 기존 본문을 숨긴다.
- 읽음: 미확인 → 저장 중 → 확인 완료. 저장 오류는 미확인, 204 뒤 조회 오류는 확인 완료 유지.
- 작업 소유자는 userId·sessionId·postId와 화면 수명이다. tokenVersion 갱신은 계정 전환이 아니다.
- 별도 영속 저장·migration은 없다. 앱 종료 후 상태는 다시 서버에서 받는다.
