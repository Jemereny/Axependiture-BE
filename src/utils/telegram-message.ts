/**
 * Utility to help parse the entire body of text from telegram
 *
 * An example of a message sent from user can be "/command arg1 arg2 ..."
 * This utility helps to split the command from it's args
 * @param text
 * @returns
 */
export function parseCommandAndArgs(text: string): [string, string[]] {
  const [command, ...args] = text.split(' ');
  return [command, args];
}
