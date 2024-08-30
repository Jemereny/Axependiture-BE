import { formatDate } from '../../../../../utils/timezone-offset';
import { CalendarSelectOperation, CalendarSelectParsedArgs } from '../../common/calendar/select';
import {
  OperationArgs,
  OperationRunResponse,
  OperationServices,
  TelegramOperationResponse,
} from '../../operations';

type CalendarSelectOperationServices = OperationServices;

interface SuccessResponse extends OperationRunResponse {
  type: 'success';
  selectedDate: Date;
  categoryToExpenditure: Record<string, number>;
}

type RunResponse = SuccessResponse;

export class ExpenditureCalendarSelectOperation extends CalendarSelectOperation<RunResponse> {
  constructor(telegramOperationArgs: OperationArgs<CalendarSelectOperationServices>) {
    super(telegramOperationArgs, {}, { success: successResponse });
  }

  protected async run(args: CalendarSelectParsedArgs, services: OperationServices): Promise<SuccessResponse> {
    const { selectedDate } = args;
    const { dynamoDBPersistence } = services;

    const startDate = getStartOfDay(selectedDate);
    const endDate = getEndOfDay(selectedDate);

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
    message: `Your expenditure for ${formatDate(selectedDate, 'do MMM yyyy')}:${expenditureInString}`,
  };
}

function getStartOfDay(date: Date) {
  const startDate = new Date(date);
  startDate.setUTCHours(0);
  startDate.setUTCMinutes(0);
  startDate.setUTCSeconds(0);

  return startDate;
}

function getEndOfDay(date: Date) {
  const endDate = new Date(date);
  endDate.setUTCHours(23);
  endDate.setUTCMinutes(59);
  endDate.setUTCSeconds(59);

  return endDate;
}
