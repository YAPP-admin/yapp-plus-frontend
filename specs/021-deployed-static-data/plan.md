# 구현 계획

- 실제 브랜치: DongjaJ/attendance-query-boundary → 승인된 후속 DongjaJ/deployed-static-data
- 명세: [spec.md](spec.md) / 이슈: #399

## 기술 맥락

TypeScript·React·TanStack Query·생성 Hey API ky client를 유지한다. 추가 의존성은 없다.
웹 앱 내부에서 생성 client의 kyOptions.fetch를 설정해 대상 요청만 Response로 반환한다.
생성 query/mutation 옵션·응답 변환·인증 afterResponse 훅은 유지한다.

## 헌법 점검

한국어 문서, 앱 내부 경계, 생성 코드 무수정, 고정 도구 버전, 실제 API와의 분리 원칙을 준수한다.
현재 데이터·명세 PR과 후속 연결 PR을 각각 800줄 미만으로 분리한다.

## 구현 순서와 경로

1. apps/web/src의 정적 콘텐츠 모듈: 기존 날짜·공지 fixture 재사용, endpoint별 처리와 계정별 읽음 상태.
2. 앱 Provider 경계: 설정을 검사하고 client 설정이 끝난 뒤 자식 화면을 렌더링한다.
3. 공개 콘텐츠 페이지: 정적 모드에서는 브라우저 조회 허용. 회원 화면·네이티브 인증 가드는 유지.
4. apps/web/.env.production 및 .env.example: VITE_STATIC_CONTENT로 활성화와 해제 경로 명시.
5. 생성 SDK 경유 계약 테스트, 인증 훅 보존, production 빌드·미리보기 검증.

## 복구 및 배포

VITE_STATIC_CONTENT=false로 재빌드·재배포하면 실제 API로 복구한다. DB 변경은 없다.
모드 전환은 문서 재로딩을 전제로 하며 QueryClient와 메모리 상태를 새로 만든다.
정적 모드는 개발용 MSW worker를 시작하지 않는다. 개발 worker가 남은 환경의 전환도 점검한다.
실제 배포는 main의 검증된 커밋으로 수행하며 별도 배포 승인 전에는 실행하지 않는다.
