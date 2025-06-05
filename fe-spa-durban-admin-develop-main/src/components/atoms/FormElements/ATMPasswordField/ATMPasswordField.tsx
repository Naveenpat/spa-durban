import React, {
  ChangeEvent,
  FocusEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Variant } from '../ATMNumberField/ATMNumberField';
import { Size, getHeight } from '../../../../utils';
import ATMFieldLabel from '../../ATMFieldLabel/ATMFieldLabel';
import { ErrorMessage } from 'formik';
import ATMFieldError from '../../ATMFieldError/ATMFieldError';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

interface PasswordProps {
  name: string;
  label: string;
  value: string;
  required?: boolean;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;

  placeholder?: string;
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  onBlur?: (e: any) => void;
  isFocused?: boolean;
  isValid?: boolean;
  isTouched?: boolean;
  errorMessage?: string;
  disableErrorMessage?: boolean;
  helperText?: string;
  variant?: Variant;
  size?: Size;
}

const ATMPasswordField: React.FC<PasswordProps> = ({
  name,
  label,
  value,
  onChange,

  placeholder,
  className,
  disabled,
  onBlur,
  isFocused = false,
  required = false,
  helperText = '',
  errorMessage = '',
  isValid = true,
  isTouched = true,
  disableErrorMessage = false,
  variant = 'default',
  size = 'small',
}) => {
  const [focused, setFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const isOutlined = variant === 'outlined';

  const [show, setShow] = useState(false);
  const togle = () => {
    setShow(!show);
  };

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
        {required && <span className="text-red-500 font-semibold"> * </span>}
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
          focused && !disabled ? 'border-primary-light' : 'border-gray-300'
        }`}
      >
        <label
          className={`absolute left-2 transition-all duration-200 ${
            focused || value
              ? 'top-0 text-primary-main font-medium  text-sm'
              : 'top-1/2 transform -translate-y-1/2 text-sm text-gray-400 cursor-text'
          }  ${!isOutlined && 'hidden'} `}
        >
          {label}
        </label>

        <input
          id={name}
          type={show ? 'text' : 'password'}
          name={name}
          placeholder={isOutlined ? (focused ? placeholder : '') : placeholder}
          value={value}
          onChange={handleChange}
          className={`rounded-md w-full bg-inherit focus:outline-none px-2 py-1 ${className} placeholder:text-sm text-sm ${
            !isOutlined && 'h-full'
          }`}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          ref={inputRef}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
          {show ? (
            <button type="button" onClick={togle}>
              <IconEyeOff className="w-5 h-5" />{' '}
            </button>
          ) : (
            <button type="button" onClick={togle}>
              {' '}
              <IconEye className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {helperText && isValid && (
        <p className="absolute text-sm text-slate-500"> {helperText} </p>
      )}
      <ErrorMessage name={name}>
        {(errorMessage) => <ATMFieldError> {errorMessage} </ATMFieldError>}
      </ErrorMessage>
    </div>
  );
};

export default ATMPasswordField;
