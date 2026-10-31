import type { Meta, StoryObj } from '@storybook/react-vite';
import { TimePicker } from '@yapp-plus/ui';

const meta = {
  title: 'UI/시간 선택',
  component: TimePicker,
  tags: ['autodocs'],
  args: {
    defaultValue: { hour: 14, minute: 30 },
    locale: 'ko-KR',
    minuteStep: 5,
  },
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: '기본',
};
