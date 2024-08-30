import { generateTelegramCalendar } from '../../../../utils/telegram-calendar';
import { makeTelegramInlineButton } from '../../../../utils/telegram-inline-button';
import { formatDate, getDateFromOffset } from '../../../../utils/timezone-offset';
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
import { SpendOperation } from '../spend/operation';
import { ExpenditureCalendarSelectOperation } from './calendar/select';

type CustomDateParsedArgs = null;
type CustomDateOperationServices = OperationServices;
interface RunResponse extends OperationRunResponse {
  type: 'success';
  currentDate: Date;
  categoryToExpenditure: Record<string, number>;
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
    const { dynamoDBPersistence } = services;

    const persistenceTimezoneOffset = await dynamoDBPersistence.getTimezoneOffset();

    // Default offset to +00:00 if timezone is not set
    const currentDate = getDateFromOffset(new Date(), persistenceTimezoneOffset || '+00:00');
    const startDate = new Date(currentDate);
    startDate.setUTCHours(0);
    startDate.setUTCMinutes(0);
    startDate.setUTCSeconds(0);

    const endDate = new Date(currentDate);
    endDate.setUTCHours(23);
    endDate.setUTCMinutes(59);
    endDate.setUTCSeconds(59);

    const expenditures = await dynamoDBPersistence.getExpenditureForDateRange({
      startDateInUTC: startDate,
      endDateInUTC: endDate,
    });

    const categoryToExpenditure = expenditures.reduce((acc, value) => {
      acc[value.category] = acc[value.category] || 0;
      acc[value.category] += value.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      type: 'success',
      currentDate,
      categoryToExpenditure,
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
