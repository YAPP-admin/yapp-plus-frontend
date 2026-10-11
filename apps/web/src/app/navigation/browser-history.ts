const entryKey = '__yappPlusNavigationEntry';

function readEntry(state: unknown): string | undefined {
  if (typeof state !== 'object' || state === null || !(entryKey in state)) {
    return undefined;
  }
  const id = state[entryKey];
  return typeof id === 'string' ? id : undefined;
}

function withEntry(state: unknown, id: string) {
  // 일반 객체·null 이외의 상태는 변환하지 않아 외부 호출자의 계약을 보존합니다.
  if (state !== null && (typeof state !== 'object' || Array.isArray(state))) {
    return undefined;
  }
  return { ...state, [entryKey]: id };
}

// 식별자와 URL의 대응은 현재 문서 메모리에만 보관합니다. 새로고침하면 신뢰 이력이 사라집니다.
export function observeBrowserHistory(browser: Window) {
  const history = browser.history;
  // LAN 개발 서버의 HTTP 환경에서도 사용할 수 있는 비보안 방문 식별자입니다.
  const session = Math.random().toString(36).slice(2);
  let sequence = 0;
  const nextId = () => `${session}:${++sequence}`;
  const originalPush = history.pushState.bind(history);
  const originalReplace = history.replaceState.bind(history);
  let entries: { id: string; url: string }[] = [];
  let cursor = 0;
  let active = true;

  const reset = () => {
    const id = nextId();
    const state = withEntry(history.state, id);
    entries = state ? [{ id, url: browser.location.href }] : [];
    cursor = 0;
    if (state) {
      originalReplace(state, '');
    }
  };

  const push: History['pushState'] = (state: unknown, unused, url) => {
    if (!active) {
      originalPush(state, unused, url);
      return;
    }
    const id = nextId();
    const nextState = withEntry(state, id);
    originalPush(nextState ?? state, unused, url);
    if (!nextState) {
      entries = [];
      cursor = 0;
      return;
    }
    entries = [...entries.slice(0, cursor + 1), { id, url: browser.location.href }];
    cursor = entries.length - 1;
  };

  const replace: History['replaceState'] = (state: unknown, unused, url) => {
    if (!active) {
      originalReplace(state, unused, url);
      return;
    }
    const id = entries[cursor]?.id ?? nextId();
    const nextState = withEntry(state, id);
    originalReplace(nextState ?? state, unused, url);
    if (!nextState) {
      entries = [];
      cursor = 0;
      return;
    }
    entries[cursor] = { id, url: browser.location.href };
  };

  const traverse = () => {
    const id = readEntry(history.state);
    const index = entries.findIndex(
      (entry) => entry.id === id && entry.url === browser.location.href,
    );
    if (index < 0) {
      reset();
      return;
    }
    cursor = index;
  };

  reset();
  history.pushState = push;
  history.replaceState = replace;
  browser.addEventListener('popstate', traverse);
  browser.addEventListener('pageshow', reset);

  return {
    canGoBack: () =>
      cursor > 0 &&
      entries[cursor]?.id === readEntry(history.state) &&
      entries[cursor]?.url === browser.location.href,
    dispose: () => {
      active = false;
      if (history.pushState === push) {
        history.pushState = originalPush;
      }
      if (history.replaceState === replace) {
        history.replaceState = originalReplace;
      }
      browser.removeEventListener('popstate', traverse);
      browser.removeEventListener('pageshow', reset);
    },
  };
}
