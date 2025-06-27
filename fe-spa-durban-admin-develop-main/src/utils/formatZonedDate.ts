// utils/formatZonedDate.ts
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const DEFAULT_TIMEZONE = 'Africa/Johannesburg';

export const formatZonedDate = (
  date: Date | string | number,
  formatStr: string = 'dd MMM yyyy hh:mm a',
  timeZone: string = DEFAULT_TIMEZONE
): string => {
  try {
    if (!date) return '-';

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return '-'; // Invalid date check

    const zonedDate = toZonedTime(parsedDate, timeZone);
    return format(zonedDate, formatStr);
  } catch (error) {
    console.error('formatZonedDate error:', error);
    return '-';
  }
};
