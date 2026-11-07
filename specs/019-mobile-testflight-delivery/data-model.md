# 배포 기록과 상태 모델

## 공통 식별자

- 대상: 기존 EAS project ID + `testflight` 채널 + `ios`; EAS branch ID는 최초 조회한 연결을 고정해 검증한다.
- 호환성 키: 앱 runtime + native fingerprint + 공개 native 빌드 설정 digest + fingerprint 정책 버전.
- 정책 버전은 계산 도구·preset·수집 검증·별도 digest 규칙을 식별하며 변경 시 새 기준 검증이 필요하다.
- 작업 키: 대상 + 동작 + runtime + 소스 SHA + 동작별 대상 ID. 재시도는 같은 키를 사용한다.
- 명시적 rebuild는 별도 요청 ID를 포함한다. 작업 재시도가 rebuild 요청을 자동으로 새로 만들지 않는다.

## 불변 기록

GitHub Deployment의 `payload`를 수정하지 않는다. 요청과 결과를 서로 다른 기록으로 추가한다.
각 기록은 `schemaVersion: 1`, `kind`, `operationKey`, `sourceSha`, 대상 정보와 원본 기록 ID를 가진다.
`ref`는 정확한 SHA, `auto_merge: false`; 성공 status는 `auto_inactive: false`로 기록한다.
과거 status 이력에 상태를 저장하지 않고 성공 결과 payload와 현재 status를 조회한다.

| kind                 | 추가 정보                                                                 | 의미                                                    |
| -------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------- |
| operation            | 동작·입력·기준 기록 ID                                                    | 외부 변경 전에 저장하는 의도; 완료나 성공을 뜻하지 않음 |
| initialization       | 초기화 요청 ID·대상·정책 버전                                             | 최초 도입 표식; 별도 설정에 이 기록 ID를 고정           |
| operation-resolution | 원본 operation ID·미실행 확인 증거·사유                                   | 운영자가 외부 미실행을 확인한 실패/취소 종결            |
| build-result         | 호환성 키·버전·build number·profile·도구체인·artifact ID/digest·만료 시각 | IPA 생성·검증 성공                                      |
| submit-result        | build ID·외부 제출 ID·업로드 결과                                         | Apple 업로드 완료; 설치·활성화 아님                     |
| activation           | build ID·submit ID·설치 확인·검증 증거 링크                               | 운영자가 해당 빌드의 설치·핵심 기능 확인                |
| update-result        | activation ID·Update group ID·EAS branch·작업 키                          | 해당 소스의 OTA 게시 성공                               |
| pause / resume       | 사유·기준 activation ID                                                   | 자동 처리 정지 또는 검증 후 재개                        |
| rollback-result      | 대상 runtime·복구한 group/build ID·실제 복구 소스 SHA·외부 결과 ID        | 복구 완료; pause를 해제하지 않음                        |

모든 ID·SHA·digest·enum은 신뢰 경계에서 검증한다. 저장소·workflow·프로젝트·앱 식별자를 교차 확인한다.
원시 Expo config, 환경 변수 목록, 개인 정보, 자격 증명은 저장하지 않는다.

## 상태 산출

- 빌드 상태: build-result → submit-result → activation. 실패는 다음 상태를 만들지 않는다.
- 활성 기준은 성공한 activation만 조회한다. 최신 update나 일반 deployment가 이를 대체하지 않는다.
- 같은 runtime에 서로 다른 호환성 키를 가진 성공 빌드를 허용하지 않는다. 최초 성공 빌드부터 키를 예약한다.
- 활성 runtime은 증가만 허용한다. 새 runtime 준비 중에는 현재 main 소스를 구버전 runtime으로 게시하지 않는다.
- 마지막 반영 SHA는 해당 activation의 build 또는 이후 update/rollback-result의 실제 소스 SHA다. 과거 게시 성공 이력과 구분하고 다른 runtime과 섞지 않는다.
- rollback 후 이전 게시 이력만으로 skip하지 않는다. 재개 승인 ID를 새 게시 작업 키에 포함해 복구 상태부터 누적 변경을 재평가한다.
- artifact 만료는 대기 IPA의 재빌드 사유다. 이미 활성화한 빌드의 호환성 기준은 만료되지 않는다.
- report-only의 미초기화 빈 조회만 bootstrap으로 표시한다. 최초 빌드 전에 initialization 기록과 외부 설정의 ID를 고정한다.
- 초기화 후 빈 조회·기준 ID 불일치·조회 실패·누락·상충은 blocked다. pagination을 끝까지 처리하고 설정만 지워 재초기화하지 않는다.
- 운영 모드의 최초값은 report-only다. 단계별 설정은 report-only/build-only/active이며 pause가 항상 우선한다.
- runtime activation은 install 검증 사실이다. active 운영 모드 설정까지 완료되어야 실제 자동 OTA를 게시한다.

## 불명확한 외부 결과와 복구

외부 변경 전 operation이 없으면 실행하지 않는다. 미완료 operation은 후속 게시보다 먼저 정리한다.
같은 작업 키와 대상·runtime·SHA의 유일한 외부 결과가 확인되면 result 기록을 복구한다.
조회가 실패하거나 결과가 0개·복수이면 자동 재시도하지 않는다. 운영자가 외부 상태를 확인해야 한다.
수동 제출의 불명확한 종료도 자동 재업로드하지 않는다. 빌드 실패로 build number가 비는 것은 정상이다.
운영자가 외부 미실행을 입증하면 operation-resolution을 남겨 실패/취소로 종결하고 명시적 재시도만 허용한다.
외부 성공은 성공 result로 복구한다. 계속 불명확하면 종결하거나 재시도하지 않는다.
rollback은 같은 공통 잠금 안에서 pause를 먼저 성공 기록한 뒤 실행한다. 실패해도 pause를 유지한다.
resume는 복구 확인·수정 사항 증거와 최신 main의 CI·호환성을 검사한다. 문제 소스를 그대로 자동 재게시하지 않도록 운영자가 후보를 명시 승인한다.
승인 ID로 새 게시 작업 키를 만들고 실제 복구 소스부터 재평가한다. 미실행 확인 후 재시도는 원래 키와 시도 번호로 연결한다.
