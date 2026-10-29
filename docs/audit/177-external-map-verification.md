# 주소·지도 장애 검증 결과와 외부 확인 항목 기록

발견 ID: V03. 관련 이슈: #177.

## 이번 검증

주소 파서, 좌표 응답, 지도 로딩·실패와 폼 저장의 분리 테스트를 새로 실행했습니다. HTTP 200의
업무 오류, 필수 식별 필드 누락, 잘못된 좌표, 다른 페이지 응답과 전송 실패를 공급자 경계에
주입해 처리합니다. 지도 상태가 로딩·실패여도 사용자가 입력한 장소와 좌표를 별개로 다룹니다.
테스트의 mock 응답은 실제 공급자 장애나 브라우저 CORS 검증이 아닙니다.

## 실제 환경 검증표

| 조건                      | 확인·보존할 결과                                        |
| ------------------------- | ------------------------------------------------------- |
| 검색·좌표 키 만료/미승인  | HTTP 상태와 업무 코드 구분, 원문 키·URL 미노출          |
| 허용되지 않은 origin/CORS | 브라우저 요청 실패 안내와 입력 보존, 서버 로그와 구분   |
| SDK script 계속 pending   | 로딩 중 편집·취소 가능, 별도 timeout 정책 미추가        |
| 지도 타일 일부/전체 실패  | SDK 로드 성공과 화면 타일 성공을 혼동하지 않음          |
| offline→online            | 검색·좌표·지도 각각의 명시적 재시도와 이전 결과 표시    |
| 컨테이너 resize           | #148 반영 후 중심·마커가 보이고 저장 좌표가 바뀌지 않음 |

운영 담당자는 실제 앱 origin의 콘솔 등록, 키 만료일, 좌표 저장·이용 허용 조건을 확인하고
날짜·대상 환경·결과만 기록합니다. 공개 JavaScript 키라는 이유만으로 비밀 유출을 주장하지
않으며 허용 조건도 추정하지 않습니다. 키 원문과 인증 정보는 검증 기록에 남기지 않습니다.
실패 시 설정을 복구한 뒤 같은 항목을 재검증합니다. 문서에 있는 과거 브라우저 결과를 이번
재실행으로 계산하지 않습니다.

관련: #148, #150, #153, #154. 각각의 수정 PR을 적용한 최종 통합 브라우저 확인이 남습니다.

## 근거와 완료 판정

기준: `e0d4bf92f007c075b53adc0938d9abe5e8ba4572`.

- [apps/admin/src/pages/sessions/model/location/juso-search.ts](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/admin/src/pages/sessions/model/location/juso-search.ts)
- [apps/admin/src/pages/sessions/model/location/coordinates.ts](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/admin/src/pages/sessions/model/location/coordinates.ts)
- [apps/admin/src/pages/sessions/ui/session-location-map.tsx](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/admin/src/pages/sessions/ui/session-location-map.tsx)
- [specs/010-session-location/final-validation.md](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/specs/010-session-location/final-validation.md)

이번 PR은 확인된 현재 상태와 후속 검증 기준을 기록합니다. 미실행 항목을 통과로 처리하지 않으며,
이슈는 실제 완료 조건을 충족할 때 닫습니다. dots 보고서의 재현은 기존 검증이며 아래 신규 확인과
구분합니다.
