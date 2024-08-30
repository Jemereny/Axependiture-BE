import { daysToWeeks, set, setHours } from 'date-fns';
import TelegramBot from 'node-telegram-bot-api';
import { generateTelegramCalendar, parseTelegramCalendarCommand } from '../utils/telegram-calendar';
import { makeTelegramInlineButton } from '../utils/telegram-inline-button';

const BOT_TOKEN = '6381557521:AAHvUBL7zy4qlLpeQ0jQ8S0r-oGJM5P2aJM';

async function run() {
  const bot = new TelegramBot(BOT_TOKEN, {
    polling: false,
    webHook: false,
  });

  // console.log(generateTelegramCalendar(2023, 10, 'test'));
  console.log(new Date(1689292800000));
  console.log(parseTelegramCalendarCommand(['', 'next', '1689292800000']));
  // console.log(makeTelegramInlineButton(' ', ' ', ' ', []));

  // await bot.editMessageText('*Select your timezone in UTC*', {
  //   reply_markup: {
  //     inline_keyboard: [[{ text: 'July 2023', callback_data: ' ' }]],
  //   },
  //   chat_id: 227035704,
  //   message_id: 198,
  //   parse_mode: 'Markdown',
  // });

  // await bot.sendMessage(227035704, 'Hello world', {
  //   reply_markup: {
  //     inline_keyboard: [
  //       Array(5)
  //         .fill(null)
  //         .map((_, index) => generateInlineKeyboardButton(`+${index}`, `+${index}`)),
  //       Array(5)
  //         .fill(null)
  //         .map((_, index) => generateInlineKeyboardButton(`-${index}`, `-${index}`)),
  //     ],
  //   },
  // });
}

// function generateInlineKeyboardButton(text: string, callback_data: string) {
//   return {
//     text,
//     callback_data,
//   };
// }

run().then();

// const date = new Date();

// console.log(date);
// date.setUTCHours(0);
// date.setUTCMinutes(0);
// date.setUTCSeconds(0);

// console.log(date);

// console.log(set(date, { hours: 0, minutes: 0 }));
