# 배포 자동화 입력·출력 계약

본 계약은 후속 구현 대상이며 제품 API·브리지 타입을 바꾸지 않는다.

## 판정

입력은 검증된 source SHA, 운영 모드, 활성 기준, 해당 runtime 이력, 변경 범위, 호환성 검사 결과다.
출력은 JSON 객체로 `decision`, `reason`, `sourceSha`, `runtime`, `baselineId`, `operationKey`를 가진다.
알 수 없는 값은 null로 명시하며 성공을 추정하지 않는다. 로그 설명은 한국어, 식별자는 원문을 사용한다.

| decision           | 조건                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| bootstrap-required | 첫 기준 없음; 보고 전용이면 안내, 빌드 허용 후 최초 빌드 경로로 전환   |
| blocked            | CI·버전·수집·설정·이력 검증 실패 또는 pause·미완료 외부 작업           |
| skip               | 최신성 상실, 이미 성공한 작업, 또는 누적 모바일 영향 없음              |
| build              | 새 runtime의 호환 IPA 없음; 최초 기준도 명시적 bootstrap 조건으로 허용 |
| await-activation   | 호환 IPA 생성 후 수동 제출·설치 확인·활성화를 기다림                   |
| update             | 현재 소스의 runtime이 최신 활성 기준과 일치하고 모든 호환성 검사 통과  |

검증 실패가 있으면 skip보다 먼저 blocked로 처리한다. 새 runtime 필요 여부는 단순 파일 영향보다 먼저 검사한다.
report-only는 판정 결과를 표시할 뿐 외부 변경하지 않는다. build-only는 IPA 생성까지만 자동 수행한다.

## 호환성 입력 정규화

- native digest는 상속을 해석한 base/testflight 프로필·선언된 목표 도구체인·native 입력 allowlist를 정렬된 canonical 표현으로 계산한다.
- 파일 경로는 프로젝트 상대 경로로 정규화한다. OS 절대 경로와 runner 임시 경로는 키에 포함하지 않는다.
- 앱 버전·자동 증가 buildNumber는 별도 검사하며 submit 전용 필드는 digest에서 제외한다. allowlist 변경은 정책 버전 변경이다.
- Linux PR은 목표 도구체인을 사용하고 macOS 빌드는 실제 설치 버전이 그 선언과 일치하는지 검사한다.

## 수동 workflow

workflow 정의 자체는 main에서 실행한다. 입력 SHA를 shell에 직접 삽입하지 않고 인자로 전달·검증한다.

| action            | 입력                                                           | 허용 조건                                                                                   |
| ----------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| evaluate          | source_sha                                                     | 현재 main의 정확한 SHA이며 성공한 push CI 존재                                              |
| initialize        | source_sha                                                     | 최초 build-only 도입; 기존 초기화/배포 기록 없음, 생성 ID를 별도 설정에 고정한 뒤 빌드 허용 |
| resolve-operation | operation_record_id, evidence_url                              | 외부 미실행 확인만 실패/취소 종결; 성공이면 result 복구, 불명확하면 거부                    |
| rebuild           | source_sha                                                     | 검증된 main 이력의 SHA, 활성 버전보다 낮지 않음, 동일 runtime 키 충돌 없음                  |
| submit            | build_record_id, artifact_id                                   | 승인된 workflow의 IPA·digest·출처 일치, 제출 미완료                                         |
| activate          | build_record_id, submit_record_id, verified=true, evidence_url | 설치·핵심 기능 확인, 현재보다 높은 runtime 또는 동일 기준의 재시도                          |
| pause             | reason                                                         | 자동 변경을 정지하는 지속 기록 생성                                                         |
| rollback          | runtime, mode, good_group_id                                   | 최신 활성 runtime, mode는 republish-good-group 또는 embedded                                |
| resume            | source_sha, verified=true, evidence_url                        | 복구·수정 사항 확인, 최신 main의 성공 CI·호환성 검사, 해당 후보 재게시 명시 승인            |

`republish-good-group`에만 good_group_id가 필요하다. project·branch·iOS·runtime이 같은 정상 group이어야 한다.
이를 `update:rollback`의 인자로 오해하지 않고 고정 CLI의 `update:republish --group`에 대응시킨다.
embedded 복귀는 runtime과 플랫폼을 명시한다. CLI flags는 4단계에서 고정 버전 help·대역으로 검증한다.
관리자의 수동 실행이 해당 작업 요청이다. 추가 GitHub Required reviewer는 도입하지 않는다.

## 설정과 결과 요약

- GitHub `mobile-testflight` Environment: main 전용, EAS 프로젝트에 접근하는 `EXPO_TOKEN` 필요.
- 기존 EAS 서명·제출 자격 증명을 사용하며 등록·갱신은 배포 실행과 구분한다. secret 값을 조회·출력하지 않는다.
- `MOBILE_DELIVERY_MODE`는 report-only/build-only/active; 미설정은 report-only다. pause 이력은 이 설정보다 우선한다.
- 최초 EAS branch ID를 `MOBILE_TESTFLIGHT_BRANCH_ID`로 저장한다. 실행 시 채널 연결이 다르면 차단한다.
- 최초 기록 ID는 `MOBILE_DELIVERY_INITIALIZATION_ID`로 고정한다. 미설정은 자동 빌드를 막고 운영자가 초기화 중단 여부를 확인한다.
- Job Summary: 검증 SHA·판정·사유·runtime·기준 빌드·작업 키·외부 결과 링크·다음 수동 작업.
- 토큰·원시 config·전체 환경 변수는 Summary나 artifact에 기록하지 않는다.
