import type { ButtonHTMLAttributes } from 'react';

import * as styles from './button.css';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'small' | 'medium';
  variant?: 'primary' | 'secondary';
};

export function Button({
  className,
  size = 'medium',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const classes = [styles.base, styles.size[size], styles.variant[variant], className]
    .filter(Boolean)
    .join(' ');

  return <button className={classes} type={type} {...props} />;
}
