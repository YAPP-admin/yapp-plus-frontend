# 화면 내부 로그인 계약

- 입력: `{ username: string, password: string }`.
- 비동기 결과: `{ status: 'success' | 'invalid-credentials' | 'unavailable' }`.
- 거절된 Promise는 unavailable 안내로 처리한다. 원래 예외나 입력은 출력하지 않는다.
- 폼은 `login` 함수, `onSuccess` 콜백, `available` 플래그를 받는다. 앱 사이에 공유하지 않는다.
- 개발 모의 함수는 400ms 뒤 `admin-demo` / `demo-password`만 성공시킨다. 실제 자격 증명이 아니다.
- 인증 실패: “아이디 혹은 비밀번호가 일치하지 않아요.”
- 서비스 오류: “로그인할 수 없어요. 잠시 후 다시 시도해주세요.”
- 비활성 환경: “로그인 기능을 준비 중입니다.”; 클릭과 Enter 모두 함수를 호출하지 않는다.
- 성공 시 `/`로 이동한다. 세션·토큰·권한을 반환하지 않는다.
