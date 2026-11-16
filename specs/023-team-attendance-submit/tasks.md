# 작업 목록: 팀 세션 사진 제출 준비

## 1단계 — 명세·계약

- [x] T001 관련 열린 이슈와 기준 커밋을 조사하고 이슈 #428을 생성한다.
- [x] T002 명세·계획·계약·검증 문서를 `specs/023-team-attendance-submit/`에 작성한다.
- [x] T003 `validation.md`에 문서 검증·변경량·리뷰 결과를 기록한다.

**게이트**: 1단계 리뷰와 2단계 진행 확인 전 제품 코드를 구현하지 않는다.

## 2단계 — US1 사진 준비

독립 검증: 제출 API 없이 native 사진을 웹에 표시·교체·취소한다.

PR 크기 제한을 위해 2a 공용 계약, 2b native·RPC 연결, 2c 개발 화면 연결로 나누어 리뷰한다. 사용자 승인으로 2a 브랜치를 최신 main에 rebase하고 2b 브랜치 `DongjaJ/team-photo-native`를 분리했다. 2b는 2a를 base로 검토한다. 최신 main rebase 후 2a 기준 커밋은 `69cafa0c`이며 기존 2a 브랜치는 이전 이력을 유지한다. PR 생성 전 base 브랜치 정렬이 필요하다.

### 2a — 공용 사진 계약

- [x] T004 최신 main의 mobile 변경과 Modern Web Guidance를 기준으로 구현 전 차이를 확인한다. 공용 스키마에는 웹 플랫폼 가이드를 적용할 항목이 없으며 UI 구현 시 검색한다.
- [x] T005 [US1] `packages/app-bridge/src/photo.ts`, `photo.test.ts`에 RPC·결과·크기 검증을 구현한다. 공개 스키마·타입만 추가하고 실제 RPC 등록은 2b에서 처리한다.

### 2b — native·RPC 연결

- [x] T006 [US1] `packages/app-bridge/src/web-photo.ts`, `web.ts`, `index.ts`에 웹 호출과 결과 검증을 연결한다.
- [x] T007 [US1] `apps/mobile/package.json`, `app.config.ts`, `pnpm-lock.yaml`에 사진 의존성·권한 설정을 추가한다.
- [x] T008 [US1] `apps/mobile/src/photo/actions.ts`, `actions.test.ts`에 취소·권한·busy·변환·정리 계약을 구현한다.
- [x] T009 [US1] `apps/mobile/src/photo/native-photo-runtime.ts`, `src/bridge.ts`에 picker·변환·임시 파일 정리를 연결한다.

### 2c — 개발 화면 연결과 실기기 검증

사용자 승인으로 `DongjaJ/team-photo-preview`를 2b 최종 커밋 `45726d9d`에서 분리했다. 이 단계의 PR base는 `DongjaJ/team-photo-native`다.

- [x] T010 [US1] `apps/web/src/pages/team-attendance-upload/`에 개발 사진 입력·미리보기·이탈 정리와 테스트를 연결한다.
- [ ] T011 [US1] `validation.md`에 품질 게이트·development build·실기기 결과를 기록하고 리뷰받는다.

## 3단계 — US2 제출 로직

- [ ] T012 [US2] `apps/web/src/features/team-attendance/model/`에 대상·선택·최종 사진 검증과 인접 테스트를 추가한다.
- [ ] T013 [US2] `submit-photo.ts`와 테스트에 생성 SDK·체크섬·격리된 PUT을 구현한다.
- [ ] T014 [US2] `use-team-attendance.ts`와 테스트에 mutation·오프라인 차단·화면 수명·결과 불명을 구현한다.
- [ ] T015 [US2] feature 공개 진입점에 필요한 입력·결과·훅만 export하고 검증·리뷰한다.

## 4단계 — US2 개발 화면 통합

- [ ] T016 [US2] 업로드 페이지에 본인 잠금·다른 팀원 선택·제출/실패 UI와 테스트를 구현한다.
- [ ] T017 [US2] 완료 페이지에 응답·제출 명단 기반 접수 정보 props와 테스트를 구현한다.
- [ ] T018 [US2] MSW에 기존 API·PUT 사례를 추가하고 fixture 실서버 전송을 차단한다.
- [ ] T019 [US2] Stackflow Activity에 개발 공급부·메모리 완료 정보·전체 팀 Activity 운영 차단을 연결한다.
- [ ] T020 [US2] 전체 흐름·접근성·계정 변경·이탈을 검증하고 validation 결과를 기록한다.

단계별 리뷰를 받고 650줄부터 PR 분리를 검토한다. branch·commit·push·PR은 별도 승인 대상이다.
