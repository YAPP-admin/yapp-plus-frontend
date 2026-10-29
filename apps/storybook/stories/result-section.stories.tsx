import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResultSection } from '@yapp-plus/ui';

const meta = {
  title: 'UI/결과 안내',
  component: ResultSection,
  tags: ['autodocs'],
  args: {
    size: 'medium',
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
    primaryActionProps: { children: '다시 시도' },
  },
};
