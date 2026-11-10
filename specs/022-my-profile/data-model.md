# 데이터 모델과 표시 규칙

## 서버 프로필

`UserProfileResponse`의 여섯 키는 모두 필수다. 필드 누락과 명시적인 null을 구분한다.

| 필드             | 서버 타입       | 사용                                       |
| ---------------- | --------------- | ------------------------------------------ |
| userId           | int64           | 본인 계정 식별자, 표시하지 않음            |
| name             | string          | API 이름을 그대로 표시, 세션 fallback 없음 |
| membershipStatus | enum 또는 null  | 회원 상태 표시                             |
| generationId     | int64 또는 null | 소속 DB ID, 기수 표시 번호로 사용하지 않음 |
| generationNumber | int32 또는 null | null이면 `—`, 값이 있으면 `{값}기`         |
| position         | enum 또는 null  | 직군 표시                                  |

생성 Zod 스키마는 신뢰 경계 검증에만 사용한다. 조회 결과에는 원본 JSON을 유지하고
UI에는 생성 응답 타입에서 파생한 표시 값만 전달한다. DTO를 독립 수기 타입으로 복제하지 않는다.
회원 상태는 Staff 권한이나 심사 상태가 아니며, 프런트엔드에서 권한을 추정하지 않는다.

## 표시 매핑

| membershipStatus | 표시      |
| ---------------- | --------- |
| PLAYER           | 활동회원  |
| OB               | OB        |
| COMPLETED_MEMBER | 수료회원  |
| DEFERRED         | 유예 회원 |
| null             | —         |

| position  | 표시      |
| --------- | --------- |
| PM        | PM        |
| DESIGN    | Design    |
| WEB       | Web       |
| MOBILE    | Mobile    |
| ANDROID   | Android   |
| IOS       | iOS       |
| SERVER    | Server    |
| AI_NATIVE | AI Native |
| null      | —         |

알 수 없는 enum이나 필수 키 누락은 검증 오류다. null 소속을 활동회원 등으로 추정하지 않는다.
매핑은 생성 enum을 기준으로 누락을 타입 검사에서 확인하고 각 값을 순수 모델 테스트로 검증한다.

## 조회 수명

- 최초 요청: 네 항목 `—` → 검증 성공 시 프로필, 실패 시 오류·재시도.
- 성공 후 재조회: 기존 값 유지 → 성공 시 교체, 실패 시 이전 값과 오류 안내 유지.
- 소속 없음: 성공 상태이며 이름 이외 세 항목은 `—`. 재시도가 필요한 오류가 아니다.
- 로그아웃·계정 전환: 기존 인증 경계가 프로필 캐시와 화면을 폐기한다. 이전 응답도 새 계정에 표시하지 않는다.
- 화면 복귀: 기존 30초 stale 정책과 복귀 훅을 사용한다. 조회 상태를 별도 state로 복제하지 않는다.
