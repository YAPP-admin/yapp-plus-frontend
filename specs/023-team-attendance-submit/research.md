# 조사 근거와 결정

## Android와 서버

- Android `855e111f`는 업로드 순서·검증을 제공하지만 회원용 팀원·결과 조회 계약이 없어 실제 홈 연결은 보류했다. 이를 운영 완성 근거로 사용하지 않는다.
- backend dev `e2c2612a`와 현재 생성 SDK에는 presign·submit이 있으나 회원용 제출 대상 조회는 없다. 개발 fixture·MSW만 사용한다.
- 서버는 JPEG/PNG, 1바이트 이상 10MiB 이하, SHA-256 체크섬을 요구한다. submit 성공은 201과 `PENDING`이다.

## 사진 입력과 형식

- iOS 시스템 선택·촬영에는 `expo-image-picker`, 변환·크기 조절에는 `expo-image-manipulator`, 생성 캐시 삭제에는 `expo-file-system`을 쓴다. 기존 도구로는 이를 충족하지 못한다.
- 사용자 결정은 JPEG·품질 0.9·긴 변 2,560px이다. WebP는 변환 도구에서 지원하지만 서버가 허용하지 않아 제외한다.
- Base64는 기존 RPC로 native JPEG를 웹에 전달하기 위한 선택이다. 큰 사진의 메모리·전달과 단체 사진 가독성은 실기기에서 검증한다.

## 최신 기준

- 2026-11-12 `git fetch origin`에서 origin/main은 `73f8a0c2`, 현재 HEAD는 `f8a554ef`다. main에 mobile 의존성 정렬·앱 버전 1.0.3·Modern Web Guidance가 추가됐다.
- #385는 팀 사진을 명시적으로 제외한다. 새 이슈 [#428](https://github.com/YAPP-admin/yapp-plus-frontend/issues/428)을 생성했다.
