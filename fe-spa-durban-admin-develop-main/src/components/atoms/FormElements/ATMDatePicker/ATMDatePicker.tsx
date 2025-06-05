import { format } from 'date-fns';
import { useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Variant } from '../ATMNumberField/ATMNumberField';
import { ErrorMessage } from 'formik';
import ATMFieldError from '../../ATMFieldError/ATMFieldError';
import ATMFieldLabel from '../../ATMFieldLabel/ATMFieldLabel';
import { Size, getHeight } from '../../../../utils';
import { IconCalendar } from '@tabler/icons-react';

type Props = {
  name?: string;
  label: string;
  value: Date | null;
  onChange: (value: any) => void;

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
  required?: boolean;
  size?: Size;
};

const ATMDatePicker = ({
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
  isValid = true,
  variant = 'default',
  children,
  size = 'small',
  required = false,

  isTouched = true,
  errorMessage = '',
  disableErrorMessage = false,
}: Props) => {
  const [focused, setFocused] = useState(false);

  const inputRef = useRef<any>(null);

  const isOutlined = variant === 'outlined';

const handleChange = (date: Date | null): void => {
  onChange(date ? format(date, 'yyyy/MM/dd') : null);
};


  const handleBlur = () => {
    setFocused(false);
    onBlur?.();
    inputRef?.current?.blur();
  };

  return (
    <div className="relative">
      <ATMFieldLabel htmlFor={name} hidden={isOutlined}>
        {label}
        {required && <span className="font-semibold text-red-500"> * </span>}
      </ATMFieldLabel>

      <div
        onClick={() => {
          inputRef?.current?.focus();
          !disabled && setFocused(true);
        }}
        className={`relative ${getHeight(size)} rounded flex flex-col ${
          isOutlined && 'justify-end'
        } ${disabled && 'opacity-60'} border  ${
          focused && !disabled ? 'border-primary' : 'border-neutral-80'
        }`}
      >
        <label
          className={`absolute left-2 transition-all duration-200 ${
            focused || value
              ? 'top-0 text-primary font-medium text-xs'
              : 'top-1/2 transform -translate-y-1/2 text-xs text-gray-400 cursor-text'
          }  ${!isOutlined && 'hidden'} `}
        >
          {label}
        </label>
        <DatePicker
          selected={value}
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
          className={`rounded-md w-full bg-inherit focus:outline-none !px-8 py-1 text-sm text-slate-700 ${className} placeholder:text-xs placeholder:translate-x-2 ${
            !isOutlined && 'h-full'
          }`}
          icon={<IconCalendar />}
          showIcon
          // calendarIconClassname="text-gray-400 mr-2"
        >
          {children}
        </DatePicker>
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

export default ATMDatePicker;
