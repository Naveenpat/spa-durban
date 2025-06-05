import React from 'react';
import { PatternFormat } from 'react-number-format';
import ATMTextField from '../ATMTextField/ATMTextField';

interface ATMMaskedInputProps {
  name: string;
  mask: string;
  value: string;
  format: string;
  label: string;
  onChange: (value: string) => void;

  placeholder?: string;
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  onBlur?: () => void;
  isFocused?: boolean;
  isValid?: boolean;
  isTouched?: boolean;
  errorMessage?: string;
  disableErrorMessage?: boolean;
  helperText?: string;
}

const ATMMaskedInput: React.FC<ATMMaskedInputProps> = ({
  name,
  mask,
  format,
  value,
  label,
  onChange,
  placeholder,
  className,
  disabled,
}) => {
  return (
    <PatternFormat
      name={name}
      format={format}
      allowEmptyFormatting
      mask={mask}
      customInput={ATMTextField}
      label={label}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default ATMMaskedInput;
