# Implementation Plan: 세션 시작일·종료일 분리

**Branch**: `028-session-date-range` | **Date**: 2026-11-27 | **Spec**: [spec.md](spec.md)

## Summary

관리자 세션 일정의 단일 날짜를 시작일·종료일로 확장한다. 폼 모델은 두 날짜와 시간을 함께 검증하고, API 경계·목록 카드·출석 상세의 세션 시간 변환을 새 계약으로 맞춘다. API 생성 파일은 백엔드 OpenAPI 원본이 갱신된 계약과 동기화해야 한다.

## Technical Context

**Language/Version**: TypeScript, React 19

**Primary Dependencies**: TanStack Form, Zod, TanStack Query, Hey API generated client

**Storage**: 백엔드 세션 API, 프론트엔드 Query cache

**Testing**: Vitest, Testing Library, `node --run check`

**Target Platform**: 관리자 웹 브라우저

**Project Type**: 모노레포 웹 애플리케이션·공용 API 계약 패키지

**Performance Goals**: 기존 세션 폼·목록의 응답성과 정렬 동작 유지

**Constraints**: ISO 날짜 문자열은 한국 시간 기준의 날짜 값으로 보존하고 `Date` 시간대 변환을 사용하지 않는다. 기존 작업 중인 변경은 건드리지 않는다.

**Scale/Scope**: 관리자 세션 생성·수정·목록 및 출석 상세의 세션 일정 변환, 관련 모델·UI 테스트

## Constitution Check

_GATE: PASS before Phase 0 research._

- 최소 범위: 관리자 세션 일정 경계와 직접 소비자만 변경한다.
- 공용 계약: 생성된 API 타입·Zod·Faker·fixture를 동일 계약으로 갱신하고 앱의 변환 경계에서 검증한다.
- 생성 코드: 백엔드 OpenAPI 원본이 현재 저장소에 없으므로 현재 작업에서는 계약 산출물을 맞추고, 실제 반영 시 원본 명세 재생성을 후속 조건으로 기록한다.
- 검증: 모델·폼·페이지 소비자 테스트와 `node --run check`를 실행한다.
- 보안·복구: 인증·비밀·배포 정책은 변경하지 않는다.

## Phase 0: Research Summary

- `session-form.ts`는 현재 `date`와 시간의 같은 날 비교만 지원하므로 날짜 범위 비교가 필요하다.
- `CreateSessionRequest`와 `AdminSessionResponse`는 현재 `date` 단일 계약이다. 관리자 생성·수정·목록의 계약 필드를 `startDate`·`endDate`로 변경한다.
- 관리자 출석 상세는 `AdminSessionResponse`를 사용하므로 시작일·종료일을 결합해 `startsAt`·`endsAt`를 만든다.
- ISO 날짜·시간은 문자열 정규화 규칙을 유지한다. 날짜 차이 계산이나 브라우저 시간대 변환은 필요하지 않다.

## Project Structure

```text
apps/admin/src/pages/sessions/
├── model/session-form.ts
├── model/session-api-model.ts
├── model/*test.ts
└── ui/session-form.tsx, session-card.tsx, *test.tsx
apps/admin/src/features/session-management/service/api.ts
packages/api/src/generated/
├── types.gen.ts
├── zod.gen.ts
└── @faker-js/faker.gen.ts
packages/api/src/mocks/fixtures.ts
specs/028-session-date-range/
```

**Structure Decision**: 관리자 페이지의 폼·변환·표시 책임을 유지하고, API 패키지는 세션 요청·응답 계약과 개발용 mock 산출물을 함께 갱신한다.

## Complexity Tracking

| Violation                  | Why Needed                                                                    | Simpler Alternative Rejected Because                            |
| -------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 생성 계약 산출물 직접 갱신 | 현재 작업 저장소에 OpenAPI 원본이 없고 프론트 타입·mock 검증을 먼저 맞춰야 함 | `any` 단언으로 API 계약을 우회하면 실제 요청·응답 검증이 분리됨 |
