# 구현 계획: 회원 팀 출석 운영 연결

2026-11-24 사용자 리뷰를 반영한 최종 계획이다.
명세는 [spec.md](spec.md), 계약은 [contracts/team-attendance.md](contracts/team-attendance.md),
실행 절차는 [quickstart.md](quickstart.md), 실제 검증은 [validation.md](validation.md)를 따른다.

## 구현 구조

- packages/api: 최신 OpenAPI 생성물과 기존 소비자 함수명 이관.
- features/team-attendance: 제출 대상·폼·presign·PUT·접수 Mutation.
- pages/team-attendance-upload: File·미리보기 Context와 참석자 폼.
- pages/home: 서버 유형·출석 상태 분기, 검토 중 사진 상세, 홈·앱 복귀 조회.
- stackflow: 안내에서 브리지 호출, 선택 성공 후 이동, 완료 정보·계정 수명.
- mocks/browser: 사진 쓰기를 실서버로 우회하지 않으며 별도 모의 업로드 기능은 제공하지 않는다.

기존 React·TanStack Query/Form·SEED·Stackflow·ky와 네이티브 브리지를 재사용한다.
새 의존성·브리지 계약·서버 변경은 없다.

## 승인된 변경

초기 즉시 업로드 계획은 최종 버튼 업로드로 대체했다.
생성 Query 옵션을 직접 소비하고 사진 존재로 본인 출석 가능 여부를 판단하지 않는다.
사진 선택은 클릭 콜백에서 실행하며 initialPhotoSource·Effect 실행을 사용하지 않는다.
제출 직전 재조회·명단 비교·세션 변경 방어는 추가하지 않고 서버 판정에 맡긴다.

## 마무리

1. 실제 화면 이동을 사용하는 앨범·카메라 취소·재선택·팀원 선택·제출·완료·홈 복귀 통합 테스트.
2. check·build·diff 검사와 문서 정합성 확인. 신규 실행과 Turbo 캐시를 구분한다.
3. 실제 iPhone 테스트는 사용자 요청으로 보류하고 자동 검증과 구분해 기록한다.

## 복구와 전달

운영 진입 문제가 있으면 팀 인증 진입을 차단하고 해당 기능 커밋을 되돌린다.
API 생성물 복구는 소비자를 함께 복구한다. 프런트 복구로 서버 사진을 삭제하지 않는다.
누적 변경이 PR 800줄 제한을 넘으므로 PR 생성 전 검토 가능한 단위로 분리한다.
커밋·push·PR·배포는 별도 사용자 지시 범위에서만 수행한다.
