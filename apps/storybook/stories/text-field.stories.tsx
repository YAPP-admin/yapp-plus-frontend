import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextField, TextFieldInput } from '@yapp-plus/ui';

const meta = {
  title: 'UI/텍스트 필드',
  component: TextField,
  tags: ['autodocs'],
  args: {
    label: '이름',
    children: <TextFieldInput placeholder="본인 이름을 입력해 주세요" />,
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  name: '기본',
};

export const Filled: Story = {
  name: '입력됨',
  args: { defaultValue: '김야뿌' },
};

export const Invalid: Story = {
  name: '오류',
  args: { defaultValue: '김', invalid: true, errorMessage: '이름을 두 글자 이상 입력해 주세요' },
};

export const Disabled: Story = {
  name: '비활성화',
  args: { defaultValue: '김야뿌', disabled: true },
};
