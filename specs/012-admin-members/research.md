# 조사와 결정 근거

## 저장소 확인

- 2026-10-29 git fetch origin 후 origin/main 93b74f4와 현재 HEAD가 같고 작업 트리는 깨끗했다.
- 회원 목록은 탭·검색·필터만, 명단 업로드는 준비 중 화면만 존재한다.
- docs/admin-development.md의 선택적 FSD와 기존 AdminOverlayProvider·SEED·vanilla-extract를 사용한다.
- packages/api/src/mocks/handlers.ts는 요청마다 seed 107로 Faker 응답을 다시 생성한다. CRUD 저장 상태는 유지하지 않는다.
- 생성 SDK에는 가입 심사·팀 조회가 있지만 전체 회원 목록·정보 수정·명단 업로드는 없다.
- MemberMembershipResponse.status와 joinedAs는 string이며 회원 role은 PLAYER/OB다. 화면 권한과 임의로 합치지 않는다.
- 이전 원격 OpenAPI 재조회는 시간 초과였다. API 지원 여부는 현재 저장소에 반영된 계약 기준이다.
- gh issue list --state open 조회에서 같은 목적의 회원 화면 구현 이슈는 없었다. #81은 포괄적 UI 이슈로 자동 연결하지 않았다.

## 디자인과 적용 경계

아래 노드는 계획 대화에서 Figma design context·스크린샷으로 확인했다. 구현 단계에는 해당 노드를 다시 확인한다.

| 참조                                                                                     | 이번 적용                                                                   |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [683:40468](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=683-40468) | 행 목록·직군·검색·업로드 진입. 팀 매핑 이동 버튼 제외                       |
| [683:39720](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=683-39720) | 매핑 후 팀 표시                                                             |
| [683:41108](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=683-41108) | 팀 선택·인원·팀장 표시                                                      |
| [223:26805](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=223-26805) | 가입 대기 빈 화면. 탐색은 사이드바로 통일                                   |
| [223:27824](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=223-27824) | 수정 모달. 배경 카드 목록은 적용하지 않음                                   |
| [223:31101](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=223-31101) | 활동회원·정회원·운영진 권한 선택                                            |
| [223:28911](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=223-28911) | 업로드·양식 안내                                                            |
| [223:29179](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=223-29179) | 미리보기·오류·중복 선택. 하이픈 없는 전화번호도 허용하도록 사용자 결정 적용 |

## 결정과 대안

| 결정                         | 이유                                                               | 채택하지 않은 대안                               |
| ---------------------------- | ------------------------------------------------------------------ | ------------------------------------------------ |
| 화면 우선·읽기 전용 fixture  | 사용자 선택. 없는 API를 발명하지 않고 입력·파일 검증을 완성        | 별도 모의 저장소·임의 API                        |
| 기존 Faker/MSW 재사용은 후속 | 생성 계약이 있어야 SDK/handler가 생성됨. 현재 이번 핵심 API는 없음 | 개발 화면에서 가입 심사 DTO를 전체 회원으로 가장 |
| 저장 버튼 비활성             | 실제 결과가 유지되지 않는데 성공처럼 보이지 않게 함                | 로컬 저장 성공·가짜 완료 알림                    |
| 순수 props와 화면 상태       | API 전환 시 공급부만 바꾸고 불필요한 네트워크 상태를 만들지 않음   | fixture용 Query·가짜 타이머                      |
| Papa Parse 5.7.0             | CSV 인용부호·줄바꿈·빈 행을 브라우저에서 처리                      | CSV 수동 분할·불필요한 XLSX/XLS 지원             |
| 기존 셸 유지                 | 회원 하위 탐색 외 다른 메뉴 변경은 범위 밖                         | Figma 전체 사이드바 재작성                       |

Papa Parse 버전·브라우저 파일 파싱 기능은 [공식 문서](https://www.papaparse.com/docs)에서 확인했다.
6a에서 버전 고정·pnpm 호환·인용부호와 줄바꿈이 있는 실제 CSV 입력을 검증하며 공급망 보호는 끄지 않는다.
사용자의 전화번호·기수·비활동·덮어쓰기 선택은 spec.md가 기준이다. 임의로 새로운 운영 정책을 확정하지 않는다.
