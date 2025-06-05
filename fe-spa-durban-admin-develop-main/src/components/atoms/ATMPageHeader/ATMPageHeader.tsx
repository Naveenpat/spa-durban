import React from 'react';
import { ATMButton } from '../ATMButton/ATMButton';
import { Icon } from '@tabler/icons-react';
import { twMerge } from 'tailwind-merge';

type Props = {
  heading: string;
  hideButton?: boolean;
  buttonProps?: {
    label: string;
    icon?: Icon;
    onClick: () => void;
    compact?: boolean;
    extraClasses?: string;
  };
  classNames?: {
    heading?: () => string;
  };
};

const ATMPageHeader = ({
  heading,
  hideButton = false,
  buttonProps,
  classNames,
}: Props) => {
  const Icon: Icon | undefined = buttonProps?.icon;
  return (
    <div className="flex items-center justify-between">
      <div
        className={twMerge(
          `text-xl font-semibold text-slate-700 ${classNames?.heading?.()} `,
        )}
      >
        {heading}
      </div>
      {hideButton ? null : (
        <ATMButton
          onClick={buttonProps?.onClick}
          variant="contained"
          color="primary"
          compact={buttonProps?.compact}
          extraClasses={buttonProps?.extraClasses}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon size={20} />} {buttonProps?.label}
          </div>
        </ATMButton>
      )}
    </div>
  );
};

export default ATMPageHeader;
