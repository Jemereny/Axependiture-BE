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
const CALENDAR_PREV_COMMAND = 'prev';
const CALENDAR_NEXT_COMMAND = 'next';
const CALENDAR_CANCEL_COMMAND = 'cancel';
const CALENDAR_SELECT_COMMAND = 'select';
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
 * Generates the telegram calendar with InlineKeyboardButtons and it's callback_data
 *
 * E.g. Button example for a button that moves to next month
 * {
 *    'text': '>',
 *    'callback_data': '/command calendar next'
 * }
 * /command - is parsed in the handler method to tell us what command generated this inline keyboard
 * calendar - is parsed in the command's `parsedArgs` method to tell how to handle the callback_data
 * next - actual callback_data to perform action
 * @param year
 * @param month
 * @param command
 * @returns
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
      makeTelegramInlineButton('<', command, ['/shft', Date.UTC(year, month - 1, 1).toString()]),
      makeTelegramInlineButton('>', command, ['/shft', Date.UTC(year, month + 1, 1).toString()]),
    ],
    [makeTelegramInlineButton('Cancel', command, [cancelCommand])],
  );

  return telegramCalendarKeyboardButtons;
}

export type ParsedCalendarArgs =
  | ParsedPrevCommand
  | ParsedNextCommand
  | ParsedCancelCommand
  | ParsedSelectCommand;

type ParsedPrevCommand = {
  subCommand: typeof CALENDAR_PREV_COMMAND;
  prevDate: Date;
};
type ParsedNextCommand = {
  subCommand: typeof CALENDAR_NEXT_COMMAND;
  nextDate: Date;
};
type ParsedCancelCommand = {
  subCommand: typeof CALENDAR_CANCEL_COMMAND;
};
type ParsedSelectCommand = {
  subCommand: typeof CALENDAR_SELECT_COMMAND;
  startDate: Date;
  endDate: Date;
};

export type CalendarCommandRunResponse =
  | {
      callbackCommand: typeof BUTTON_CALLBACK_CALENDAR_COMMAND;
      parsedArgs: ParsedCalendarArgs;
    }
  | CalendarSelectedCommandRunResponse;

export type CalendarSelectedCommandRunResponse = {
  callbackCommand: typeof BUTTON_CALLBACK_CALENDAR_COMMAND;
  parsedArgs: ParsedSelectCommand;
  categoryToExpenditure: Record<string, number>;
};

export function parseTelegramCalendarCommand(argsWithoutCommand: string[]): ParsedCalendarArgs {
  const [_, calendarButtonCommand, value] = argsWithoutCommand;

  switch (calendarButtonCommand) {
    case CALENDAR_PREV_COMMAND:
      const prevDate = new Date(Number(value));
      return {
        subCommand: CALENDAR_PREV_COMMAND,
        prevDate,
      };

    case CALENDAR_NEXT_COMMAND: {
      const nextDate = new Date(Number(value));
      return {
        subCommand: CALENDAR_NEXT_COMMAND,
        nextDate,
      };
    }
    case CALENDAR_CANCEL_COMMAND:
      return {
        subCommand: CALENDAR_CANCEL_COMMAND,
      };
    case CALENDAR_SELECT_COMMAND:
      const startDate = new Date(Number(value));
      startDate.setUTCHours(0);
      startDate.setUTCMinutes(0);
      startDate.setUTCSeconds(0);

      const endDate = new Date(Number(value));
      endDate.setUTCHours(23);
      endDate.setUTCMinutes(59);
      endDate.setUTCSeconds(59);

      console.log(startDate, endDate);
      return {
        subCommand: CALENDAR_SELECT_COMMAND,
        startDate,
        endDate,
      };
    default:
      throw new Error(`Calendar command ${calendarButtonCommand} not handled`);
  }
}
