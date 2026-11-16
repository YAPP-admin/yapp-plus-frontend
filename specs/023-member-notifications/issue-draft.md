# feature: 회원 알림함과 iOS 푸시 연결

## 작업 배경

회원 웹의 샘플 알림 목록과 로컬 설정 토글을 실제 알림함·현재 기기의 수신 선택에 연결한다.
Android 구현과 기존 서버 계약을 참고하며 React Native Firebase만 사용한다.

## 작업 내용

- [ ] 받은 알림의 내용·날짜·추가 조회·재시도와 공지 상세 이동을 제공한다.
- [ ] iOS 푸시 등록·수신·탭과 설치별 ON/OFF·시스템 권한을 연결한다.
- [ ] 합의한 서버 성공 후 로그아웃 정책을 적용하고 계정 변경 경합을 방어한다.
- [ ] 구버전 앱·실패 상태·접근성과 실제 기기 수신을 검증한다.

## 완료 조건

- [ ] 단계별 사용자 리뷰와 PR당 추가·삭제 합계 800줄 미만을 지킨다.
- [ ] check/build와 모바일 변경의 expo:doctor·iOS 빌드를 통과한다.
- [ ] 실제 iPhone development/TestFlight의 세 앱 상태 × 두 푸시 종류를 검증한다.
- [ ] 새 실행·Turbo 캐시·미검증 항목을 구분해 기록한다.

## 참고 사항

- 담당자: DongjaJ. 라벨·milestone 없음. 이 초안으로 [#417](https://github.com/YAPP-admin/yapp-plus-frontend/issues/417)을 생성했다.
- 계획: specs/023-member-notifications/plan.md, 검증: quickstart.md.
- #412는 완료된 선행 작업이며 실제 API 전환을 다시 구현하지 않는다.
- Firebase는 설치 직전 최신 안정 버전 확인 후 정확히 고정한다. 현재 세 패키지 latest는 27.1.0이다.
- 제외: 관리자 발송·Android 변경·읽음 배지·Web Push·로컬 예약·액션 버튼·이미지 알림.
- 단계: 명세 → 알림 데이터 → 화면 → 네이티브 기반 → 로그아웃 정책 → 설정 → 푸시 탐색·실기기.
