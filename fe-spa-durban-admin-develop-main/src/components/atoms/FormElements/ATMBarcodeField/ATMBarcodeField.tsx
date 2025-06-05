import { IconScan } from '@tabler/icons-react';
import { FocusEvent, KeyboardEvent } from 'react';
import { Size, getHeight } from 'src/utils';

type Props = {
  placeholder: string;
  value: string;
  onChange: (e: any) => void;
  extraClasses?: string;
  size?: Size;
  autoFocused?: boolean;
  onKeyUp?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
};

const ATMBarcodeField = ({
  placeholder,
  onChange,
  value,
  extraClasses,
  size = 'small',
  autoFocused = false,
  onKeyUp,
  onFocus,
}: Props) => {
  const className = `flex items-center w-full gap-2 px-3 rounded-md shadow-[0px_2px_5px_-1px_rgba(50,50,93,0.25),0px_1px_3px_-1px_rgba(0,0,0,0.3)] ${extraClasses} ${getHeight(
    size,
  )}`;
  return (
    <div className={className}>
      <IconScan className="text-neutral" />
      <input
        className="w-full bg-transparent outline-none"
        type="text"
        placeholder={placeholder}
        onInput={onChange}
        value={value}
        autoFocus={autoFocused}
        onKeyUp={onKeyUp}
        onFocus={onFocus}
      />
    </div>
  );
};

export default ATMBarcodeField;
