# 설계 결정과 출처

확인일: 2026-10-29. [명세](spec.md)와 [계약](contracts/attendance-api.md)은 사용자 합의를 우선한다.

## 결정과 대안

| 결정                            | 이유                                             | 채택하지 않은 대안                        |
| ------------------------------- | ------------------------------------------------ | ----------------------------------------- |
| 독립 모델과 명시적 adapter 변환 | 화면의 출결·보고·시간 구간이 DTO와 일치하지 않음 | API enum/type 직접 import                 |
| 상태 유지 모의 서비스 우선      | 화면 전체를 검토하고 미확정 계약을 분리          | 부족한 응답 필드를 타입 단언으로 보완     |
| Query 조회와 초안 분리          | 마감 전 수정·이탈·부분 실패를 구분               | 캐시를 편집 원본으로 직접 변경            |
| 마감 한 번으로 확정             | 사용자 확인 및 실제 close API 의미               | 저장 버튼, 별도 최종 마감 단계            |
| 세션 데이터 최소 추출           | 세션/출석 페이지의 실제 공유 데이터 필요         | 다른 page 내부 import 또는 새 공용 패키지 |
| 검수 대기 마감 차단             | dev의 409 계약을 모의 기본값으로 활용            | 검수하지 않은 제출 사진을 자동 결석 처리  |
| 명찰·출결 분리                  | 사용자 결정과 백엔드가 동일                      | 명찰 확인 시 출석 자동 변경               |

기존 기술 스택과 모의 구현 범위에서 설계 선택을 확정했다. 실제 연동에 필요한 정책 차이는
모의 기본값과 구별하여 계약 문서에 남겼으며, 백엔드 합의가 완료된 것으로 보지 않는다.

## 저장소 근거

- [관리자 개발 가이드](../../docs/admin-development.md): 레이어 경계, 공개 진입점, 생성 코드 원칙.
- [현재 출석 화면](../../apps/admin/src/pages/attendance/ui/attendance-page.tsx): 세 가지 화면 자리 표시자.
- [출석 검색 모델](../../apps/admin/src/pages/attendance/model/attendance-search.ts): 기존 part 필터 유지.
- [세션 모델](../../apps/admin/src/features/session-management/model/session.ts): 세션 종류·일정과 독립 모델의 기존 사례.
- [생성 API 타입](../../packages/api/src/generated/types.gen.ts), [SDK](../../packages/api/src/generated/sdk.gen.ts): 현재 계약 기준.
- [기존 API 모의 계획](../011-openapi-msw/plan.md): 공용 생성 mock과 상태 유지 화면 mock의 역할 구분.

## 피그마 참고와 적용 차이

제공된 18개 노드를 기준으로 화면 범위를 정리했다. 화면 문구와 정책은 아래 사용자 수정 사항을 반영한다.

| 노드                                                                                     | 참고 화면      | 적용 사항                          |
| ---------------------------------------------------------------------------------------- | -------------- | ---------------------------------- |
| [682-22119](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=682-22119) | 일반 세션 진행 | 명단·코드·요약                     |
| [682-18421](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=682-18421) | 출결 수정      | 공결 편집 제외                     |
| [682-21245](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=682-21245) | 명찰 확인      | 출석 자동 변경 문구·동작 제외      |
| [682-22779](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=682-22779) | 개인 이력      | 보고와 실제 변경 이력 구분         |
| [682-21913](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=682-21913) | 사전 보고      | 유형은 지각·조퇴·결석만            |
| [682-11497](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=682-11497) | 마감 확인      | 출석 마감, 미정→결석 안내          |
| [682-12846](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=682-12846) | 마감 상태      | 잠금 및 마감 취소                  |
| [682-13515](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=682-13515) | 최종 확인      | 별도 2차 마감 단계로 구현하지 않음 |
| [690-52](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=690-52)       | 누적 점수      | 경고는 40점 미만만                 |
| [690-565](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=690-565)     | 감점 기준      | 일반/무단 구분을 명세에 반영       |
| [690-50](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=690-50)       | 회원 점수 상세 | 읽기 전용 근거                     |
| [682-27803](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=682-27803) | 팀 검수 대기   | 미제출과 구분                      |
| [682-26492](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=682-26492) | 전체 팀        | 전체 팀 명단 기준                  |
| [682-23477](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=682-23477) | 개별 결석      | 팀 승인과 개인 결정 우선순위       |
| [682-24603](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=682-24603) | 사진 연속 검수 | 대기 항목 이동·판단 초안           |
| [682-24228](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=682-24228) | 팀 마감 확인   | 검수 대기 차단 계약                |
| [682-25033](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=682-25033) | 팀 마감 결과   | 미정 0, 실제 상태로 요약 갱신      |
| [682-25751](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=682-25751) | 팀 최종 확인   | 별도 최종 마감 제거                |

## 백엔드 근거

아래 링크는 dev 소스의 고정 SHA다. 실제 배포 버전과 같다는 의미는 아니다.

- [AdminAttendanceController](https://github.com/YAPP-admin/yapp-plus-backend/blob/b52fce938e1679287160b1c2ba5eebb601b89c99/api/src/main/kotlin/backend/yappplus/attendance/AdminAttendanceController.kt): 조회·수정·명찰·마감·취소와 오류.
- [PostgresAdminAttendanceAdapter](https://github.com/YAPP-admin/yapp-plus-backend/blob/b52fce938e1679287160b1c2ba5eebb601b89c99/infra/src/main/kotlin/backend/yappplus/attendance/persistence/PostgresAdminAttendanceAdapter.kt): 명찰 독립, 사진 대기 차단, 자동 결석, 취소 복구.
- [AttendanceScore](https://github.com/YAPP-admin/yapp-plus-backend/blob/b52fce938e1679287160b1c2ba5eebb601b89c99/domain/src/main/kotlin/backend/yappplus/attendance/AttendanceScore.kt): 보고 시각과 감점 계산. 공결 0점이 일반 결석과 다르므로 후속 정책으로 분리.
- [TeamAttendancePhotoController](https://github.com/YAPP-admin/yapp-plus-backend/blob/b52fce938e1679287160b1c2ba5eebb601b89c99/api/src/main/kotlin/backend/yappplus/attendance/TeamAttendancePhotoController.kt): 관리자 사진 목록·판단.
- [TeamAttendancePhotoUseCases](https://github.com/YAPP-admin/yapp-plus-backend/blob/b52fce938e1679287160b1c2ba5eebb601b89c99/application/src/main/kotlin/backend/yappplus/attendance/TeamAttendancePhotoUseCases.kt): 사진·회원 응답과 URL 수명.

확인된 핵심 차이: 취소 시 결과 복구, 마감 후 수정 허용, 생성 코드의 시각 필드·팀사진 API·409 누락.
관리자 전체 이력·누적 점수와 보고 적격성은 현재 조회 응답만으로 구성할 수 없다.
