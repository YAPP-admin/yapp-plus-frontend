# 설계 결정과 확인 근거

## 서식 편집과 Markdown

- 결정: Tiptap의 React·StarterKit·Markdown 확장을 사용하고 지원 서식만 활성화한다.
- 이유: 사용자가 선택한 시각적 편집과 Markdown 저장을 함께 제공한다. Monaco는 코드 편집 중심이라 같은 작성 경험을 위해 별도 구현이 필요하다.
- 대안: 원문 textarea·미리보기는 확정 범위와 다르다. 별도 HTML 변환기를 병용하면 왕복 변환 경계가 늘어난다.
- 근거: [Markdown 설치](https://tiptap.dev/docs/editor/markdown/getting-started/installation), [React 설치](https://tiptap.dev/docs/editor/getting-started/install/react), [StarterKit](https://tiptap.dev/docs/editor/extensions/functionality/starterkit).
- Markdown 확장은 Beta이므로 지원 서식의 의미 보존을 4a에서 검증한다. 문자열 완전 일치 대신 문서 구조·텍스트·링크 의미를 비교한다.
- SSR 초기 렌더에서는 편집기를 생성하지 않는다. 외부 값 복원은 변경 콜백 재발생과 커서 초기화가 없도록 구분한다.
- 패키지 후보 3.32.0은 앞선 조사 기준이다. 3단계에서 registry·peerDependencies·보안 정책을 재확인하며 임의 업그레이드하지 않는다.

## 모의 데이터와 조회

- 결정: sessions의 개발 브라우저 가드·동적 import 패턴을 재사용한다. Query는 hydration 후 활성화한다.
- 이유: SSR 요청 사이에 공유되는 모의 상태와 프로덕션 실행을 막는다. 탭 내 모듈 상태로 이동 유지·새로고침 초기화를 만족한다.
- 대안: localStorage는 새로고침 초기화와 맞지 않고 실제 HTTP 어댑터는 현재 요구에 사용되지 않는다.
- 근거: `apps/admin/src/pages/sessions/model/sessions.ts`, `session-queries.ts`, `apps/admin/src/providers.tsx`.
- 목록·상세·읽음은 같은 저장 공지를 기반으로 계산하며 성공 후 관련 Query를 무효화한다. 실패 때 캐시를 먼저 바꾸지 않는다.

## 첨부와 임시 상태

- 결정: 저장소는 Blob/File을 보관하고 화면이 객체 URL을 생성·해제한다. 저장 모델에 객체 URL을 영구 식별자로 넣지 않는다.
- 이유: 화면 unmount 시 URL을 해제해도 저장된 Blob으로 다음 화면에서 다시 만들 수 있다.
- 대안: 전역 URL 참조 카운터는 불필요하다. base64 영속화와 서버 업로드는 범위 밖이다.
- 저장소는 성공 시에만 첨부 배열을 교체한다. 입력 초안과 저장 배열은 분리해 취소·실패가 원본을 바꾸지 않는다.

## 테스트와 UI 사례

- 결정: 기존 Vitest·Testing Library로 도메인·Query·폼을 검증하고 실제 브라우저 검증을 별도로 기록한다.
- 이유: happy-dom은 한글 조합·이미지 디코딩·기본 이탈 경고·스크린 리더를 입증하지 못한다.
- 대안: 검증 프레임워크를 새로 추가하지 않는다. 필요한 브라우저 시나리오는 quickstart에 남긴다.
- Storybook 앱에서 admin을 import하지 않는다. 11a에 admin 자체 설정과 로컬 사례를 추가하고 기존 catalog 버전을 재사용한다.
- 3단계에서 의존성 설치 후 기본 품질 게이트와 빌드를 통과했다. 결과는 quickstart의 검증 기록에 둔다.
