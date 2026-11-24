/** 팀 인증의 개발 진입을 모킹 환경으로 제한한다. */
export const teamPhotoDevelopmentEnabled = () =>
  import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === 'true';
