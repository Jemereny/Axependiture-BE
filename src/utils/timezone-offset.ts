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

function getDurationFromTimezoneOffset(timezoneOffset: string): Duration {
  const [offsetHour, offsetMinutes] = timezoneOffset.substring(1).split(':');
  const isPositive = timezoneOffset.charAt(0) === '+';

  return { hours: isPositive ? Number(offsetHour) : -Number(offsetHour), minutes: Number(offsetMinutes) };
}

export function getDateFromOffset(date: Date, timezoneOffset: string = '+00:00') {
  const offset = getDurationFromTimezoneOffset(timezoneOffset);

  return add(date, offset);
}

/**
 * This method retrieves the 24-hour time range for the date passed in, based on the provided offset.
 * The offset is first used to determine the current day, and then, based on that day,
 * it returns the 24-hour time range in UTC
 *
 * Example:
 * currentDateTime: 2024-09-21:T01:00:00 +00:00
 * timezoneOffset: +08:00
 *
 * currentDate = 2024-09-21 (Since 01 + 08 = 09 which has not passed to 22nd)
 * startDateInUTC = 2024-09-20T16:00:00
 * endDateInUTC   = 2024-09-21T15:59:59
 * As +08:00 is 8 hours ahead, midnight at 21st is 20th, 16:00 in UTC
 */
export function getDayRangeFromOffset(
  currentDateTime: Date,
  timezoneOffset: string = '+00:00',
): { startDateTimeInUTC: Date; endDateTimeInUTC: Date } {
  const datetimeWithOffset = getDateFromOffset(currentDateTime, timezoneOffset);
  const currentDayAtMidnight = new Date(datetimeWithOffset);
  currentDayAtMidnight.setUTCHours(0);
  currentDayAtMidnight.setUTCMinutes(0);
  currentDayAtMidnight.setUTCSeconds(0);

  // Return to UTC timing, hence the need to add/subtract from current date
  const startDateTimeInUTC = getUTCFromDateTime(currentDayAtMidnight, timezoneOffset);
  const endDateTimeInUTC = add(startDateTimeInUTC, {
    hours: 23,
    minutes: 59,
    seconds: 59,
  });
  return { startDateTimeInUTC, endDateTimeInUTC };
}

export function getMonthRangeFromOffset(
  currentDateTime: Date,
  timezoneOffset: string = '+00:00',
): { startDateTimeInUTC: Date; endDateTimeInUTC: Date } {
  const datetimeWithOffset = getDateFromOffset(currentDateTime, timezoneOffset);

  // Return to UTC timing, hence the need to add/subtract from current date
  const startDateTimeInUTC = getUTCFromDateTime(getStartOfMonthInUTC(datetimeWithOffset), timezoneOffset);
  const endDateTimeInUTC = getUTCFromDateTime(getEndOfMonthInUTC(datetimeWithOffset), timezoneOffset);

  return { startDateTimeInUTC, endDateTimeInUTC };
}

// date-fns `format` uses locale when formatting the date to string. This removes the locale and converts it to `+00:00`
export function formatDate(date: Date, dateFormat: string) {
  return format(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()), dateFormat);
}

function getStartOfMonthInUTC(date: Date) {
  const startOfMonthInUTC = new Date(date);

  startOfMonthInUTC.setUTCDate(1);
  startOfMonthInUTC.setUTCHours(0);
  startOfMonthInUTC.setUTCMinutes(0);
  startOfMonthInUTC.setUTCSeconds(0);
  startOfMonthInUTC.setUTCMilliseconds(0);
  return startOfMonthInUTC;
}

function getEndOfMonthInUTC(date: Date) {
  return sub(add(getStartOfMonthInUTC(date), { months: 1 }), { seconds: 1 });
}

function getUTCFromDateTime(date: Date, offset: string) {
  return sub(date, getDurationFromTimezoneOffset(offset));
}
