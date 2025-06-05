import { IconSearch, IconX } from '@tabler/icons-react';
import { Size, getHeight } from '../../../utils';
import { FocusEvent, KeyboardEvent } from 'react';

type SearchInputProp = {
  placeholder: string;
  value: string;
  onChange: (e: any) => void;
  extraClasses?: string;
  size?: Size;
  autoFocused?: boolean;
  onKeyUp?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onClear: (e: any) => void;
  onFocus?: (e:FocusEvent<HTMLInputElement>)=> void;
};

const ATMSearchBox = ({
  placeholder,
  onChange,
  onClear,
  value,
  extraClasses,
  size = 'small',
  autoFocused = false,
  onKeyUp,
  onFocus
}: SearchInputProp) => {
  const className = `flex items-center w-full gap-2 px-3 rounded-md  shadow-[0px_2px_5px_-1px_rgba(50,50,93,0.25),0px_1px_3px_-1px_rgba(0,0,0,0.3)] ${extraClasses} ${getHeight(
    size,
  )}`;

  return (
    <div className={className}>
      <IconSearch className="text-neutral" />
      <input
        className="w-full bg-transparent outline-none"
        type="text"
        placeholder={placeholder}
        onChange={onChange}
        value={value}
        autoFocus={autoFocused}
        onKeyUp={onKeyUp}
        onFocus={onFocus}
      />
      {value ? (
        <IconX onClick={onClear} className="cursor-pointer text-neutral" />
      ) : null}
    </div>
  );
};

export default ATMSearchBox;
