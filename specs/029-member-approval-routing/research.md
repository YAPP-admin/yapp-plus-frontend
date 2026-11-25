# 조사와 결정

## 근거

- 2026-11-26 사용자 대화: 로그인 응답 사용, 추가 버튼 제거, 기존 뒤로가기, 기존 세션·구버전 유지.
- HEAD fe8d2f6a의 AuthActions는 로그인·가입 모두 toCredentials 후 바로 establish한다.
- SessionManager는 establish와 refresh의 commit에서 SecureStore를 기록한다. 제한 결과가 이 경로에 들어가면 안 된다.
- 웹 SignupPage는 native 성공 시 SignupComplete로, Login의 NativeAuthRedirect는 SIGNED_IN이면 Tabs로 이동한다.
- SignupStatusPage는 정적 화면이며 승인 조회·뒤로가기 정리는 상위 Activity가 담당해야 한다.
- origin/main a7967564에는 문의 링크 수정이 있으므로 후속 구현 때 이전 링크를 덮어쓰지 않는다.
- 열린 #329는 인증 복구, #531은 관리자 심사다. 이번 목적의 열린 이슈는 없었다.

## API 확인

[서버 OpenAPI](https://44nk4mnqi7.execute-api.ap-northeast-2.amazonaws.com/v3/api-docs)를 2026-11-26 조회했다.
로컬 원문은 `.context/approval-openapi.json`, SHA-256은
`54cf54829b07865f023f8d2e45012da115a7e0a530fda2f3a88fbb5acdc98391`이다.
UserResponse.reviewStatus는 필수이며 PENDING·APPROVED·REJECTED 또는 null이다.
명세는 null을 “Member가 없는 과거 계정”으로 설명하며 승인으로 간주하지 않는다.
UserProfileResponse에는 reviewStatus가 없다. 이 작업은 해당 응답을 변경하거나 호출하지 않는다.
이 확인은 공개 명세 조회이며 실제 계정 로그인·가입 성공을 검증한 결과가 아니다.

## 결정과 대안

| 결정                              | 이유                                       | 제외한 대안                          |
| --------------------------------- | ------------------------------------------ | ------------------------------------ |
| 로그인·가입 응답에서만 확인       | 사용자 최종 선택, 별도 서버 변경 불필요    | 내 정보 조회·자동 폴링               |
| 승인 제한 결과는 정상 세션과 분리 | 저장·업무 요청·푸시 등록의 조기 실행 방지  | 토큰을 저장한 뒤 웹에서만 가림       |
| 대기 ID만 native 메모리에 보관    | 같은 앱 실행 중 같은 계정의 승인 전환 판별 | 영속 대기 이력·토큰 저장             |
| 기존 저장 형식·refresh 유지       | 사용자 선택대로 기존 자동 로그인 보존      | 일괄 로그아웃·승인 표시 마이그레이션 |
| 기존 뒤로가기와 확인 Dialog       | Figma 구성 유지와 재로그인 경로 확보       | 추가 하단 버튼·강제 앱 종료          |
| 구버전 앱 허용·웹 선배포          | 구버전 누락 필드만 NONE 정규화해 독립 배포 | 강제 업데이트·새 버전 검사 체계      |

## 구현 전 확인 항목

미정 제품 정책은 없다. 서버 상태별 실응답, 실기기 재실행, 배포 조합은 후속 검증 대상이다.
실제 계정 승인·거절 변경, 테스트 로그인, 배포는 이 문서 작성으로 실행하지 않는다.
새 외부 라이브러리는 없으며 기존 모듈과 계약을 조사했으므로 별도 기술 선정 조사는 추가하지 않는다.
