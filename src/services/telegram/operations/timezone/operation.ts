import { makeTelegramInlineButton } from '../../../../utils/telegram-inline-button';
import { LIST_OF_UTC_TIMEZONE_OFFSET } from '../../../../utils/timezone-offset';
import { CancelOperation } from '../common/cancel';
import {
  OperationArgs,
  OperationRunResponse,
  OperationServices,
  TelegramOperation,
  TelegramOperationResponse,
  TelegramParsedArgs,
} from '../operations';
import { ChooseTimezoneOperation } from './choose-timezone';

type TimezoneParsedArgs = null;
type TimezoneOperationServices = OperationServices;
interface RunResponse extends OperationRunResponse {
  type: 'success';
  currentTimezoneOffset: string | null;
}

export class TimezoneOperation extends TelegramOperation<
  TimezoneParsedArgs,
  RunResponse,
  TimezoneOperationServices
> {
  public static operationCommand = '/timezone';
  constructor(telegramOperationArgs: OperationArgs<TimezoneOperationServices>) {
    super(
      telegramOperationArgs,
      {
        [ChooseTimezoneOperation.operationCommand]: ChooseTimezoneOperation,
        [CancelOperation.operationCommand]: CancelOperation,
      },
      { success: successResponse },
    );
  }

  public override GetOperationCommand(): string {
    return TimezoneOperation.operationCommand;
  }

  protected override isValidArgs(commandArgs: string[]): boolean {
    return true;
  }
  protected override parseArgs(commandArgs: string[]): TelegramParsedArgs<TimezoneParsedArgs> {
    return {
      args: null,
    };
  }
  protected override async run(
    args: TimezoneParsedArgs,
    services: TimezoneOperationServices,
  ): Promise<RunResponse> {
    const { dynamoDBPersistence } = services;
    const currentTimezoneOffset = await dynamoDBPersistence.getTimezoneOffset();

    return {
      type: 'success',
      currentTimezoneOffset,
    };
  }
}

async function successResponse(runResponse: RunResponse): Promise<TelegramOperationResponse> {
  const { currentTimezoneOffset } = runResponse;
  // Maybe put into some sort of formatter?
  const row = 6;
  const col = 6;

  const buttons = [];

  for (let i = 0; i < row; ++i) {
    const rowButtons = [];
    for (let j = 0; j < col; ++j) {
      const offset = LIST_OF_UTC_TIMEZONE_OFFSET[i * row + j];
      rowButtons.push(
        makeTelegramInlineButton(offset, TimezoneOperation.operationCommand, [
          ChooseTimezoneOperation.operationCommand,
          offset,
        ]),
      );
    }

    buttons.push(rowButtons);
  }

  const remaining = LIST_OF_UTC_TIMEZONE_OFFSET.length - row * col;
  const remainingButtons = [];
  for (let i = 0; i < remaining; ++i) {
    const offset = LIST_OF_UTC_TIMEZONE_OFFSET[row * col + i];
    remainingButtons.push(
      makeTelegramInlineButton(offset, TimezoneOperation.operationCommand, [
        ChooseTimezoneOperation.operationCommand,
        offset,
      ]),
    );
  }
  buttons.push(remainingButtons);
  buttons.push([
    makeTelegramInlineButton('Cancel', TimezoneOperation.operationCommand, [
      CancelOperation.operationCommand,
    ]),
  ]);

  return {
    message: `*Select your timezone in UTC*\nCurrent Timezone: ${currentTimezoneOffset || 'None'}`,
    replyMarkup: {
      inline_keyboard: buttons,
    },
  };
}
