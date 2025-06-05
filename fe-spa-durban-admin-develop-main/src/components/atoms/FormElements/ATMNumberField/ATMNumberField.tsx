import React, {
  ChangeEvent,
  FocusEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Size, getHeight, isValidNumber } from '../../../../utils';
import ATMFieldLabel from '../../ATMFieldLabel/ATMFieldLabel';
import { ErrorMessage } from 'formik';
import ATMFieldError from '../../ATMFieldError/ATMFieldError';

export type Variant = 'outlined' | 'default';

interface NumberFieldProps {
  name: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
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
  isAllowSpaces?: boolean;
  isAllowDecimal?: boolean;
  isAllowCharacter?: string;
  required?: boolean;
}

const ATMNumberField: React.FC<NumberFieldProps> = ({
  name,
  label,
  value,
  onChange,
  placeholder,
  className,
  disabled,
  onBlur,
  helperText = '',
  isFocused = false,
  isValid = false,
  variant = 'default',
  size = 'small',

  isTouched = true,
  disableErrorMessage = false,
  errorMessage = '',
  isAllowSpaces = false,
  isAllowDecimal = false,
  isAllowCharacter = '',
  required = false,
}) => {
  const [focused, setFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFocused(isFocused);
    isFocused && inputRef?.current?.focus();

    return () => {
      setFocused(false);
    };
  }, [isFocused]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    event.target.value
      ? isValidNumber(event.target.value, {
          allowSpaces: isAllowSpaces,
          allowedChars: isAllowCharacter,
          allowDecimals: isAllowDecimal,
        }) && onChange(event.target.value)
      : onChange(event.target.value);
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    setFocused(false);
    onBlur?.(e);
    inputRef?.current?.blur();
  };

  const isOutlined = variant === 'outlined';

  return (
    <div className="relative">
      {label ? (
        <ATMFieldLabel htmlFor={name} hidden={isOutlined}>
          {label}
          {required && <span className="font-semibold text-red-500"> * </span>}
        </ATMFieldLabel>
      ) : null}

      <div
        onClick={() => {
          inputRef?.current?.focus();
          !disabled && setFocused(true);
        }}
        className={`relative ${getHeight(
          size,
        )} rounded flex flex-col transition-all duration-300 ${
          isOutlined && 'justify-end'
        } ${disabled && 'opacity-60'} border  ${
          focused && !disabled ? 'border-primary' : 'border-neutral-80'
        }`}
      >
        <label
          className={`absolute left-2 transition-all duration-200 ${
            focused || value
              ? 'top-0 text-primary font-medium  text-sm'
              : 'top-1/2 transform -translate-y-1/2 text-sm text-gray-400 cursor-text'
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
          } `}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          ref={inputRef}
        />
      </div>
      {helperText && isValid && (
        <p className="absolute text-sm text-slate-500"> {helperText} </p>
      )}
      {name && (
        <ErrorMessage name={name}>
          {(errorMessage) => <ATMFieldError> {errorMessage} </ATMFieldError>}
        </ErrorMessage>
      )}
    </div>
  );
};

export default ATMNumberField;
