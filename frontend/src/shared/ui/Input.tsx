import type { InputHTMLAttributes } from 'react';
import { cn } from '@shared/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = ({ label, error, id, className, ...props }: InputProps): JSX.Element => {
  const inputId = id ?? props.name;
  return (
    <label className="field" htmlFor={inputId}>
      <span className="field-label">{label}</span>
      <input id={inputId} className={cn('input', className)} {...props} />
      {error ? <p className="field-error">{error}</p> : null}
    </label>
  );
};
