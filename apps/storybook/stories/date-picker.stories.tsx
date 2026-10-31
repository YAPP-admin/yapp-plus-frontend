import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker } from '@yapp-plus/ui';

const today = { year: 2026, month: 10, day: 31 };

const meta = {
  title: 'UI/날짜 선택',
  component: DatePicker,
  tags: ['autodocs'],
  args: {
    defaultValue: today,
    locale: 'ko-KR',
    today,
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: '기본',
};
