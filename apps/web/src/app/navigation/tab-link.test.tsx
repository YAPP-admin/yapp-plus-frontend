import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { TabLink } from './tab-link';
import type { TabsState } from './tab';

type Tick = (resolve: () => void) => void;
type ReplaceStepInput = TabsState | ((currentParams: TabsState) => TabsState);
const state = vi.hoisted(() => ({
  scope: 'a',
  currentName: 'Alerts',
  stepParams: {} as TabsState,
  queues: new Map<string, Tick[]>(),
  pop: vi.fn<(scope: string) => void>(),
  push: vi.fn<(name: string, params: unknown) => void>(),
  replace: vi.fn<(scope: string, params: unknown) => void>(),
}));
vi.mock('@stackflow/react', () => ({
  useFlow: () => {
    const scope = state.scope;
    return { pop: () => state.pop(scope), push: state.push };
  },
  useActivity: () => ({ name: state.currentName }),
  useStepFlow: () => {
    const scope = state.scope;
    return {
      replaceStep: (params: ReplaceStepInput) =>
        state.replace(scope, typeof params === 'function' ? params(state.stepParams) : params),
    };
  },
}));
vi.mock('@stackflow/plugin-history-sync', () => ({
  useHistoryTick: () => {
    const scope = state.scope;
    return { requestHistoryTick: (callback: Tick) => state.queues.get(scope)?.push(callback) };
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  state.queues.clear();
  state.scope = 'a';
  state.currentName = 'Alerts';
  state.stepParams = {};
});

it('Tabs에서는 Stackflow가 현재 활성 화면을 갱신하고 조회 조건을 유지한다', () => {
  state.currentName = 'Tabs';
  state.stepParams = { initialTab: 'home', session: 'team' };
  render(<TabLink tab="schedule">일정</TabLink>);
  fireEvent.click(screen.getByRole('link', { name: '일정' }));
  expect(state.replace).toHaveBeenCalledWith('a', { initialTab: 'schedule', session: 'team' });
  expect(state.push).not.toHaveBeenCalled();
});

it('Alerts에서 pop한 뒤 Stackflow가 복원한 Tabs를 갱신한다', () => {
  state.stepParams = { initialTab: 'home', session: 'team' };
  state.queues.set('a', []);
  render(<TabLink tab="notices">게시판</TabLink>);
  fireEvent.click(screen.getByRole('link', { name: '게시판' }));
  expect(state.pop).toHaveBeenCalledWith('a');
  expect(state.replace).not.toHaveBeenCalled();
  state.queues.get('a')?.[0]?.(() => {});
  expect(state.replace).toHaveBeenCalledWith('a', { initialTab: 'notices', session: 'team' });
});

it('Tabs와 Alerts 밖에서는 새 Tabs로 진입한다', () => {
  state.currentName = 'NotFound';
  render(<TabLink tab="schedule">일정</TabLink>);
  fireEvent.click(screen.getByRole('link', { name: '일정' }));
  expect(state.push).toHaveBeenCalledWith('Tabs', { initialTab: 'schedule' });
  expect(state.pop).not.toHaveBeenCalled();
  expect(state.replace).not.toHaveBeenCalled();
});

it('Alerts에서 탭 복귀는 각 Stack의 history 큐로 처리하고 다른 Stack의 예약을 덮지 않는다', () => {
  state.queues.set('a', []);
  state.queues.set('b', []);
  state.scope = 'a';
  render(<TabLink tab="notices">A 게시판</TabLink>);
  state.scope = 'b';
  render(<TabLink tab="schedule">B 일정</TabLink>);
  fireEvent.click(screen.getByRole('link', { name: 'A 게시판' }));
  fireEvent.click(screen.getByRole('link', { name: 'B 일정' }));

  expect(state.pop.mock.calls).toEqual([['a'], ['b']]);
  expect(state.replace).not.toHaveBeenCalled();
  expect(state.queues.get('a')).toHaveLength(1);
  expect(state.queues.get('b')).toHaveLength(1);
  state.queues.get('b')?.[0]?.(() => {});
  state.queues.get('a')?.[0]?.(() => {});
  expect(state.replace.mock.calls).toEqual([
    ['b', { initialTab: 'schedule' }],
    ['a', { initialTab: 'notices' }],
  ]);
});

it('수정키로 탭 링크를 열면 브라우저의 기본 이동을 유지한다', () => {
  state.queues.set('a', []);
  render(<TabLink tab="notices">게시판</TabLink>);
  const link = screen.getByRole('link', { name: '게시판' });
  expect(link).toHaveAttribute('href', '/notices');
  expect(fireEvent.click(link, { ctrlKey: true })).toBe(true);
  expect(state.pop).not.toHaveBeenCalled();
  expect(state.queues.get('a')).toHaveLength(0);
});
