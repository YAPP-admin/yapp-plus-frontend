# 작업 목록: main 자동 OTA와 수동 로컬 빌드

**현재 정책**: [spec.md](spec.md), [plan.md](plan.md). 이전 R001–R018 계획은 대체됐다.

- [x] S001 사용자가 승인한 간소화 정책과 복구 절차를 명세·계획에 반영한다.
- [x] S002 PR의 Expo 지문·보완 입력·버전 규칙과 테스트를 연결한다.
- [x] S003 공식 Expo Action으로 main 성공 CI 이후 OTA 게시를 연결하고 기준 파일을 제거한다.
- [x] S004 앱 README에 수동 local build·지정 IPA 제출·중지·복구 절차를 기록한다.
- [x] S005 현재 리뷰의 check·build·doctor·workflow 검증 결과를 제출하고 사용자 리뷰를 받는다.
- [ ] S006 원격 Linux/macOS·fork CI, EXPO_TOKEN·필수 검사 설정, 실제 TestFlight OTA를 검증한다.
- [ ] S007 다음 리뷰에서 GitHub macOS 수동 빌드·IPA artifact·지정 IPA 제출을 연결한다.
- [ ] S008 실제 서명·설치·동일 runtime OTA·다른 runtime 미수신·rollback을 검증한다.

실제 외부 실행·계정 설정과 미검증 동작은 완료로 표시하지 않는다. 다음 리뷰 단계는 사용자 확인 후 진행한다.
