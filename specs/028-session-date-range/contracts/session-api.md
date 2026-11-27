# 관리자 세션 날짜 범위 계약

경로는 기존 `/api/admin/generations/{generationId}/sessions` 생성·수정·목록 API를 유지한다.

## Request

`CreateSessionRequest`의 일정 필드는 다음과 같다.

```json
{
  "startDate": "2026-11-20",
  "endDate": "2026-11-21",
  "startTime": "23:00:00",
  "endTime": "01:00:00"
}
```

`startDate`와 `endDate`는 필수 ISO 날짜이며, 종료 일시는 시작 일시보다 늦어야 한다. 나머지 이름·유형·장소 필드는 기존 계약을 유지한다.

## Response

`AdminSessionResponse`는 `date` 대신 `startDate`와 `endDate`를 제공한다. 목록 카드와 수정 폼은 두 값을 그대로 사용한다.

## Error behavior

유효하지 않은 날짜 범위는 기존 입력 오류 응답을 사용한다. 날짜 충돌 오류 코드는 기존 API 정책을 유지한다.

## Regeneration dependency

이 문서는 프론트가 기대하는 계약이다. 실제 배포 전 백엔드 OpenAPI 원본을 같은 필드로 갱신하고 `packages/api` 생성 명령으로 산출물을 재생성해야 한다.
