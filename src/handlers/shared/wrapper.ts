import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context } from 'aws-lambda';
import { Update as TelegramUpdateDto } from 'node-telegram-bot-api';
import { ApiHandler } from 'sst/node/api';
import { getEnvValue } from '../../utils/config';

// Telegram's secret header key set in https://core.telegram.org/bots/api#setwebhook
const SECRET_HEADER_KEY = 'x-telegram-bot-api-secret-token';

export const telegramHttpWrapper = (
  // TODO: Response to be wrapped with a service to generate responses
  operationController: (body: TelegramUpdateDto) => Promise<APIGatewayProxyStructuredResultV2 | void>,
) => {
  const handler = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyStructuredResultV2 | void> => {
    console.info('Event Received:', JSON.stringify(event));

    const secret_token = event.headers[SECRET_HEADER_KEY];
    if (!secret_token || secret_token !== getEnvValue('SECRET_TOKEN')) {
      console.info('Invalid secret_token key provided');
      return {
        statusCode: 403,
      };
    }
    const body = JSON.parse(event.body!) as TelegramUpdateDto;
    const response = await operationController(body);
    return response;
  };

  return ApiHandler(handler);
};
