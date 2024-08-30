import { Update as TelegramUpdateDto, InlineKeyboardMarkup, CallbackQuery } from 'node-telegram-bot-api';
import { parseCommandAndArgs } from '../../utils/telegram-message';
import { getCommand } from './operations/available-commands';
import { makeDynamoDBPersistence } from '../common';
import { OperationArgs } from './operations/operations';
import { ArgumentError } from '../../errors';
import { HelpOperation } from './operations/help/operation';

export interface TelegramHandlerResponse {
  chatId: number;
  response: string;
  replyMarkup?: InlineKeyboardMarkup;
  isCallback: boolean;
  messageId: number;
}

/**
 * Helper method that is called to parse telegram body's dto
 * @param {TelegramUpdateDto} args from telegram
 * @returns
 */
export async function handleTelegramBody(args: {
  body: TelegramUpdateDto;
}): Promise<TelegramHandlerResponse | undefined> {
  const { body } = args;
  // For now, ignore all messages that are edited
  if (body.message && body.message.from) {
    console.info('Handling message command');
    return await invokeTelegramMessageCommand(body.message.from.id, body.message.text!);
  } else if (
    body.callback_query &&
    body.callback_query.message &&
    body.callback_query.from &&
    body.callback_query.data
  ) {
    console.info('Handling callback query');
    return await invokeTelegramMessageCommand(
      body.callback_query.from.id,
      body.callback_query.data,
      body.callback_query.message.message_id, // Return callback's message id edits the message
    );
  }
}

/**
 *
 * @param telegramId of user
 * @param text message sent by user
 * @param messageId message id to edit if the message is a callback
 * @returns {TelegramHandlerResponse}
 */
export async function invokeTelegramMessageCommand(
  telegramId: number,
  text: string,
  messageId?: number,
): Promise<TelegramHandlerResponse> {
  const [messageCommand, messageArgs] = parseCommandAndArgs(text);
  console.info(`Parsing message text: ${[messageCommand]}, [${messageArgs}]`);

  // Default to Help command if undefined command is sent
  const TelegramCommand = getCommand(messageCommand) ?? HelpOperation;
  const dynamoDBPersistence = makeDynamoDBPersistence(telegramId);
  const telegramOperationArgs: OperationArgs = {
    telegramId,
    commandArgs: messageArgs,
    operationServices: {
      dynamoDBPersistence,
    },
  };
  const command = new TelegramCommand(telegramOperationArgs);
  try {
    const response = await command.execute();

    return {
      chatId: telegramId,
      response: response.message,
      replyMarkup: response.replyMarkup,
      isCallback: messageId ? true : false,
      messageId: messageId ?? -1,
    };
  } catch (err) {
    if (err instanceof ArgumentError) {
      const response = await new HelpOperation(telegramOperationArgs).execute();
      return {
        chatId: telegramId,
        response: response.message,
        replyMarkup: response.replyMarkup,
        isCallback: messageId ? true : false,
        messageId: messageId ?? -1,
      };
    }

    throw err;
  }
}
