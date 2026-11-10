# 조사와 결정

## 확인 근거

- 웹 기준 commit: `7bd77d09035d8c1a317469bc4d03caedb25955f1`.
- [백엔드 프로필 문서](https://github.com/YAPP-admin/yapp-plus-backend/blob/e2c2612a8652dc9c76f6ce7b6c26e97dbe8348c6/APIDOC.md): 본인 조회·소속 선택·오류 계약.
- [Android 표시 문구](https://github.com/YAPP-admin/yapp-plus-android/blob/855e111f34d2e6df1f23a5ea72682081a82fd8a3/feature/main/my/src/main/res/values/strings.xml): 회원 상태·직군 표기.
- 배포 `https://44nk4mnqi7.execute-api.ap-northeast-2.amazonaws.com/v3/api-docs`는 대화 중 최초 30초 타임아웃 후 재조회 성공. 프로필 GET과 필수·nullable 계약을 확인했다. 실서버 인증 조회를 실행했다는 의미는 아니다.
- 이번 1단계에서는 생성기를 실행하지 않았다. 2단계에서 입력을 새로 고정하고 해시와 생성 결과를 기록한다.

## 표시 출처와 실패 처리

**결정**: 이름은 API만 사용하고 최초 로딩·실패에는 `—`를 표시한다. 재조회 실패는 같은 계정의 마지막 성공 데이터를 유지한다.
**이유**: 사용자가 세션 이름 보완 대신 API 이름만 표시하도록 선택했다. 서버가 선택한 소속을 화면이 재계산하지 않는다.
**대안**: 세션 이름 fallback은 제외했다. 프로필 실패로 전체 마이페이지를 가리는 방식도 출석 이용 요구와 맞지 않는다.

## Query와 검증

**결정**: `pages/schedule/model/schedule-query.ts`처럼 생성 옵션에 `responseValidator`를 전달한다.
**이유**: `packages/api/src/generated/client/client.gen.ts`는 검증을 기다리되 반환값을 버리고 원본 JSON을 반환한다. Zod의 int64 bigint 변환을 별도 number 변환 없이 격리할 수 있다.
**대안**: 수동 fetch·새 queryFn 래퍼·전역 SDK 검증 활성화는 기존 요청·인증·AbortSignal 또는 다른 소비 계약에 불필요한 영향을 준다.
생성 결과가 달라질 수 있으므로 2단계에서 validator 실행 위치와 원본 반환을 다시 확인한다.

## 인증·복귀·개발 경계

**결정**: `features/auth` Provider의 apiOptions와 계정 경계, `shared/lib/screen-activity`를 재사용한다.
**이유**: 기존 Query 기본 staleTime은 30초이고 화면 복귀 훅은 stale일 때 `refetch({ cancelRefetch: false })`한다. 강제 매회 갱신 정책을 추가하지 않는다.
**대안**: 프로필 전용 인증 래퍼·전역 store·별도 이름 캐시는 중복 상태를 만들므로 제외한다.
운영 정적 콘텐츠 모드는 공개 콘텐츠용이다. 프로필은 인증된 조회 또는 명시적인 개발 MSW 조건에서만 요청한다. 개발 검증은 `VITE_STATIC_CONTENT=false`, `VITE_API_MOCKING=true`로 실행해야 worker가 시작된다.

## 생성 호환성과 검토 단위

**결정**: 기존 생성 설정을 그대로 사용하고 operation을 HTTP 경로·메서드로 식별한다.
**이유**: 신규 `find_2` operation으로 숫자 접미사가 달라질 수 있어 타입 검사만으로 잘못된 연결을 충분히 찾지 못한다.
**대안**: 프로필만 수동 생성하거나 불필요한 원본 경로를 삭제해 명세를 축소하는 방법은 최신 계약의 재현성을 해치므로 제외한다.
실제 변경량은 생성 전에는 확정할 수 없다. 생성 후 모든 파일을 계산하고 크기 제한에 따라 분리한다.
