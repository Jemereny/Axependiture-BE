import { generateTelegramCalendar } from '../../../../utils/telegram-calendar';
import { CalendarShiftOperation } from '../common/calendar/shift';
import { CancelOperation } from '../common/cancel';
import {
  OperationArgs,
  OperationRunResponse,
  OperationServices,
  TelegramOperation,
  TelegramOperationResponse,
  TelegramParsedArgs,
} from '../operations';
import { ExpenditureCalendarSelectOperation } from './calendar/select';

type CustomDateParsedArgs = null;
type CustomDateOperationServices = OperationServices;
interface RunResponse extends OperationRunResponse {
  type: 'success';
}

export class CustomDateOperation extends TelegramOperation<
  CustomDateParsedArgs,
  RunResponse,
  CustomDateOperationServices
> {
  public static operationCommand = '/cst';
  constructor(telegramOperationArgs: OperationArgs<CustomDateOperationServices>) {
    super(
      telegramOperationArgs,
      {
        [CalendarShiftOperation.operationCommand]: CalendarShiftOperation,
        [ExpenditureCalendarSelectOperation.operationCommand]: ExpenditureCalendarSelectOperation,
        [CancelOperation.operationCommand]: CancelOperation,
      },
      { success: successResponse },
    );
  }

  public override GetOperationCommand(): string {
    return CustomDateOperation.operationCommand;
  }

  protected override isValidArgs(commandArgs: string[]): boolean {
    return true;
  }
  protected override parseArgs(commandArgs: string[]): TelegramParsedArgs<CustomDateParsedArgs> {
    return {
      args: null,
    };
  }
  protected override async run(
    args: CustomDateParsedArgs,
    services: CustomDateOperationServices,
  ): Promise<RunResponse> {
    return {
      type: 'success',
    };
  }
}

async function successResponse(
  runResponse: RunResponse,
  currentExecutionContext: string,
): Promise<TelegramOperationResponse> {
  const date = new Date();
  const calendar = generateTelegramCalendar(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    // Ensure buttons have current context to call this method again
    currentExecutionContext,
    ExpenditureCalendarSelectOperation.operationCommand,
    CancelOperation.operationCommand,
  );

  return {
    message: 'Select a date below',
    replyMarkup: {
      inline_keyboard: calendar,
    },
  };
}
