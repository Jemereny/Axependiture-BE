import { add, sub, format } from 'date-fns';

/**
 * List of UTC offsets that are available
 * http://en.wikipedia.org/wiki/Time_zone#List_of_UTC_offsets
 */
export const LIST_OF_UTC_TIMEZONE_OFFSET = [
  '−12:00',
  '−11:00',
  '−10:00',
  '−09:30',
  '−09:00',
  '−08:00',
  '−07:00',
  '−06:00',
  '−05:00',
  '−04:00',
  '−03:30',
  '−03:00',
  '−02:00',
  '−01:00',
  '±00:00',
  '+01:00',
  '+02:00',
  '+03:00',
  '+03:30',
  '+04:00',
  '+04:30',
  '+05:00',
  '+05:30',
  '+05:45',
  '+06:00',
  '+06:30',
  '+07:00',
  '+08:00',
  '+08:45',
  '+09:00',
  '+09:30',
  '+10:00',
  '+10:30',
  '+11:00',
  '+12:00',
  '+12:45',
  '+13:00',
  '+14:00',
];

export function getDateFromOffset(date: Date, timezoneOffset: string = '+00:00') {
  const isPositive = timezoneOffset.substring(0, 1) === '+';
  const [offsetHour, offsetMinutes] = timezoneOffset.substring(1).split(':');
  const offset: Duration = { hours: Number(offsetHour), minutes: Number(offsetMinutes) };

  return isPositive ? add(date, offset) : sub(date, offset);
}

// date-fns `format` uses locale when formatting the date to string. This removes the locale and converts it to `+00:00`
export function formatDate(date: Date, dateFormat: string) {
  return format(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()), dateFormat);
}
