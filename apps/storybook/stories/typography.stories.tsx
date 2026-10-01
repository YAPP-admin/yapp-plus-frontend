import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionButton } from '@yapp-plus/ui';
import * as styles from './typography.css';

function TypographySample() {
  return (
    <section className={styles.sample} aria-label="Pretendard 서체 표본">
      <h1 className={styles.title}>Pretendard</h1>
      <p>함께 만드는 YAPP+ · ABCDEFG abcdefg · 0123456789 · ₩ % &amp; !?</p>
      <div className={styles.weights}>
        {[100, 200, 300, 400, 450, 500, 600, 700, 800, 900].map((weight) => (
          <p key={weight} style={{ fontWeight: weight }}>
            {weight} — 새로운 경험을 함께 만들어요. YAPP+ 2026
          </p>
        ))}
      </div>
      <p>가나다라마바사아자차카타파하 · 똠방각하 · 한글과 Latin의 줄바꿈을 확인합니다.</p>
      <label className={styles.field}>
        이름
        <input className={styles.input} defaultValue="홍길동 YAPP+" />
      </label>
      <label className={styles.field}>
        소개
        <textarea className={styles.input} defaultValue="새로운 경험을 함께 만들어요." />
      </label>
      <ActionButton type="button">확인</ActionButton>
    </section>
  );
}

const meta = {
  title: 'UI/서체',
  component: TypographySample,
  tags: ['autodocs'],
} satisfies Meta<typeof TypographySample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pretendard: Story = { name: '문자와 굵기' };
