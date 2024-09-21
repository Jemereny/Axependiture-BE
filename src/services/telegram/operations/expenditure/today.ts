import { makeTelegramInlineButton } from '../../../../utils/telegram-inline-button';
import { formatDate, getDateFromOffset, getDayRangeFromOffset } from '../../../../utils/timezone-offset';
import { CancelOperation } from '../common/cancel';
import {
  OperationArgs,
  OperationRunResponse,
  OperationServices,
  TelegramOperation,
  TelegramOperationResponse,
  TelegramParsedArgs,
} from '../operations';

type TodayParsedArgs = null;
type TodayOperationServices = OperationServices;
interface RunResponse extends OperationRunResponse {
  type: 'success';
  currentDate: Date;
  categoryToExpenditure: Record<string, number>;
}

export class TodayOperation extends TelegramOperation<TodayParsedArgs, RunResponse, TodayOperationServices> {
  public static operationCommand = '/tdy';
  constructor(telegramOperationArgs: OperationArgs<TodayOperationServices>) {
    super(telegramOperationArgs, {}, { success: successResponse });
  }

  public override GetOperationCommand(): string {
    return TodayOperation.operationCommand;
  }

  protected override isValidArgs(commandArgs: string[]): boolean {
    return true;
  }
  protected override parseArgs(commandArgs: string[]): TelegramParsedArgs<TodayParsedArgs> {
    return {
      args: null,
    };
  }
  protected override async run(
    args: TodayParsedArgs,
    services: TodayOperationServices,
  ): Promise<RunResponse> {
    const { dynamoDBPersistence } = services;

    const persistenceTimezoneOffset = await dynamoDBPersistence.getTimezoneOffset();

    // Default offset to +00:00 if timezone is not set
    const currentDateTime = new Date();
    const { startDateTimeInUTC, endDateTimeInUTC } = getDayRangeFromOffset(
      currentDateTime,
      persistenceTimezoneOffset || undefined,
    );
    const expenditures = await dynamoDBPersistence.getExpenditureForDateRange({
      startDateInUTC: startDateTimeInUTC,
      endDateInUTC: endDateTimeInUTC,
    });

    const categoryToExpenditure = expenditures.reduce((acc, value) => {
      acc[value.category] = acc[value.category] || 0;
      acc[value.category] += value.amount;
      return acc;
    }, {} as Record<string, number>);

    const datetimeWithOffset = getDateFromOffset(currentDateTime, persistenceTimezoneOffset || undefined);

    return {
      type: 'success',
      currentDate: datetimeWithOffset,
      categoryToExpenditure,
    };
  }
}

async function successResponse(runResponse: RunResponse): Promise<TelegramOperationResponse> {
  const { currentDate, categoryToExpenditure } = runResponse;
  const expenditureInString = Object.entries(categoryToExpenditure!).reduce(
    (acc, [category, expenditure]) => {
      acc += `\n${category}: ${expenditure}`;
      return acc;
    },
    '',
  );

  return {
    message: `Your expenditure for today, ${formatDate(currentDate, 'do MMM yyyy')}:${expenditureInString}`,
  };
}
