import { useEffect, useState, type ReactNode } from 'react';

export function MockApiBoundary({ children }: { children: ReactNode }) {
  if (!import.meta.env.DEV || import.meta.env.MODE === 'test') {
    return children;
  }

  const flag = import.meta.env.VITE_API_MOCKING;
  if (flag === undefined || flag === 'false') {
    return children;
  }
  if (flag !== 'true') {
    return <p role="alert">VITE_API_MOCKING에는 true 또는 false를 설정해 주세요.</p>;
  }
  return <EnabledMockApiBoundary>{children}</EnabledMockApiBoundary>;
}

function EnabledMockApiBoundary({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'pending' | 'ready' | 'failed'>('pending');

  useEffect(() => {
    let active = true;
    async function start() {
      if (!import.meta.env.DEV || import.meta.env.MODE === 'test') {
        return;
      }
      try {
        const { startMocking } = await import('./browser');
        await startMocking();
        if (active) {
          setStatus('ready');
        }
      } catch {
        if (active) {
          setStatus('failed');
        }
      }
    }
    void start();
    // worker는 공유하므로 중단하지 않고 늦게 도착한 상태 갱신만 무시한다.
    return () => {
      active = false;
    };
  }, []);

  if (status === 'ready') {
    return children;
  }
  if (status === 'failed') {
    return (
      <p role="alert">
        API 모킹을 시작하지 못했습니다. 개발 서버와 mockServiceWorker.js를 확인한 뒤 새로고침해
        주세요.
      </p>
    );
  }
  return <output>API 모킹을 준비하고 있습니다.</output>;
}
