import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@shared/lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'accent' | 'outline';
}

const variantClass: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
  accent: 'btn-accent',
  outline: 'btn-outline',
};

export const Button = ({
  children,
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonProps): JSX.Element => {
  return (
    <button type={type} className={cn('btn', variantClass[variant], className)} {...props}>
      {children}
    </button>
  );
};
