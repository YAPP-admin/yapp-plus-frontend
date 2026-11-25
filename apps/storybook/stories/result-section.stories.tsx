/** 앱 내부를 가져오지 않고 공용 결과 안내의 크기·복구 액션 조합을 보여준다. */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResultSection } from '@yapp-plus/ui';

const meta = {
  title: 'UI/결과 안내',
  component: ResultSection,
  tags: ['autodocs'],
  args: {
    size: 'medium',
    titleAs: 'h2',
    title: '표시할 항목이 없어요',
    description: '새로운 항목이 생기면 이곳에서 확인할 수 있어요.',
  },
} satisfies Meta<typeof ResultSection>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Empty: Story = { name: '빈 상태' };
export const WithAction: Story = {
  name: '다시 시도',
  args: {
    title: '정보를 불러오지 못했어요',
    description: '잠시 후 다시 시도해 주세요.',
    primaryActionProps: { type: 'button', children: '다시 시도' },
  },
};
export const PageError: Story = {
  name: '큰 오류 안내',
  args: { ...WithAction.args, size: 'large', title: '앗, 오류가 발생했어요!' },
};
export const SectionError: Story = {
  name: '작은 오류 안내 · 긴 문구',
  args: { ...WithAction.args, title: '이번 주에 예정된 세션과 공지 정보를 불러오지 못했어요' },
};
export const AppRecovery: Story = {
  name: '최종 복구 · 보조 액션',
  args: {
    ...PageError.args,
    primaryActionProps: { type: 'button', children: '새로고침' },
    secondaryActionProps: { asChild: true, children: <a href="/">홈으로 이동</a> },
  },
};
