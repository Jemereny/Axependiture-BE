import { StackContext, Api, use } from 'sst/constructs';
import { Storage } from './storage';

export function API({ app, stack }: StackContext) {
  const table = use(Storage);

  throw new Error('Secret and Bot token not implemented');
  const api = new Api(stack, 'TelegramHooks', {
    defaults: {
      function: {
        timeout: 30, // 30s
        environment: {
          SECRET_TOKEN: app.stage === 'prod' ? '' : '',
          BOT_TOKEN: app.stage === 'prod' ? '' : '',
          TABLE_NAME: table.tableName,
        },
        bind: [table],
      },
    },
    // TODO: Add custom domain
    accessLog: {
      retention: 'one_month',
    },
    // TODO: To add api key to authorize calls from bot
    routes: {
      'POST /update': 'src/handlers/telegram/index.main',
    },
  });

  return api;
}
