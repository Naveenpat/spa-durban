import React, {
  ChangeEvent,
  FocusEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Variant } from '../ATMNumberField/ATMNumberField';
import { Size, getHeight } from '../../../../utils';
import { ErrorMessage } from 'formik';
import ATMFieldError from '../../ATMFieldError/ATMFieldError';
import ATMFieldLabel from '../../ATMFieldLabel/ATMFieldLabel';

interface TextFieldProps {
  name: string;
  label?: string;
  value: string;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;

  placeholder?: string;
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  onBlur?: (e: any) => void;
  isFocused?: boolean;
  isValid?: boolean;
  required?: boolean;
  isTouched?: boolean;
  errorMessage?: string;
  disableErrorMessage?: boolean;
  helperText?: string;
  variant?: Variant;
  size?: Size;
}

const ATMTextField: React.FC<TextFieldProps> = ({
  name,
  label,
  value,
  onChange,

  placeholder,
  className,
  disabled,
  required,
  onBlur,
  isFocused = false,
  helperText = '',
  isValid = true,
  variant = 'default',
  size = 'small',

  errorMessage = '',
  isTouched = true,
  disableErrorMessage = false,
}) => {
  const [focused, setFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const isOutlined = variant === 'outlined';

  useEffect(() => {
    setFocused(isFocused);
    isFocused && inputRef?.current?.focus();

    return () => {
      setFocused(false);
    };
  }, [isFocused]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event);
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    setFocused(false);
    onBlur?.(e);
    inputRef?.current?.blur();
  };

  return (
    <div className="relative">
      <ATMFieldLabel htmlFor={name} hidden={isOutlined}>
        {label}
        {required && label && <span className="font-semibold text-red-500"> * </span>}
      </ATMFieldLabel>

      <div
        onClick={() => {
          inputRef?.current?.focus();
          !disabled && setFocused(true);
        }}
        className={`relative ${getHeight(
          size,
        )} rounded flex flex-col bg-white ${isOutlined && 'justify-end'} ${
          disabled && 'opacity-60'
        } border  ${
          focused && !disabled ? 'border-primary' : 'border-neutral-80'
        }`}
      >
        <label
          className={`absolute left-2 transition-all duration-200  ${
            focused || value
              ? 'top-0 text-primary font-medium text-xs'
              : 'top-1/2 transform -translate-y-1/2 text-xs text-gray-400 cursor-text'
          }  ${!isOutlined && 'hidden'} `}
        >
          {label}
        </label>
        <input
          id={name}
          type="text"
          name={name}
          placeholder={isOutlined ? (focused ? placeholder : '') : placeholder}
          value={value}
          onChange={handleChange}
          className={`rounded-md w-full bg-inherit focus:outline-none px-2 py-1 ${className} placeholder:text-xs text-xs ${
            !isOutlined && 'h-full'
          }`}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          ref={inputRef}
        />
      </div>

      {helperText && isValid && (
        <p className="absolute text-xs text-slate-500"> {helperText} </p>
      )}

      {name && (
        <ErrorMessage name={name}>
          {(errorMessage) => <ATMFieldError> {errorMessage} </ATMFieldError>}
        </ErrorMessage>
      )}
    </div>
  );
};

export default ATMTextField;
