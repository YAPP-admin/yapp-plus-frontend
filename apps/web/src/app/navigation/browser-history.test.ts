import { afterEach, describe, expect, it } from 'vitest';
import { observeBrowserHistory } from './browser-history';

const originalReplace = window.history.replaceState.bind(window.history);
const saved = new Map<string, unknown>();
let observer: ReturnType<typeof observeBrowserHistory> | undefined;
afterEach(() => observer?.dispose());

function start(url: string) {
  originalReplace({}, '', url);
  saved.clear();
  observer = observeBrowserHistory(window);
  saved.set(url, window.history.state);
  return observer;
}

function traverse(url: string) {
  originalReplace(saved.get(url) ?? {}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function push(state: unknown, url: string) {
  window.history.pushState(state, '', url);
  saved.set(url, window.history.state);
}

describe('현재 문서의 복귀 이력', () => {
  it('직접 접근과 새 관찰 세션은 기존 브라우저 이력을 신뢰하지 않는다', () => {
    push({}, '/');
    const history = start('/my/attendance');
    expect(history.canGoBack()).toBe(false);
    push({}, '/my/attendance/rules');
    expect(history.canGoBack()).toBe(true);
    history.dispose();
    expect(start('/my/attendance/rules').canGoBack()).toBe(false);
  });

  it.each(['/', '/my'])('%s에서 출석 내역으로 이동한 이력을 확인한다', (source) => {
    const history = start(source);
    push({}, '/my/attendance');
    expect(history.canGoBack()).toBe(true);
    traverse(source);
    expect(history.canGoBack()).toBe(false);
    traverse('/my/attendance');
    expect(history.canGoBack()).toBe(true);
  });

  it('필터 replace는 방문을 추가하지 않고 쿼리를 포함한 복귀 URL을 유지한다', () => {
    const history = start('/notices?category=session');
    const state = { nextState: { tree: ['보존'] }, custom: '원본' };
    window.history.replaceState(state, '', '/notices?category=submission');
    saved.set('/notices?category=submission', window.history.state);
    expect(history.canGoBack()).toBe(false);
    expect(window.history.state).toMatchObject(state);
    push(state, '/notices/123');
    expect(window.history.state).toMatchObject(state);
    traverse('/notices?category=submission');
    expect(history.canGoBack()).toBe(false);
    traverse('/notices/123');
    expect(history.canGoBack()).toBe(true);
  });

  it('뒤로간 뒤 새 이동은 기존 앞으로가기 가지를 제거한다', () => {
    const history = start('/');
    push({}, '/my');
    push({}, '/settings');
    traverse('/my');
    push({}, '/my/attendance');
    traverse('/settings');
    expect(history.canGoBack()).toBe(false);
  });

  it('중복 URL도 방문 식별자로 구분해 뒤로·앞으로가기를 처리한다', () => {
    const history = start('/my');
    const first = window.history.state;
    push({}, '/settings');
    push({}, '/my');
    const second = window.history.state;
    originalReplace(first, '', '/my');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(history.canGoBack()).toBe(false);
    originalReplace(second, '', '/my');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(history.canGoBack()).toBe(true);
  });

  it('알 수 없는 이동과 BFCache 복원은 이전 앱 화면을 추측하지 않는다', () => {
    const history = start('/');
    push({}, '/my');
    traverse('/unknown');
    expect(history.canGoBack()).toBe(false);
    push({}, '/settings');
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    expect(history.canGoBack()).toBe(false);
  });

  it('Next.js가 메서드를 감싼 뒤 재마운트해도 해제된 관찰기가 식별자를 바꾸지 않는다', () => {
    const first = start('/');
    const pushThrough = window.history.pushState.bind(window.history);
    const replaceThrough = window.history.replaceState.bind(window.history);
    window.history.pushState = (...args) => pushThrough(...args);
    window.history.replaceState = (...args) => replaceThrough(...args);
    first.dispose();
    observer = observeBrowserHistory(window);
    push({}, '/my/attendance');
    expect(observer.canGoBack()).toBe(true);
  });

  it('해제 후에는 이력을 관찰하지 않으며 원래 메서드가 동작한다', () => {
    const history = start('/');
    history.dispose();
    push({ retained: true }, '/my');
    expect(history.canGoBack()).toBe(false);
    expect(window.location.pathname).toBe('/my');
    expect(window.history.state).toMatchObject({ retained: true });
    window.history.replaceState({ replaced: true }, '', '/settings');
    expect(window.location.pathname).toBe('/settings');
    expect(window.history.state).toEqual({ replaced: true });
  });
});

it.each([
  ['Map', new Map([['key', 'value']])],
  ['Set', new Set(['value'])],
  ['Date', new Date('2026-10-29T00:00:00Z')],
  ['배열', ['value']],
  ['문자열', 'value'],
  ['숫자', 42],
])(
  '%s 상태를 초기 설치·push·replace에서 보존하고 추적 불가 이력은 신뢰하지 않는다',
  (_label, state) => {
    originalReplace(state, '', '/');
    observer = observeBrowserHistory(window);
    expect(window.history.state).toEqual(state);
    expect(observer.canGoBack()).toBe(false);
    push({}, '/my');
    expect(observer.canGoBack()).toBe(false);
    push({}, '/settings');
    expect(observer.canGoBack()).toBe(true);
    push(state, '/notices');
    expect(window.history.state).toEqual(state);
    expect(observer.canGoBack()).toBe(false);
    push({}, '/my');
    push({}, '/settings');
    expect(observer.canGoBack()).toBe(true);
    window.history.replaceState(state, '', '/settings');
    expect(window.history.state).toEqual(state);
    expect(observer.canGoBack()).toBe(false);
  },
);
