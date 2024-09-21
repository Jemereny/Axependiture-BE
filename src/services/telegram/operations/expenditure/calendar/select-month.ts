import { formatDate, getMonthRangeFromOffset } from '../../../../../utils/timezone-offset';
import { CalendarSelectOperation, CalendarSelectParsedArgs } from '../../common/calendar/select';
import {
  OperationArgs,
  OperationRunResponse,
  OperationServices,
  TelegramOperationResponse,
} from '../../operations';

type CalendarSelectMonthOperationServices = OperationServices;

interface SuccessResponse extends OperationRunResponse {
  type: 'success';
  selectedDate: Date;
  categoryToExpenditure: Record<string, number>;
}

type RunResponse = SuccessResponse;

export class ExpenditureCalendarSelectMonthOperation extends CalendarSelectOperation<RunResponse> {
  constructor(telegramOperationArgs: OperationArgs<CalendarSelectMonthOperationServices>) {
    super(telegramOperationArgs, {}, { success: successResponse });
  }

  protected async run(args: CalendarSelectParsedArgs, services: OperationServices): Promise<SuccessResponse> {
    const { selectedDate } = args;
    const { dynamoDBPersistence } = services;

    const timezoneOffset = await dynamoDBPersistence.getTimezoneOffset();
    const { startDateTimeInUTC, endDateTimeInUTC } = getMonthRangeFromOffset(
      selectedDate,
      timezoneOffset || undefined,
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

    return {
      type: 'success',
      selectedDate,
      categoryToExpenditure,
    };
  }
}

async function successResponse(runResponse: RunResponse): Promise<TelegramOperationResponse> {
  const { selectedDate, categoryToExpenditure } = runResponse;

  const expenditureInString = Object.entries(categoryToExpenditure).reduce((acc, [category, expenditure]) => {
    acc += `\n${category}: ${expenditure}`;
    return acc;
  }, '');

  return {
    message: `Your expenditure for ${formatDate(selectedDate, 'MMM yyyy')}:${expenditureInString}`,
  };
}
