import { makeTelegramInlineButton } from '../../../../utils/telegram-inline-button';
import { CancelOperation } from '../common/cancel';
import {
  OperationArgs,
  OperationRunResponse,
  OperationServices,
  TelegramOperation,
  TelegramOperationResponse,
  TelegramParsedArgs,
} from '../operations';
import { CustomDateOperation } from './custom-date';
import { ShowCustomMonthOperation } from './show-custom-month';
import { TodayOperation } from './today';

type ExpenditureParsedArgs = null;
type ExpenditureOperationServices = OperationServices;
interface RunResponse extends OperationRunResponse {
  type: 'success';
}

export class ExpenditureOperation extends TelegramOperation<
  ExpenditureParsedArgs,
  RunResponse,
  ExpenditureOperationServices
> {
  public static operationCommand = '/expenditure';
  constructor(telegramOperationArgs: OperationArgs<ExpenditureOperationServices>) {
    super(
      telegramOperationArgs,
      {
        [TodayOperation.operationCommand]: TodayOperation,
        [ShowCustomMonthOperation.operationCommand]: ShowCustomMonthOperation,
        [CustomDateOperation.operationCommand]: CustomDateOperation,
        [CancelOperation.operationCommand]: CancelOperation,
      },
      { success: successResponse },
    );
  }

  public override GetOperationCommand(): string {
    return ExpenditureOperation.operationCommand;
  }

  protected override isValidArgs(commandArgs: string[]): boolean {
    return true;
  }
  protected override parseArgs(commandArgs: string[]): TelegramParsedArgs<ExpenditureParsedArgs> {
    return {
      args: null,
    };
  }
  protected override async run(
    args: ExpenditureParsedArgs,
    services: ExpenditureOperationServices,
  ): Promise<RunResponse> {
    return {
      type: 'success',
    };
  }
}

async function successResponse(runResponse: RunResponse): Promise<TelegramOperationResponse> {
  const buttons = [
    [
      makeTelegramInlineButton('Custom Date', ExpenditureOperation.operationCommand, [
        CustomDateOperation.operationCommand,
      ]),
    ],
    [
      makeTelegramInlineButton('Custom Month', ExpenditureOperation.operationCommand, [
        ShowCustomMonthOperation.operationCommand,
      ]),
    ],
    [
      makeTelegramInlineButton('Today', ExpenditureOperation.operationCommand, [
        TodayOperation.operationCommand,
      ]),
    ],
    [
      makeTelegramInlineButton('Cancel', ExpenditureOperation.operationCommand, [
        CancelOperation.operationCommand,
      ]),
    ],
  ];
  // buttons.push([
  //   makeTelegramInlineButton('Custom Date', INLINE_KEYBOARD_COMMAND_NAME, [
  //     BUTTON_CALLBACK_CUSTOMDATE_COMMAND,
  //   ]),
  // ]);
  // buttons.push([
  //   makeTelegramInlineButton('Current month', INLINE_KEYBOARD_COMMAND_NAME, [
  //     BUTTON_CALLBACK_CURRENTMONTH_COMMAND,
  //   ]),
  // ]);
  // buttons.push([
  //   makeTelegramInlineButton('Today', INLINE_KEYBOARD_COMMAND_NAME, [BUTTON_CALLBACK_TODAY_COMMAND]),
  // ]);

  return {
    message: 'Which expenditure would you like to look at?',
    replyMarkup: {
      inline_keyboard: buttons,
    },
  };
}
