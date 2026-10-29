import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionButton } from '@yapp-plus/ui';

const meta = {
  title: 'UI/버튼',
  component: ActionButton,
  tags: ['autodocs'],
  args: {
    children: '계속',
    type: 'button',
    size: 'medium',
    variant: 'brandSolid',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['small', 'medium'],
    },
    variant: {
      control: 'inline-radio',
      options: ['brandSolid', 'neutralWeak'],
    },
  },
} satisfies Meta<typeof ActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  name: '기본',
};

export const Secondary: Story = {
  name: '보조',
  args: {
    children: '나중에',
    variant: 'neutralWeak',
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

export const Loading: Story = {
  name: '로딩 · 한국어 상태 안내',
  parameters: {
    docs: {
      description: {
        story:
          '진행 표시의 접근성 이름은 처리 중입니다. loading은 클릭을 막지 않으므로 중복 실행 차단에는 disabled를 함께 사용합니다.',
      },
    },
  },
  args: { loading: true },
};

export const LoadingDisabled: Story = {
  name: '로딩 중 비활성화',
  args: { loading: true, disabled: true },
};
