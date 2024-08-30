import TelegramBot, { Update as TelegramUpdateDto } from 'node-telegram-bot-api';
import { telegramHttpWrapper } from '../shared/wrapper';
import { handleTelegramBody } from '../../services/telegram/telegram';
import { getEnvValue } from '../../utils/config';

export const main = telegramHttpWrapper(async (body: TelegramUpdateDto) => {
  const bot = new TelegramBot(getEnvValue('BOT_TOKEN'), {
    polling: false,
    webHook: false,
  });

  try {
    const telegramHandlerResponse = await handleTelegramBody({ body });

    if (!telegramHandlerResponse) {
      return {
        statusCode: 200,
      };
    }

    const { chatId, response, replyMarkup, isCallback, messageId } = telegramHandlerResponse;

    console.log('telegramHandlerResponse');
    console.log(telegramHandlerResponse);

    if (!isCallback) {
      await bot.sendMessage(chatId, response, {
        parse_mode: 'Markdown',
        reply_markup: replyMarkup,
      });
    } else {
      await bot.editMessageText(response, {
        chat_id: chatId,
        reply_markup: replyMarkup,
        message_id: messageId,
      });
    }
    // Maybe can do a try/catch for handleTelegramBody and save failed messages in an SQS to be re-processed
    // For messages that are saved we should also record down time to be used in reprocessing

    // We should always send 200 to notify telegram that message is successfully received
    return {
      statusCode: 200,
    };
  } catch (err) {
    console.error('Unrecoverable error occured', err);

    await bot.sendMessage(
      body.message?.from?.id || body.callback_query!.from.id,
      'Internal bot error occured. Action could not be performed',
    );
  }
});
