import {
  getDate,
  getDay,
  isAfter,
  isEqual,
  isToday,
  startOfDay,
  subDays,
} from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './calendar.css';

type Props = {};

const absent = [
  subDays(new Date(), 4),
  subDays(new Date(), 3),
  subDays(new Date(), 2),
  subDays(new Date(), 1),
  subDays(new Date(), 10),
  subDays(new Date(), 9),
  subDays(new Date(), 8),
  subDays(new Date(), 7),
  subDays(new Date(), 6),
  subDays(new Date(), 5),
];

const renderDayContents = (day: any, date: any) => {
  const isWeekend = getDay(date) === 0 || getDay(date) === 6;
  const isPresent =
    absent?.findIndex((d) => {
      console.log(d, date);
      return isEqual(startOfDay(d), startOfDay(date));
    }) > -1;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`h-full p-1 border-2 rounded pointer-events-none flex flex-col justify-between  ${
        isToday(date) && ' border-sky-400'
      } ${
        isWeekend
          ? 'bg-gray-100'
          : isPresent
            ? 'bg-green-200'
            : isAfter(date, new Date())
              ? 'bg-white'
              : 'bg-red-200'
      }  `}
    >
      <div className="flex justify-start">
        <div className="text-sm font-semibold text-slate-700">
          {getDate(date)}
        </div>
      </div>

      <div className="flex justify-end">
        <div className="flex items-center justify-center px-2 font-semibold bg-yellow-200 rounded text-slate-700 ">
          3 of 10
        </div>
      </div>
    </div>
  );
};

const Calendar = (props: Props) => {
  return (
    <div className="w-full h-full calendar-cmp">
      <DatePicker
        onChange={() => {}}
        inline
        calendarClassName="border border-red-400 w-full h-full flex flex-col"
        readOnly
        renderDayContents={renderDayContents}
        disabled
        calendarStartDay={1}
        showPreviousMonths={false}
      />
    </div>
  );
};

export default Calendar;
