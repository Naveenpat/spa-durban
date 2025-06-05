import { IconCheck, IconMinus } from '@tabler/icons-react';
import React, { ReactNode } from 'react';
import { Size } from '../../../../utils';

type Props = {
  checked: boolean;
  onChange: () => void;
  isPartialChecked?: boolean;
  disabled?: boolean;
  size?: Size;
  label?: ReactNode;
};

const ATMCheckbox = ({
  checked = false,
  onChange,
  isPartialChecked = false,
  disabled = false,
  size = 'medium',
  label = '',
}: Props) => {
  const getSize = (size: Size) => {
    switch (size) {
      case 'small':
        return 'size-4';
      case 'medium':
        return 'size-5';
      case 'large':
        return 'size-6';
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        !disabled && onChange();
      }}
      className={`flex gap-2 ${disabled ? 'cursor-default' : 'cursor-pointer'} `}
    >
      <div
        className={`rounded flex items-center justify-center transition-all duration-300 ${getSize(
          size,
        )} ${
          checked
            ? 'bg-primary text-onPrimary'
            : 'bg-white text-slate-800 border'
        } ${
          disabled
            ? 'cursor-default border-gray-200'
            : 'cursor-pointer border-gray-400'
        } `}
      >
        {checked &&
          (isPartialChecked ? (
            <IconMinus size={14} stroke={3} />
          ) : (
            <IconCheck size={14} stroke={3} />
          ))}
      </div>

      {label && (
        <div className="text-xs font-medium text-slate-700">{label}</div>
      )}
    </div>
  );
};

export default ATMCheckbox;
