> **이전 설계 기록 — 현재 정책 아님.** 자동 빌드·활성화 기준 설계는 폐기됐다. 현재 요구사항은 [spec.md](spec.md), 실행 절차는 모바일 README를 따른다. 아래 내용과 완료 표시는 이전 설계의 이력이다.

# 단계별 검증 절차

## 공식 CLI 중심 축소

- 기존 spec의 기능 요구사항을 유지하고 제거되는 자체 모듈과 공식 대체 기능을 대조한다.
- EAS CLI 27.4.1의 config 조회로 채널·profile·runtime 정책·공개 웹 주소를 확인한다.
- 자체 해석기·범용 ledger·별도 테스트 실행기 초안을 제거하고 기존 test 명령을 복원한다.
- 기준 파일의 초기값·필수 필드·출처 검증과 artifact 만료 후 기준 보존·긴급 중지·명시적 재개 계약을 확인한다.

## 기존 1단계 — 검사와 보고

- JS/native/버전 증가·감소, native 변경+버전 누락 PR을 비교한다.
- PR base/merge를 격리 설치하고 same-repo/fork 모두 비밀 없이 검사한다.
- native 설정·patch·도구 변경 및 부분 수집 실패도 검사한다.
- 실패·취소된 모바일 변경 뒤 문서 변경만 발생해도 누적 변경을 놓치지 않는지 확인한다.
- 같은 SHA·lockfile·도구·공개 환경·CNG 조건에서 Linux/macOS fingerprint와 보완 입력을 비교한다.
- report-only의 실제 build/update/submit 호출이 0회인지 확인한다.

## 기존 2~3단계 — 로컬 IPA와 설치 확인

- Expo/Apple 인증·macOS 도구체인을 확인하고 새 runtime의 IPA를 GitHub에서 생성한다.
- IPA 메타데이터·digest·출처와 원격 build number를 확인하고 유효한 대기 IPA는 재사용한다.
- 메타데이터·IPA 만료 및 조회 실패 시 같은 runtime의 다른 native 구성을 허용하지 않는지 검사한다.
- 지정 IPA만 수동 제출하고 정확한 TestFlight 버전을 설치해 로그인·WebView·위치를 확인한다.
- 기준 파일 PR 병합과 해당 main CI 성공 이후 최신 main을 다시 평가하고 확인 전에는 OTA가 발생하지 않는지 검사한다.

## 기존 4단계 — OTA와 복구

- main의 호환 JS 수정이 최신 활성 runtime에 적용되는지 실기기로 확인한다.
- 중복·역순·실패·취소와 외부 게시 성공 후 job 실패를 재현하고 불명확한 결과의 재게시를 막는다.
- 자동 게시 정지 → 정상 group/embedded 복구 → 실기기 확인 → 명시적 재개를 검증한다.
- rollback 이후 실제 복구 SHA가 누적 비교 기준인지 확인한다.

각 단계는 check와 해당 변경의 build/expo:doctor 결과를 제출하며 새 실행·캐시·미실행을 구분한다.
