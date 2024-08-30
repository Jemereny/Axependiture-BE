import { InlineKeyboardButton } from 'node-telegram-bot-api';

/**
 * E.g. Button example for a button to performs some action
 * {
 *    'text': '>',
 *    'callback_data': '/command data1 data2'
 * }
 * "/command" - is parsed in the handler method to tell us what command generated this inline keyboard
 * "data1 data2" - values passed in
 *
 *
 * @param text shown on the button
 * @param command parsed in handler to dictate what command to call
 * @param values any other values the callback requires to perform the action required
 * @returns InlineKeyboardButton to be directly used in response to telegram's replyMarkup
 */
export function makeTelegramInlineButton(
  text: string,
  command: string,
  values: string[],
): InlineKeyboardButton {
  const callback_data = [command];

  if (values.length) {
    callback_data.push(values.join(' '));
  }

  return {
    text,
    // Default to a character with a single space as telegram does not accept callback_data to be empty
    callback_data: `${callback_data.join(' ') || ' '}`,
  };
}
