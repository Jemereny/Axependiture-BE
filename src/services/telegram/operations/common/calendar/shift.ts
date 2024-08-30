import { generateTelegramCalendar } from '../../../../../utils/telegram-calendar';
import { CancelOperation } from '../cancel';
import {
  OperationArgs,
  OperationRunResponse,
  OperationServices,
  TelegramOperation,
  TelegramOperationResponse,
  TelegramParsedArgs,
} from '../../operations';
import { CalendarSelectOperation } from './select';

type CalendarShiftParsedArgs = {
  nextOrPreviousMonth: Date;
};
type CalendarShiftOperationServices = OperationServices;

interface SuccessResponse extends OperationRunResponse {
  type: 'success';
  date: Date;
  selectOperationCommand: string;
  cancelOperationCommand: string;
}

type RunResponse = SuccessResponse;

export class CalendarShiftOperation extends TelegramOperation<
  CalendarShiftParsedArgs,
  RunResponse,
  CalendarShiftOperationServices
> {
  public static operationCommand = '/shft';
  constructor(telegramOperationArgs: OperationArgs<CalendarShiftOperationServices>) {
    super(telegramOperationArgs, {}, { success: successResponse });
  }

  public override GetOperationCommand(): string {
    return CalendarShiftOperation.operationCommand;
  }

  protected override isValidArgs(commandArgs: string[]): boolean {
    return true;
  }
  protected override parseArgs(commandArgs: string[]): TelegramParsedArgs<CalendarShiftParsedArgs> {
    return {
      args: {
        nextOrPreviousMonth: new Date(Number(commandArgs[0])),
      },
    };
  }
  protected override async run(
    args: CalendarShiftParsedArgs,
    services: CalendarShiftOperationServices,
  ): Promise<RunResponse> {
    const { nextOrPreviousMonth } = args;

    return {
      type: 'success',
      date: nextOrPreviousMonth,
      selectOperationCommand: CalendarSelectOperation.operationCommand,
      cancelOperationCommand: CancelOperation.operationCommand,
    };
  }
}

async function successResponse(
  runResponse: RunResponse,
  currentExecutionContext: string,
): Promise<TelegramOperationResponse> {
  const { date, selectOperationCommand, cancelOperationCommand } = runResponse;
  // Remove current execution context and return command to previous
  // so that the previous command can have context on what is selected
  const previousExecutionContext = currentExecutionContext.substring(
    0,
    currentExecutionContext.lastIndexOf(' '),
  );

  console.log('previousExecutionContext');
  console.log(previousExecutionContext);

  return {
    message: 'Select a date below',
    replyMarkup: {
      inline_keyboard: generateTelegramCalendar(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        previousExecutionContext,
        selectOperationCommand,
        cancelOperationCommand,
      ),
    },
  };
}
