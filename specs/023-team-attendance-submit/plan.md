# 구현 계획: 팀 세션 사진 제출 준비

**작성일**: 2026-11-12 | **명세**: [spec.md](spec.md) | **이슈**: [#428](https://github.com/YAPP-admin/yapp-plus-frontend/issues/428)

## 요약

기존 웹 화면과 생성 `presign`·`submit`을 재사용한다. 사진 입력은 iOS, 제출은 웹이 담당한다. React·TypeScript·TanStack Query·Stackflow·SEED·Vitest를 유지하며, 공용 경계는 `@yapp-plus/app-bridge`에 둔다.

## 기술 맥락과 설계

- `expo-image-picker`, `expo-image-manipulator`, `expo-file-system`을 앱에 직접 추가한다. 선택·촬영·HEIC를 JPEG로 변환하고 이번 작업이 생성한 캐시만 지운다.
- `packages/app-bridge/src/photo.ts`, `web-photo.ts`에 입력·응답 스키마와 web 호출을 둔다. native는 JPEG Base64만 반환하고 URI·EXIF·OS 오류를 전달하지 않는다.
- `apps/mobile/src/photo/`는 권한·picker·변환·캐시 정리를 담당한다. runtime을 주입해 취소·권한·busy·변환을 가까운 테스트에서 검증한다.
- `apps/web/src/features/team-attendance/`는 대상·사진 검증, SHA-256/Base64, presign → S3 PUT → submit, 오류·수명을 담당한다. 페이지는 해당 feature의 공개 진입점만 사용한다.
- Base64의 최대 10MiB 바이너리 상한은 13,981,016자다. Blob과 object URL은 화면 수명에만 보관하고 mutation/query 캐시에 사진 바이트를 저장하지 않는다.
- PUT은 `credentials: 'omit'`, `redirect: 'error'`, 응답 `signedHeaders`로 수행한다. 기존 native 인증 옵션으로 presign·submit만 호출한다.
- mutation의 retry는 꺼두고 오프라인이면 요청 전 실패한다. GET 전용 인증 복구 정책은 바꾸지 않는다. submit 전송 뒤 결과 불명은 자동 재전송·성공 추정 없이 홈 복귀로 안내한다.

## 개발과 운영 경계

`DEV && VITE_API_MOCKING === 'true'`에서만 fixture와 팀 인증 흐름을 연다. 브라우저 선택은 JPEG·PNG만, HEIC·카메라는 native build에서 검증한다. fixture ID는 실서버 API에 전송하지 않으며 PUT도 MSW가 가로챈다.

회원용 세션 유형·대상·본인 membershipId·팀원 조회는 없다. 관리자 API를 우회하거나 경로를 새로 만들지 않는다. 현재 안내 Activity만 막혀 있고 업로드·완료 Activity는 직접 진입 차단이 없으므로 4단계에서 전체 Activity를 차단한다.

## 헌법 점검

기준은 현재 HEAD `f8a554ef`, fetch한 `origin/main` `73f8a0c2`다. 브랜치는 main보다 7커밋 뒤에 있으며 자동 merge/rebase하지 않는다. 루트·웹 가이드, 제품 맥락, 헌법과 이슈 #428을 확인했다. 생성 OpenAPI는 수정하지 않고, 새 공용 브리지는 스키마·테스트와 함께 추가한다. Node 24.20.0·pnpm 12.3.4로 검증한다. 네이티브 모듈 변경은 새 development build가 필요하고 TestFlight·OTA 배포는 하지 않는다.

## 단계와 복구

1. 명세·계약·작업 목록을 확정하고 리뷰한다.
2. iOS 사진 입력·브리지·개발 사진 진입점을 구현하고 리뷰한다.
3. 업로드·최종 제출 로직을 구현하고 리뷰한다.
4. 개발 웹 화면·완료·운영 차단을 연결하고 리뷰한다.

단계별 사용자 리뷰와 다음 단계 진행 확인을 받는다. 650줄부터 분리를 검토하고 PR 전체 추가·삭제는 800줄 미만으로 유지한다. 실패 시 개발 연결만 되돌리고 운영 차단을 유지한다. DB migration·운영 데이터 변경은 없다.

2단계는 공용 사진 계약(2a), native·RPC 연결(2b), 개발 화면 연결(2c)로 나누어 리뷰한다. 문서·계약에 native 의존성·lockfile·권한·처리·테스트와 웹 연결까지 누적하지 않도록 후속 변경은 별도 PR로 분리한다. 실제 브랜치 분리 전 승인을 받으며 2b 시작 전 최신 main의 Expo 버전 정렬 반영도 함께 결정한다.
