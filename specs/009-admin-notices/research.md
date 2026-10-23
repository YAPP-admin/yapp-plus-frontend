# 설계 결정과 확인 근거

## 서식 편집과 JSON

- 결정: 사용자 변경 요청에 따라 Tiptap JSON을 별도 래퍼 없이 저장한다. Markdown 의존성과 변환은 제거한다.
- 이유: 편집 문서 구조를 그대로 보존하며 지원 노드·마크를 스키마로 검증한다. 버전 변경 시 별도 마이그레이션을 검토한다.
- 확장: StarterKit 기본 기능을 사용하되 제목은 H1~H6을 사용하고 본문 링크 검증은 Tiptap 기본 정책에 맡긴다. 인용문·구분선·기울임·취소선·밑줄·끝 문단 자동 추가와 자동 링크 변환을 활성화한다. 툴바 구성은 유지한다.
- Placeholder 3.32.0을 추가한다. 빈 편집기에 안내를 표시하고 예시 본문은 넣지 않는다. CSS 가상 요소이므로 저장 문서에는 포함되지 않는다.
- 근거: [React 설치](https://tiptap.dev/docs/editor/getting-started/install/react), [StarterKit](https://tiptap.dev/docs/editor/extensions/functionality/starterkit), [Placeholder](https://tiptap.dev/docs/editor/extensions/functionality/placeholder).
- 초기 데이터 로딩 후 initialValue로 생성하며 편집 상태는 Tiptap이 관리한다. 부모 재렌더·재조회로 본문을 덮어쓰지 않는다.
- 다른 공지나 명시적 초기화는 key 변경으로 처리한다. 컴포넌트의 직접 effect 없이 접근성 속성은 useEditor 옵션에 선언한다.
- 읽기 전용 상세 표시는 상세 단계에서 별도로 구현한다. 실제 편집기는 빈 상태부터 직접 작성해 검증한다.

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
