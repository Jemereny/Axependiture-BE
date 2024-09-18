/**
 * Forms a calendar in a 2D array from JAN-DEC
 *
 * e.g
 *
 *      2023
 * JAN FEB MAR APR
 * MAY JUN JUL AUG
 * SEP OCT NOV DEC
 * PREV       NEXT
 */

import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { makeTelegramInlineButton } from './telegram-inline-button';

const MONTHS_IN_ROW = 4;
const NUM_OF_MONTHS_IN_YEAR = 12;
const monthIndexToMonth: Record<number, string> = {
  0: 'JAN',
  1: 'FEB',
  2: 'MAR',
  3: 'APR',
  4: 'MAY',
  5: 'JUN',
  6: 'JUL',
  7: 'AUG',
  8: 'SEP',
  9: 'OCT',
  10: 'NOV',
  11: 'DEC',
} as const;

/**
 * Generates a calendar with Sunday being the first day of the week
 *
 * @param year the year to generate calendar
 * @param month is zero-indexed
 * @returns an array of arrays of months in a year. e.g. [[undefined, undefined,MAR,APR],[MAY, JUN, JUL, undefined], ...]
 */
export function generateMonthlyCalendar(availableMonths: number[]): (number | undefined)[][] {
  const calendar: (number | undefined)[][] = [];
  const monthsToShow = new Set(availableMonths);

  for (let i = 0; i < NUM_OF_MONTHS_IN_YEAR; i += MONTHS_IN_ROW) {
    const row: (number | undefined)[] = [];
    for (let j = 0; j < MONTHS_IN_ROW; ++j) {
      const currentMonth = i + j;
      row.push(monthsToShow.has(currentMonth) ? currentMonth : undefined);
    }
    calendar.push(row);
  }

  return calendar;
}

/**
 * Generates the telegram monthly calendar with InlineKeyboardButtons and its callback_data
 *
 * E.g. Button example for a button that moves to next month
 * {
 *    'text': '>',
 *    'callback_data': '/command /shft 2024-04-01T10:00:000Z'
 * }
 * @param year
 * @param month
 * @param command to give context on the command that invokes this method
 * @param selectCommand to give context on the command to invoke when the button is pressed
 * @param cancelCommand to give context on the command to invoke when the button is pressed
 * @returns a generated calendar
 */
export function generateTelegramMonthlyCalendar(
  year: number,
  availableMonths: number[],
  command: string,
  selectCommand: string = '/slct',
  cancelCommand: string = '/cncl',
): InlineKeyboardButton[][] {
  const calendar = generateMonthlyCalendar(availableMonths);
  const telegramCalendarKeyboardButtons: InlineKeyboardButton[][] = [];

  // State year
  telegramCalendarKeyboardButtons.push([
    {
      text: `${year}`,
      callback_data: ' ',
    },
  ]);

  console.log(availableMonths);
  console.log(calendar);
  for (const row of calendar) {
    telegramCalendarKeyboardButtons.push(
      row.map((month) => {
        return month !== undefined
          ? makeTelegramInlineButton(monthIndexToMonth[month], command, [
              selectCommand,
              Date.UTC(year, month).toString(),
            ])
          : makeTelegramInlineButton(' ', '', []);
      }),
    );
  }

  const prevYear = year - 1 <= -Number.MAX_SAFE_INTEGER ? -Number.MAX_SAFE_INTEGER : year - 1;
  const nextYear = year + 1 >= Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : year + 1;
  // Next and previous buttons
  telegramCalendarKeyboardButtons.push(
    [
      // TechDebt: /mshft and /shft are currently hardcoded. Can be passed in
      makeTelegramInlineButton('<', command, ['/mshft', Date.UTC(prevYear).toString()]),
      makeTelegramInlineButton('>', command, ['/mshft', Date.UTC(nextYear).toString()]),
    ],
    [makeTelegramInlineButton('Cancel', command, [cancelCommand])],
  );

  return telegramCalendarKeyboardButtons;
}
