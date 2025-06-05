import { useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Variant } from '../ATMNumberField/ATMNumberField';

type Props = {
  name: string;
  label: string;
  value: [Date | null, Date | null];

  onChange: (value: [Date | null, Date | null] | null) => void;
  dateFormat?: string;
  isClearable?: boolean;
  closeOnScroll?: boolean;
  minDate?: Date;
  maxDate?: Date;
  shouldCloseOnSelect?: boolean;
  readOnly?: boolean;
  excludeDates?: Date[];
  excludeDateIntervals?: {
    start: Date;
    end: Date;
  }[];
  holidays?: {
    date: string;
    holidayName: string;
  }[];
  highlightDates?: Array<
    | {
        [className: string]: Date[];
      }
    | Date
  >;

  placeholder?: string;
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  onBlur?: () => void;
  isValid?: boolean;
  isTouched?: boolean;
  errorMessage?: string;
  disableErrorMessage?: boolean;
  helperText?: string;
  variant?: Variant;
  children?: any;
};

const ATMDateRangePicker = ({
  name,
  label,
  value,
  onChange,

  dateFormat = 'dd MMM yyyy',
  isClearable = true,
  closeOnScroll = true,
  shouldCloseOnSelect = true,
  readOnly = false,
  minDate,
  maxDate,
  excludeDates,
  excludeDateIntervals,
  holidays,
  highlightDates,
  placeholder,
  className,
  disabled,
  onBlur,
  helperText = '',
  errorMessage = '',
  isValid = true,
  isTouched = true,
  disableErrorMessage = false,
  variant = 'default',
  children,
}: Props) => {
  const [focused, setFocused] = useState(false);

  const inputRef = useRef<any>(null);

  const isOutlined = variant === 'outlined';

  const handleChange = (dateRange: [Date | null, Date | null]): void => {
    onChange(dateRange);
  };

  const handleBlur = () => {
    setFocused(false);
    onBlur?.();
    inputRef?.current?.blur();
  };

  return (
    <div className="relative">
      <label
        className={`text-sm font-semibold  ${
          isTouched && !isValid ? 'text-red-400' : 'text-primary-main'
        } ${isOutlined && 'hidden'} `}
        htmlFor={name}
      >
        {label}
      </label>

      <div
        onClick={() => {
          inputRef?.current?.focus();
          !disabled && setFocused(true);
        }}
        className={`relative h-[48px]  rounded flex flex-col ${
          isOutlined && 'justify-end'
        } ${disabled && 'opacity-60'} ${
          isTouched && !isValid && ' border-red-300'
        } border  ${
          focused && !disabled ? 'border-primary-light' : 'border-gray-300'
        }`}
      >
        <label
          className={`absolute left-2 transition-all duration-200 ${
            isTouched && !isValid && 'text-red-400'
          }  ${
            focused || value?.some((el) => el !== null)
              ? 'top-0 text-primary-main font-medium  text-sm'
              : 'top-1/2 transform -translate-y-1/2 text-sm text-gray-400 cursor-text'
          }  ${!isOutlined && 'hidden'} `}
        >
          {label}
        </label>
        <DatePicker
          selectsRange
          startDate={value?.[0]}
          endDate={value?.[1]}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholderText={
            isOutlined ? (focused ? placeholder : '') : placeholder
          }
          dateFormat={dateFormat}
          isClearable={isClearable}
          closeOnScroll={closeOnScroll}
          minDate={minDate ?? undefined}
          maxDate={maxDate ?? undefined}
          disabled={disabled}
          shouldCloseOnSelect={shouldCloseOnSelect}
          readOnly={readOnly}
          excludeDates={excludeDates}
          excludeDateIntervals={excludeDateIntervals}
          holidays={holidays}
          highlightDates={highlightDates}
          todayButton="Today"
          disabledKeyboardNavigation={true}
          showPopperArrow={false}
          popperPlacement="top-start"
          className={`rounded-md w-full bg-inherit focus:outline-none px-2 py-1 ${className} placeholder:text-base ${
            !isOutlined && 'h-full'
          } ${isTouched && !isValid && 'text-red-400'}`}
        >
          {children}
        </DatePicker>
      </div>
      {helperText && isValid && (
        <p className="absolute text-sm text-slate-500"> {helperText} </p>
      )}
      {isTouched && !isValid && !disableErrorMessage && (
        <p className="absolute text-sm text-red-400"> {errorMessage} </p>
      )}
    </div>
  );
};

export default ATMDateRangePicker;
