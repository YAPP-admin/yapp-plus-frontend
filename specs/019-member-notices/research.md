# 조사와 결정

## 확인 기준

- 프런트엔드: `32f4c3d0f52e4b43bcc34326267b497fc2a17feb`. fetch한 origin/main과 동일하고 기존 사용자 변경은 없다.
- [Android](https://github.com/YAPP-admin/yapp-plus-android/tree/2b837e3cb21762c6a73f1db205be6a3ef2749a97)의 NoticeRemoteDataSource·BoardViewModel·BoardNoticeMapper·BoardMarkdown·HomeNoticeViewModel을 확인했다.
- [백엔드](https://github.com/YAPP-admin/yapp-plus-backend/blob/27ccce69b99166e4cd63275cd1e17bf14f37e886/api/src/main/kotlin/backend/yappplus/post/UserPostController.kt)의 목록·상세·읽음 계약을 대조했다.
- [배포 OpenAPI](https://44nk4mnqi7.execute-api.ap-northeast-2.amazonaws.com/v3/api-docs)는 최초 503 후 재요청 200이었다. 최초 실패 원인은 확인하지 못했으며 서버 장애로 단정하지 않는다.
- 2026-11-07 수신 원본 SHA-256: `b85939c8e61d4d78c49c70cc616f5b20dd5e4cb6902d13238e9e517cd312a41a`, 64개 path·76개 operation.
- 기존 generate 명령의 출력만 임시 경로로 바꾸고 저장소 oxfmt 설정을 적용했다. 생성 디렉터리와 diff 0줄이다. 실제 회원 조회·읽음 PUT 검증은 아니다.

## 선택과 대안

| 결정                           | 이유                                                  | 제외한 대안                      |
| ------------------------------ | ----------------------------------------------------- | -------------------------------- |
| list1·detail2·acknowledge 사용 | 최신 명세와 SDK가 같고 GET은 읽음을 바꾸지 않는다.    | 수동 fetch·생성 파일 수정        |
| 웹 내부 member-notice 공유     | 목록·홈의 실제 소비가 있고 다른 앱은 사용하지 않는다. | 새 패키지·페이지 간 import       |
| OPERATION을 기타로 표시        | Android와 기존 웹 문구가 같다.                        | 서버 enum에 ETC 추가             |
| 서울 주간 첫 페이지 최대 3개   | Android와 같고 별도 주간 API가 없다.                  | 전체 페이지 다운로드             |
| 204 후 상태 확정·상세 재조회   | 멱등 저장이며 취소 API가 없다. 인원은 서버 값이다.    | 로컬 토글·낙관적 인원 증가       |
| 생성 Zod 확장·number 정규화    | int64 schema는 bigint이나 SDK 타입은 number다.        | 무검증 단언·전역 validation 변경 |

## Markdown 선택

[react-markdown](https://github.com/remarkjs/react-markdown) 10.1.0을 catalog에 고정한다.
React 요소·CommonMark·요소별 정책 설정이 읽기 전용 화면에 맞는다. 의존성이 많은 점은 비용이며 번들은 도입 시 실측한다.
[markdown-to-jsx](https://github.com/quantizor/markdown-to-jsx)는 일반 의존성 없는 유력 대안이지만 이번에는 CommonMark 기반 구성을 선택했다.
[marked](https://marked.js.org/)는 출력 HTML의 별도 정화가 필요하고 markdown-it은 HTML/토큰에서 React 연결을 추가해야 한다.
[Tiptap Markdown](https://tiptap.dev/docs/editor/markdown)은 향후 관리자 입력 변환 후보지만 현재 관리자 본문은 JSON이며 회원 웹에 편집기를 도입하지 않는다.
skipHtml과 HTTP(S) URL 정책을 적용하고 raw HTML·GFM·수식·코드 하이라이터는 추가하지 않는다. 성능 우위를 측정한 결정은 아니다.

## 승인과 도구 상태

사용자는 전체 범위와 단계별 리뷰, 1단계 문서·작업 목록·이슈 초안 작성을 요청했다.
열린 #179·#142·#140은 관리자 본문/편집/캐시 범위로 회원 연동과 목적이 다르다.
초안은 `.context/member-notices-issue.md`에 두고 생성은 별도 승인 후 수행한다.
Spec Kit extension 설정이 없어 before/after hooks는 없다. 템플릿 resolver·setup-plan/setup-tasks를 사용하고 브랜치는 유지한다.
조사 에이전트의 읽기 전용 검토로 강제 GET 복구·mutation callback 격리·커서 초기화·URL 정규화·주간 캐시 경계를 계약에 보완했다.
