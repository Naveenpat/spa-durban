import { IconCirclePlus } from '@tabler/icons-react';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getHeight } from '../../../utils';
import ATMSearchBox from '../../atoms/ATMSearchBox/ATMSearchBox';
import ATMCheckbox from '../../atoms/FormElements/ATMCheckbox/ATMCheckbox';

type Props<T extends { value: string }> = {
  items: T[];
  label: string;
  onSelect: (item: T) => void;
  renderOption: (option: T) => ReactNode;
  isItemSelected: (item: T) => boolean;
  selectedItems: string[];
  onClear: () => void;
  isOptionEqualToSearchValue: (option: T, value: string) => boolean;
};

const MOLFilterChip = <T extends { value: string }>({
  items,
  label,
  onSelect,
  renderOption,
  isItemSelected,
  selectedItems = [],
  onClear,
  isOptionEqualToSearchValue,
}: Props<T>) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [filteredOptions, setFilteredOptions] = useState<T[]>([]);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    setFilteredOptions(items);
  }, [items]);

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

  const togglePortal = (e: any) => {
    const buttonRect = e.currentTarget.getBoundingClientRect();

    setDropdownPosition({
      top: buttonRect.bottom + 8,
      left: buttonRect.left,
    });
    setDropdownOpen(!dropdownOpen);
  };

  const handleSearchValueChange = (value: string) => {
    const inputValue = value;
    setSearchValue(value);
    if (value?.trim?.()?.length > 0) {
      const filtered = items?.filter?.((option) => {
        const clonedOption = { ...option };

        for (const key in clonedOption) {
          clonedOption[key] = (clonedOption[key] as any)
            ?.trim()
            ?.toLowerCase?.();
        }

        return isOptionEqualToSearchValue(
          clonedOption,
          inputValue?.trim()?.toLowerCase?.(),
        );
      });

      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(items);
    }
  };

  return (
    <>
      <div
        className={`flex gap-2 shadow pl-2 border border-dashed rounded-md border-gray-300 w-fit bg-white hover:bg-slate-50 items-center cursor-pointer ${
          selectedItems?.length ? 'pr-1.5' : 'pr-3'
        }  ${getHeight('small')}`}
        onClick={togglePortal}
      >
        <div className="flex items-center gap-1 py-1 text-xs font-medium text-gray-700">
          <IconCirclePlus size={18} />
          <div>{label}</div>
        </div>

        {selectedItems?.length ? (
          <div className="flex gap-1 pl-2 border-l">
            {selectedItems?.length > 2 ? (
              <div className="flex gap-1 px-2 py-1 text-[12px] bg-primary-95 rounded  text-primary-30 font-medium">
                {selectedItems?.length} <p>Selected</p>
              </div>
            ) : (
              selectedItems?.map((selected, index) => {
                const item = items?.find((item) => item?.value === selected);

                return (
                  <div
                    key={index}
                    className="px-2 py-1 text-xs font-medium rounded bg-primary-95 text-primary-30 text-nowrap"
                  >
                    {item ? renderOption(item) : ''}
                  </div>
                );
              })
            )}
          </div>
        ) : null}
      </div>

      {dropdownOpen &&
        createPortal(
          <div
            ref={buttonRef}
            style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
            className="absolute bg-white border border-gray-200 rounded-md  w-[200px] max-h-[400px] flex flex-col"
          >
            <div>
              <ATMSearchBox
                value={searchValue}
                onChange={(e) => {
                  handleSearchValueChange(e.target.value);
                }}
                placeholder="Search..."
                extraClasses="border-none shadow-none"
                autoFocused
                onClear={() => {
                  handleSearchValueChange('');
                }}
              />
            </div>
            <hr />

            {filteredOptions?.length > 0 ? (
              <ul className="flex flex-col flex-1 py-2 overflow-auto">
                {filteredOptions?.map((item, index) => {
                  return (
                    <li
                      onClick={() => onSelect(item)}
                      className={`flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 font cursor-pointer hover:bg-gray-100 `}
                      key={index}
                    >
                      <ATMCheckbox
                        checked={isItemSelected(item)}
                        onChange={() => onSelect(item)}
                        size="small"
                      />
                      {renderOption(item)}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-2 text-xs text-center text-neutral-60">
                No options found
                {searchValue ? ` for "${searchValue?.trim()}"` : ''}
              </div>
            )}

            <div
              onClick={onClear}
              className="py-2 text-xs font-semibold text-center border-t cursor-pointer text-slate-700"
            >
              Clear Filter
            </div>
          </div>,

          document.body,
        )}
    </>
  );
};

export default MOLFilterChip;
