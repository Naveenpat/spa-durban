import { Icon } from '@tabler/icons-react';
import {
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

export type MenuItem = {
  label: string;
  icon?: Icon;
  onClick: () => void;
};

export type MenuProps = {
  items: MenuItem[];
  children?: ReactNode;
};

const ATMMenu = ({ items, children }: MenuProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const buttonRef = useRef<any>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (buttonRef.current && !buttonRef?.current?.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const togglePortal = (e: MouseEvent<HTMLButtonElement>) => {
    const buttonRect = e.currentTarget.getBoundingClientRect();

    setDropdownPosition({
      top: buttonRect.bottom + 8,
      right: document.body.getBoundingClientRect().width - buttonRect.right,
    });
    setDropdownOpen(!dropdownOpen);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      items[selectedIndex]?.onClick();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const index = items.findIndex(
        (item) => items[selectedIndex]?.label === item.label,
      );

      const nextIndex =
        e.key === 'ArrowDown'
          ? (index + 1) % items.length
          : (index - 1 + items.length) % items.length;
      setSelectedIndex(nextIndex);
    }
  };

  return (
    <>
      <button
        className={`flex gap-2 px-4 rounded-md  w-fit  hover:bg-secondary-90 items-center cursor-pointer text-secondary-onContainer hover:text-secondary-30 transition-all duration-300 text-sm font-semibold focus:outline-none h-[30px]`}
        onClick={togglePortal}
        onKeyDown={handleKeyDown}
      >
        {children}
      </button>

      {dropdownOpen &&
        createPortal(
          <div
            ref={buttonRef}
            style={{ top: dropdownPosition.top, right: dropdownPosition.right }}
            className="absolute bg-white border border-gray-200 rounded-md min-w-[150px]  max-w-[300px] shadow"
          >
            {/* <div>
              <ATMSearchBox
                value=""
                onChange={() => {}}
                placeholder="Search..."
                extraClasses="border-none"
                autoFocused
              />
            </div> */}

            <ul className="flex flex-col py-2">
              {items?.map((item, index) => {
                return (
                  <li
                    onClick={item?.onClick}
                    className={`flex  gap-1 items-center px-2 py-1.5 text-xs text-slate-700 font cursor-pointer hover:bg-gray-100`}
                    key={index}
                    id={`menu-item-${index}`}
                  >
                    {item.icon ? <item.icon size={16} /> : null}
                    {item.label}
                  </li>
                );
              })}
            </ul>
          </div>,

          document.body,
        )}
    </>
  );
};

export default ATMMenu;
