# 기술 결정

- **폼**: TanStack Form 1.33.5 안정 버전을 catalog에 고정한다. useForm과 Field로 단일 폼을 구성하며
  공용 폼 팩토리나 추가 스키마 라이브러리는 만들지 않는다.
- **검증 시점**: revalidateLogic의 submit → change로 첫 입력 중 오류 표시를 방지한다.
- **인증 요청**: useMutation의 mutate로 요청하고 isPending으로 입력·버튼을 잠근다. TanStack Form은
  입력과 검증만 관리하며 isSubmitting을 서버 요청 상태로 사용하지 않는다.
- **인증 결과**: 필드 검증과 mutation 결과를 구분한다. isSubmitSuccessful을 인증 성공으로 사용하지 않는다.
- **모의 동작**: import.meta.env.DEV 안에서 동적 import하여 배포 번들에서 제외한다.
- **디자인**: Figma의 SUIT 대신 저장소에서 확정한 Pretendard를 유지한다. SEED 버튼은 loading과
  disabled를 함께 연결한다. 서버와 클라이언트에 동일한 dark-only 속성을 출력한다.

## 근거

- [TanStack Form 기본 구성](https://tanstack.com/form/latest/docs/framework/react/quick-start)
- [동적 검증](https://tanstack.com/form/latest/docs/framework/react/guides/dynamic-validation)
- [TanStack Query mutation](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)
- [SEED Action Button](https://seed-design.io/llms/react/components/action-button.txt)
- [SEED 테마](https://seed-design.io/llms/react/getting-started/styling/theming.txt)
