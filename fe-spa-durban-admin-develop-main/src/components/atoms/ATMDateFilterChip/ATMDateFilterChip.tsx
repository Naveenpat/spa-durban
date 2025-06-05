import { IconCalendarEvent } from '@tabler/icons-react';

import { MouseEvent, useEffect, useRef, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createPortal } from 'react-dom';
import { getHeight } from '../../../utils';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  startOfISOWeek,
  startOfMonth,
} from 'date-fns';

type Props = {
  startDate: string | null;
  endDate: string | null;
  onSelectStartDate: (newDate: Date | null) => void;
  onSelectEndDate: (newDate: Date | null) => void;
  onClear: () => void;
  dateFilterKeys?: {
    label: string;
    onClick: () => void;
    isSelected: () => boolean;
  }[];
};

const ATMDateFilterChip = ({
  startDate,
  endDate,
  onSelectStartDate,
  onSelectEndDate,
  onClear,
  dateFilterKeys,
}: Props) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [datePortalOpen, setDatePortalOpen] = useState(false);
  const [pickingFor, setPickingFor] = useState('StartDate');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const buttonRef = useRef<any>(null);
  const dateRef = useRef<any>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (buttonRef.current && !buttonRef?.current?.contains(event.target)) {
        setDropdownOpen(false);
      }

      if (dateRef.current && !dateRef?.current?.contains(event.target)) {
        setDatePortalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const togglePortal = (
    e: MouseEvent<HTMLDivElement>,
    portalFor: 'DatePicker' | 'DateKey',
  ) => {
    const buttonRect =
      portalFor === 'DateKey'
        ? e.currentTarget.getBoundingClientRect()
        : e.currentTarget.parentElement?.getBoundingClientRect();

    setDropdownPosition({
      top: buttonRect?.bottom || 0 + 8,
      left: buttonRect?.left || 0,
    });

    switch (portalFor) {
      case 'DateKey':
        setDropdownOpen(!dropdownOpen);
        break;

      case 'DatePicker':
        setDatePortalOpen(!datePortalOpen);
        break;
    }
  };

  const quickPickerOptions = [
    {
      lable: 'Today',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    },
    {
      lable: 'This Week',
      startDate: format(startOfISOWeek(new Date()), 'yyyy-MM-dd'),
      endDate: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    },
    {
      lable: 'Last Week',
      startDate: format(addDays(startOfISOWeek(new Date()), -7), 'yyyy-MM-dd'),
      endDate: format(addDays(startOfISOWeek(new Date()), -1), 'yyyy-MM-dd'),
    },
    {
      lable: 'This Month',
      startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    },
    {
      lable: 'Last Month',
      startDate: format(startOfMonth(addMonths(new Date(), -1)), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(addMonths(new Date(), -1)), 'yyyy-MM-dd'),
    },
  ];

  return (
    <>
      <div
        className={`flex gap-2 shadow pl-2 border border-dashed rounded-md border-gray-300 w-fit bg-white hover:bg-slate-50 items-center cursor-pointer pr-1.5 ${getHeight(
          'small',
        )}`}
      >
        <div
          onClick={(e) => togglePortal(e, 'DateKey')}
          className="flex items-center gap-1 py-1 text-xs font-medium text-gray-700"
        >
          <IconCalendarEvent size={18} />
          <div>
            {
              dateFilterKeys?.find(
                (filterKey) => filterKey?.isSelected() === true,
              )?.label
            }
          </div>
        </div>

        <div
          onClick={(e) => {
            togglePortal(e, 'DatePicker');
            setPickingFor('StartDate');
          }}
          className="flex gap-1 pl-2 border-l"
        >
          <div className="flex items-center px-1 text-xs font-semibold rounded text-primary-30 text-nowrap bg-primary-95">
            {startDate ? format(new Date(startDate), 'dd MMM yy') : 'From'}
          </div>
          -
          <div className="flex items-center px-1 text-xs font-semibold rounded text-primary-30 text-nowrap bg-primary-95">
            {endDate ? format(new Date(endDate), 'dd MMM yy') : 'To'}
          </div>
        </div>

        {dropdownOpen &&
          dateFilterKeys?.length &&
          createPortal(
            <div
              ref={buttonRef}
              style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
              className="absolute p-1 bg-white border border-gray-300 rounded-md "
            >
              <ul>
                {dateFilterKeys?.map((filterKey, index) => {
                  const isSelected = filterKey.isSelected();
                  return (
                    <li
                      key={index}
                      onClick={() => {
                        filterKey?.onClick();
                        setDropdownOpen(false);
                      }}
                      className={`px-4 py-1 cursor-pointer ${
                        isSelected && 'bg-gray-200'
                      } rounded`}
                    >
                      {filterKey.label}
                    </li>
                  );
                })}
              </ul>
            </div>,

            document.body,
          )}

        {datePortalOpen &&
          createPortal(
            <div
              ref={dateRef}
              style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
              className="absolute bg-white border border-gray-300 rounded-md "
            >
              {/* Picking For */}
              <div className="flex gap-2 p-2 border-b">
                <div
                  onClick={() => setPickingFor('StartDate')}
                  className={`text-xs cursor-pointer text-slate-700 font-semibold px-2 py-1 rounded transition-all duration-300 ${
                    pickingFor === 'StartDate' && 'bg-gray-200'
                  } `}
                >
                  Start Date
                </div>
                <div
                  onClick={() => setPickingFor('EndDate')}
                  className={`text-xs cursor-pointer text-slate-700 font-semibold px-2 py-1 rounded transition-all duration-300 ${
                    pickingFor === 'EndDate' && 'bg-gray-200 '
                  }`}
                >
                  End Date
                </div>
              </div>

              {/* Date Picker */}
              <div className="flex">
                {/* Quick Picker */}
                <ul className="p-2 border-r">
                  {quickPickerOptions?.map((option, index) => {
                    const isSelected =
                      option?.startDate === startDate &&
                      option?.endDate === endDate;
                    return (
                      <li
                        key={index}
                        onClick={() => {
                          onSelectStartDate(new Date(option?.startDate));
                          onSelectEndDate(new Date(option?.endDate));
                        }}
                        className={`cursor-pointer px-2 py-1.5 rounded-md text-sm  text-slate-700  transition-colors duration-300 font-medium ${
                          isSelected && 'bg-primary-95 '
                        } `}
                      >
                        {option?.lable}
                      </li>
                    );
                  })}
                </ul>

                <div>
                  {pickingFor === 'StartDate' ? (
                    <ReactDatePicker
                      onChange={(date, e) => {
                        e?.stopPropagation();
                        onSelectStartDate(date);
                        setPickingFor('EndDate');
                      }}
                      startDate={startDate ? new Date(startDate) : null}
                      endDate={endDate ? new Date(endDate) : null}
                      selectsStart
                      inline
                      calendarClassName="!border-none !rounded-none"
                    />
                  ) : (
                    <ReactDatePicker
                      onChange={(date, e) => {
                        e?.stopPropagation();
                        onSelectEndDate(date);
                        setDatePortalOpen(false);
                        setPickingFor('StartDate');
                      }}
                      startDate={startDate ? new Date(startDate) : null}
                      endDate={endDate ? new Date(endDate) : null}
                      selectsEnd
                      inline
                      calendarClassName="!border-none !rounded-none"
                    />
                  )}
                </div>
              </div>

              {/* Clear Filter */}
              <div
                onClick={onClear}
                className="py-2 text-sm font-semibold text-center border-t cursor-pointer text-slate-700 hover:bg-gray-100"
              >
                Clear Filter
              </div>
            </div>,

            document.body,
          )}
      </div>
    </>
  );
};

export default ATMDateFilterChip;
