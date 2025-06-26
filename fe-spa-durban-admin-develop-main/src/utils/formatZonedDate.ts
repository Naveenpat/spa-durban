// utils/formatZonedDate.ts
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const DEFAULT_TIMEZONE = 'Africa/Johannesburg';

export const formatZonedDate = (
  date: Date | string | number,
  formatStr: string = 'dd MMM yyyy hh:mm a',
  timeZone: string = DEFAULT_TIMEZONE
): string => {
  if (!date) return '-';
  const zonedDate = toZonedTime(new Date(date), timeZone);
  return format(zonedDate, formatStr);
};
