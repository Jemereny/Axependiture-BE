import { generateTelegramMonthlyCalendar } from '../../../../utils/telegram-month-calendar';
import { getDateFromOffset } from '../../../../utils/timezone-offset';
import { CancelOperation } from '../common/cancel';
import {
  OperationArgs,
  OperationRunResponse,
  OperationServices,
  TelegramOperation,
  TelegramOperationResponse,
  TelegramParsedArgs,
} from '../operations';
import { ExpenditureCalendarSelectMonthOperation } from './calendar/select-month';

type ShowCustomMonthParsedArgs = null;
type ShowCustomMonthOperationServices = OperationServices;

interface NoExpenditureResponse extends OperationRunResponse {
  type: 'noExpenditure';
}
interface ShowMonthsResponse extends OperationRunResponse {
  type: 'showMonths';
  earliestExpenditureDate: Date;
  latestExpenditureDate: Date;
}

type RunResponse = NoExpenditureResponse | ShowMonthsResponse;

export class ShowCustomMonthOperation extends TelegramOperation<
  ShowCustomMonthParsedArgs,
  RunResponse,
  ShowCustomMonthOperationServices
> {
  public static operationCommand = '/cstm';
  constructor(telegramOperationArgs: OperationArgs<ShowCustomMonthOperationServices>) {
    super(
      telegramOperationArgs,
      {
        [ExpenditureCalendarSelectMonthOperation.operationCommand]: ExpenditureCalendarSelectMonthOperation,
        [CancelOperation.operationCommand]: CancelOperation,
      },
      { showMonths: showMonthsResponse, noExpenditure: noExpenditureResponse },
    );
  }

  public override GetOperationCommand(): string {
    return ShowCustomMonthOperation.operationCommand;
  }

  protected override isValidArgs(commandArgs: string[]): boolean {
    return true;
  }
  protected override parseArgs(commandArgs: string[]): TelegramParsedArgs<ShowCustomMonthParsedArgs> {
    return {
      args: null,
    };
  }
  protected override async run(
    args: ShowCustomMonthParsedArgs,
    services: ShowCustomMonthOperationServices,
  ): Promise<RunResponse> {
    const { dynamoDBPersistence } = services;
    const earliestExpenditure = await dynamoDBPersistence.getEarliestExpenditure();

    if (!earliestExpenditure) {
      return {
        type: 'noExpenditure',
      };
    }

    const latestExpenditure = await dynamoDBPersistence.getLatestExpenditure();
    const timezoneOffset = (await dynamoDBPersistence.getTimezoneOffset()) || undefined;
    const earliestDate = getDateFromOffset(new Date(earliestExpenditure.expenditureDate), timezoneOffset);
    const latestDate = getDateFromOffset(new Date(latestExpenditure!.expenditureDate), timezoneOffset);
    return {
      type: 'showMonths',
      earliestExpenditureDate: earliestDate,
      latestExpenditureDate: latestDate,
    };
  }
}

async function showMonthsResponse(
  runResponse: ShowMonthsResponse,
  currentExecutionContext: string,
): Promise<TelegramOperationResponse> {
  const { latestExpenditureDate } = runResponse;
  const calendar = generateTelegramMonthlyCalendar(
    latestExpenditureDate.getUTCFullYear(),
    // + 1 as `.getUTCMonth()` is 0-indexed
    // generateTelegramMonthlyCalendar needs an array of +1 size to fill the extra missing month
    // e.g. July returns 6, we need [0...6] in array -> size 7 (6+1)
    new Array(latestExpenditureDate.getUTCMonth() + 1).fill(null).map((_, i) => i),
    currentExecutionContext,
    ExpenditureCalendarSelectMonthOperation.operationCommand,
    CancelOperation.operationCommand,
  );

  return {
    message: 'Select a month below',
    replyMarkup: {
      inline_keyboard: calendar,
    },
  };
}

async function noExpenditureResponse(runResponse: RunResponse): Promise<TelegramOperationResponse> {
  return {
    message: 'No expenditures recorded',
  };
}
