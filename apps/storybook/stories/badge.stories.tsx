import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '@yapp-plus/ui';

const meta = {
  title: 'UI/배지',
  component: Badge,
  tags: ['autodocs'],
  args: {
    children: '운영 공지',
    size: 'medium',
    tone: 'informative',
    variant: 'weak',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: '기본',
};

export const NaturalWidth: Story = {
  name: '자연 너비',
  args: {
    children: '제출 마감까지 12일 23시간 남음',
    tone: 'critical',
  },
};
