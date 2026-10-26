import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SCHEDULES, SchedulePage } from './schedule-page';

describe('SchedulePage', () => {
  it('일정 목록을 정상적으로 렌더링한다', () => {
    render(<SchedulePage />);

    expect(screen.getByRole('heading', { level: 1, name: '일정' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: '세션 일정 목록' })).toBeInTheDocument();

    expect(screen.getByText('9.12 (토)')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2, name: '팀 세션' }).length).toBeGreaterThan(0);
    expect(screen.getByText('디캠프 선릉 6층 이벤트홀')).toBeInTheDocument();
    expect(screen.getAllByText('오후 1시 ~ 오후 6시').length).toBeGreaterThan(0);
  });

  it('정규 세션 칩이 있는 세션에 칩 태그가 렌더링된다', () => {
    render(<SchedulePage />);

    const chips = screen.getAllByText('정규 세션');
    expect(chips.length).toBeGreaterThan(0);
  });

  it('일정이 빈 배열일 때 빈 상태(일정을 준비중이에요)를 렌더링한다', () => {
    render(<SchedulePage schedules={[]} />);

    expect(screen.getByRole('status', { name: '일정 없음' })).toBeInTheDocument();
    expect(screen.getByText('일정을 준비중이에요')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: '세션 일정 목록' })).not.toBeInTheDocument();
  });

  it('지난 일정은 aria-label 및 관련 속성을 갖는다', () => {
    render(<SchedulePage schedules={DEFAULT_SCHEDULES.slice(0, 1)} />);

    const item = screen.getByRole('article', { name: '9.12 (토) 팀 세션' });
    expect(item).toBeInTheDocument();
  });
});
