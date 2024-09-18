/**
 * Forms a calendar in a 2D array from mon-sun, including the
 *
 * e.g
 *
 *      July 2023
 * MO TU WE TH FR SA SU
 *                 1  2
 *  3  4  5  6  7  8  9
 * ...
 * 30 31
 * PREV            NEXT
 */

import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { makeTelegramInlineButton } from './telegram-inline-button';

const DAYS_IN_A_WEEK = 7;
const monthIndexToMonth: Record<number, string> = {
  0: 'January',
  1: 'February',
  2: 'March',
  3: 'April',
  4: 'May',
  5: 'June',
  6: 'July',
  7: 'August',
  8: 'September',
  9: 'October',
  10: 'November',
  11: 'December',
};
export const BUTTON_CALLBACK_CALENDAR_COMMAND = 'calendar';

/**
 * Generates a calendar with Sunday being the first day of the week
 *
 * @param year the year to generate calendar
 * @param month is zero-indexed
 * @returns an array of arrays of dates of the week. e.g. [[undefined, undefined,1,2,3,4,5],[6,7,8,9,10,11,12], ...] - 1st day of the month is wednesday
 */
export function generateCalendar(year: number, month: number): (number | undefined)[][] {
  const startDate = new Date(Date.UTC(year, month, 1));
  const endDate = new Date(Date.UTC(year, month + 1, 0));

  const firstDayDate = startDate.getUTCDate();
  const lastDayDate = endDate.getUTCDate();
  const firstDayOftheWeek = startDate.getDay();
  const calendar: (number | undefined)[][] = [];

  // To set dates of the week
  let datesOfTheWeek: (number | undefined)[] = [];

  let dayIndexer = firstDayOftheWeek % DAYS_IN_A_WEEK;

  // If sunday is not the first day of the week in the month, pad it with undefined
  if (dayIndexer !== 0) {
    datesOfTheWeek.push(...Array(dayIndexer).fill(undefined));
  }

  for (let i = firstDayDate; i <= lastDayDate; ++i) {
    datesOfTheWeek.push(i);
    ++dayIndexer;
    dayIndexer %= DAYS_IN_A_WEEK;

    if (dayIndexer === 0) {
      calendar.push(datesOfTheWeek);
      datesOfTheWeek = [];
    }
  }

  // If saturday is not the last day of the week, pad it with undefined
  if (dayIndexer !== 0) {
    datesOfTheWeek.push(...Array(DAYS_IN_A_WEEK - dayIndexer).fill(undefined));
    calendar.push(datesOfTheWeek);
  }

  return calendar;
}

/**
 * Generates the telegram calendar with InlineKeyboardButtons and its callback_data
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
export function generateTelegramCalendar(
  year: number,
  month: number,
  command: string,
  selectCommand: string = '/slct',
  cancelCommand: string = '/cncl',
): InlineKeyboardButton[][] {
  const calendar = generateCalendar(year, month);
  const telegramCalendarKeyboardButtons: InlineKeyboardButton[][] = [];

  // State year
  telegramCalendarKeyboardButtons.push([
    {
      text: `${monthIndexToMonth[month]} ${year}`,
      callback_data: ' ',
    },
  ]);

  const daysOfTheWeek = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  const daysOfTheWeekKeyboardButton: InlineKeyboardButton[] = daysOfTheWeek.map((day) =>
    // Empty command to let buttons do nothing
    makeTelegramInlineButton(day, '', []),
  );

  telegramCalendarKeyboardButtons.push(daysOfTheWeekKeyboardButton);
  for (const week of calendar) {
    const weekKeyboardButtons: InlineKeyboardButton[] = [];
    for (const date of week) {
      weekKeyboardButtons.push(
        date
          ? makeTelegramInlineButton(`${date}`, command, [
              selectCommand,
              Date.UTC(year, month, date).toString(),
            ])
          : makeTelegramInlineButton(' ', '', []),
      );
    }
    telegramCalendarKeyboardButtons.push(weekKeyboardButtons);
  }

  // Next and previous buttons
  telegramCalendarKeyboardButtons.push(
    [
      // TechDebt: To add '/shft' as variable
      makeTelegramInlineButton('<', command, ['/shft', Date.UTC(year, month - 1, 1).toString()]),
      makeTelegramInlineButton('>', command, ['/shft', Date.UTC(year, month + 1, 1).toString()]),
    ],
    [makeTelegramInlineButton('Cancel', command, [cancelCommand])],
  );

  return telegramCalendarKeyboardButtons;
}
