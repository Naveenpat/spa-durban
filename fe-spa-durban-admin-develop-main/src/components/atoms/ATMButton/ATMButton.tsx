import { ReactNode } from 'react';
import { Size, getHeight } from '../../../utils';
import { twMerge } from 'tailwind-merge';

type Color =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'error'
  | 'neutral';

type ButtonVariant = 'contained' | 'outlined' | 'text' | 'tonal';

type ButtonType = 'button' | 'submit' | 'reset';

type Props = {
  children: ReactNode;
  onClick?: () => void;
  color?: Color;
  variant?: ButtonVariant;
  type?: ButtonType;
  isLoading?: boolean;
  disabled?: boolean;
  size?: Size;
  autoFocus?: boolean;
  compact?: boolean;
  extraClasses?: string;
};

export const ATMButton = ({
  size = 'small',
  children,
  onClick,
  color = 'primary',
  isLoading = false,
  variant = 'contained',
  type = 'button',
  disabled = false,
  autoFocus = false,
  compact = false,
  extraClasses = '',
}: Props) => {
  const btnClasses = (combination: `${ButtonVariant}-${Color}`) => {
    switch (combination) {
      case 'contained-primary':
        return `bg-primary text-white border border-primary hover:bg-primary-30`;

      case 'contained-secondary':
        return `bg-secondary text-white border border-secondary hover:bg-secondary-70`;

      case 'contained-tertiary':
        return `bg-tertiary text-white border border-tertiary hover:bg-tertiary-70`;

      case 'contained-error':
        return `bg-error text-white border border-error hover:bg-error-70`;

      case 'contained-success':
        return `bg-success text-white border border-success hover:bg-success-70`;

      case 'contained-neutral':
        return `bg-neutral text-white border border-neutral hover:bg-neutral-70`;

      case 'outlined-primary':
        return `text-primary border border-primary hover:bg-primary-90`;

      case 'outlined-secondary':
        return `text-secondary border border-secondary hover:bg-secondary-90`;

      case 'outlined-tertiary':
        return `text-tertiary border border-tertiary hover:bg-tertiary-90`;

      case 'outlined-error':
        return `text-error border border-error hover:bg-error-90`;

      case 'outlined-success':
        return `text-success border border-success hover:bg-success-90`;

      case 'outlined-neutral':
        return `text-neutral border border-neutral hover:bg-neutral-90`;

      case 'text-primary':
        return `text-primary`;

      case 'text-secondary':
        return `text-secondary`;

      case 'text-tertiary':
        return `text-tertiary`;

      case 'text-error':
        return `text-error`;

      case 'text-success':
        return `text-success`;

      case 'text-neutral':
        return `text-neutral`;

      case 'tonal-primary':
        return `bg-primary-95 text-primary-60 border border-primary-95 hover:bg-primary-90`;

      case 'tonal-secondary':
        return `bg-secondary-95 text-secondary-60 border border-secondary-95 hover:bg-secondary-90`;

      case 'tonal-tertiary':
        return `bg-tertiary-95 text-tertiary-60 border border-tertiary-95 hover:bg-tertiary-90`;

      case 'tonal-error':
        return `bg-error-95 text-error-60 border border-error-95 hover:bg-error-90`;

      case 'tonal-success':
        return `bg-success-95 text-success-60 border border-success-95 hover:bg-success-90`;

      case 'tonal-neutral':
        return `bg-neutral-95 text-neutral-60 border border-neutral-95 hover:bg-neutral-90`;
    }
  };

  const getCircularProgressColor = (
    variant: ButtonVariant,
    color?: Color,
    disabled?: boolean,
  ) => {
    if (disabled) {
      return 'stroke-white';
    } else {
      switch (variant) {
        case 'contained':
          return 'stroke-white';
        case 'outlined':
          switch (color) {
            case 'primary':
              return 'stroke-primary';

            case 'secondary':
              return 'stroke-secondary';

            case 'tertiary':
              return 'stroke-tertiary';

            case 'error':
              return 'stroke-error';

            case 'success':
              return 'stroke-success';

            case 'neutral':
              return 'stroke-neutral';
            default:
              return 'stroke-white';
          }
        case 'tonal':
          switch (color) {
            case 'primary':
              return 'stroke-primary';

            case 'secondary':
              return 'stroke-secondary';

            case 'tertiary':
              return 'stroke-tertiary';

            case 'error':
              return 'stroke-error';

            case 'success':
              return 'stroke-success';

            case 'neutral':
              return 'stroke-neutral';
            default:
              return 'stroke-white';
          }
      }
    }
  };

  return (
    <div className={compact ? '' : getHeight(size)}>
      <button
        disabled={isLoading || disabled}
        type={type}
        onClick={onClick}
        className={twMerge(
          `font-semibold rounded-lg w-full h-full flex items-center justify-center text-sm px-4 transition-all duration-300 shadow  ${
            disabled
              ? 'opacity-50 bg-gray-400 cursor-not-allowed'
              : btnClasses(`${variant}-${color}`)
          } ${extraClasses}`,
        )}
        autoFocus={autoFocus}
      >
        {isLoading ? (
          <svg className="h-[80%] animate-spin " viewBox="0 0 50 50">
            <circle
              r="15"
              cx="25"
              cy="25"
              fill="transparent"
              strokeWidth="5px"
              strokeDasharray="70px"
              className={getCircularProgressColor(variant, color, disabled)}
            />
          </svg>
        ) : (
          <>
            <span>{children}</span>
          </>
        )}
      </button>
    </div>
  );
};
