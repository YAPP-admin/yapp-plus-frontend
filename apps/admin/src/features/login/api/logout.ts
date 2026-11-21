/** 생성 Staff SDK와 관리자 로그인 기능 사이의 로그아웃 요청 경계를 감쌉니다. */
import { logout as requestAdminLogout } from '@yapp-plus/api/generated';

/** 현재 관리자 Staff 세션을 서버에서 폐기합니다. */
export async function logout(): Promise<void> {
  await requestAdminLogout({ throwOnError: true });
}
