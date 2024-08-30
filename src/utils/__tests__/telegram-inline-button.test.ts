import { makeTelegramInlineButton } from '../telegram-inline-button';

describe('makeTelegramInlineButton', () => {
  test('should return valid telegram inline keyboard button', () => {
    const output = makeTelegramInlineButton('text', '/command', ['subCommand', 'data1', 'data2']);
    expect(output).toEqual({ text: 'text', callback_data: '/command subCommand data1 data2' });
  });

  test('should return valid callback_data as /command if no extra values are given', () => {
    const output = makeTelegramInlineButton('text', '/command', []);
    expect(output).toEqual({ text: 'text', callback_data: '/command' });
  });

  test('should return telegram inline keyboard button with a single space for callback_data when empty string is passed for commands and values', () => {
    const output = makeTelegramInlineButton('text', '', []);
    expect(output).toEqual({ text: 'text', callback_data: ' ' });
  });
});
