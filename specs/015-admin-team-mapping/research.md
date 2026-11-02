# 조사와 결정 근거

## 확인 범위

2026-11-02 Figma 12개 노드의 design context와 스크린샷, 기존 회원 관리·API 생성 타입·셸을 확인했다.
Figma 세션은 `6e1b2f7b-12f7-4cab-a618-fa5226d628de`다. 기능명세서·용어 문서는 접근되지 않았고
최신 OpenAPI 원문 조회는 시간 초과였다. 아래 API 비교는 저장소 생성 계약 기준이다.

## Figma 대응표

| 화면                   | 원문                                                                                     | 구현·검증 단계            |
| ---------------------- | ---------------------------------------------------------------------------------------- | ------------------------- |
| 빌딩 전                | [683:37369](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=683-37369) | 4·12                      |
| 생성 빈 폼             | [683:37281](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=683-37281) | 6·12                      |
| 후보 검색              | [683:38158](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=683-38158) | 7·12                      |
| 후보 선택 완료         | [683:37434](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=683-37434) | 7·12                      |
| 배정 중 목록·생성 알림 | [683:37711](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=683-37711) | 5·12                      |
| 팀 메뉴                | [683:37936](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=683-37936) | 5·8·12                    |
| 상세 패널              | [683:38881](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=683-38881) | 8·12                      |
| 회원 메뉴              | [683:38588](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=683-38588) | 8·12                      |
| 미배정 일괄 선택       | [683:38427](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=683-38427) | 9·12                      |
| 확인 필요 필터         | [683:39402](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=683-39402) | 사용자 결정으로 구현 제외 |
| 확정 모달              | [683:39164](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=683-39164) | 11·12                     |
| 확정됨·알림            | [683:39496](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=683-39496) | 11·12                     |

## 결정·이유·대안

| 결정                         | 이유                                              | 채택하지 않은 대안                       |
| ---------------------------- | ------------------------------------------------- | ---------------------------------------- |
| 환경 공통 fixture와 preview  | 사용자 최종 지시: 운영에도 동일 화면·입력 제공    | 운영 준비 중 대체, 실제 조회 연동        |
| 최종 실행 비활성             | 사용자 선택: 화면·입력 먼저                       | 가짜 성공·메모리 CRUD 저장소             |
| 생성 시 팀원 1명 이상        | 사용자 선택, 생성 SDK 설명도 동일                 | Figma의 0명 생성 문구                    |
| PM·Design만 구성 경고        | 초기 인터뷰 규칙, 이후 사용자 결정으로 구현 제외  | 모든 직군·팀장·인원수 검사               |
| 팀 정보 수정 후속            | 사용자 지정 상세 패널은 팀원 관리용               | 새 수정 모달·인라인 팀명 편집            |
| 패널별 변경 예정             | 사용자 선택: 원본 목록 유지, 현재 작업에서만 검토 | 여러 팀 초안 누적·목록 임시 변경         |
| 확정 후 팀원 전용 편집       | 사용자 선택: 상태·이력 유지                       | 수정하기 비활성·새 팀 생성 허용          |
| 변경 있을 때 폐기 확인       | 사용자 선택, 기존 공지의 useBlocker 패턴 존재     | 즉시 폐기·검색마다 확인                  |
| 최소 1명·일괄 최신 선택 우선 | 인터뷰에서 명시적으로 확정                        | 기존 팀 0명 허용·기존 대상 우선          |
| 기존 셸 + Figma 본문         | 사용자 선택, 다른 페이지 영향 최소화              | 공통 셸 재작성·본문을 기존 목록으로 대체 |

## 코드 조사 결과

기존 회원 화면은 props fixture와 TanStack Form을 사용한다. 팀 매핑 때문에 기존 Member/회원 공급을 바꾸지 않는다.
AdminOverlayProvider는 pathname 기준이므로 filter/preview 변경은 별도 이탈 가드에서 처리한다.
기존 notice-leave-dialog는 useBlocker·enableBeforeUnload·SEED AlertDialog의 재사용 가능한 참고 패턴이다.
SEED Dialog·SidePanel·Menu·Select와 공용 버튼·배지가 설치되어 있어 새 UI 라이브러리가 필요 없다.
조회·생성·정보 수정·팀원 전체 교체·삭제·후보 API는 존재한다. 확정 상태·팀장·과거 기수 이력은 부족하다.
실제 전송은 expectedVersion/expectedCurrentTeamId와 충돌 응답을 다뤄야 하므로 이번에는 연결하지 않는다.
단계4의 생성 폼과 단계5의 상세 패널 의존성은 plan.md에 실제 연결 시점을 구분했다.
사이드바의 기존 회원 tab과 팀 매핑 경로를 구분한다. 모바일 메뉴에서도 이탈 취소 시 원래 화면·초안을 보존한다.
