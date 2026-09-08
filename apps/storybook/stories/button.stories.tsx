import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@yapp-plus/ui';

const meta = {
  title: 'UI/버튼',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: '계속',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['small', 'medium'],
    },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  name: '기본',
};

export const Secondary: Story = {
  name: '보조',
  args: {
    children: '나중에',
    variant: 'secondary',
  },
};

export const Small: Story = {
  name: '작은 크기',
  args: {
    children: '확인',
    size: 'small',
  },
};

export const Disabled: Story = {
  name: '비활성화',
  args: {
    disabled: true,
  },
};
