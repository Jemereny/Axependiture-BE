import {
  OperationArgs,
  OperationNameToOperationType,
  OperationRunResponse,
  OperationServices,
  ResponseRegistry,
  TelegramOperation,
  TelegramParsedArgs,
} from '../../operations';

export type CalendarSelectParsedArgs = {
  selectedDate: Date;
};
type CalendarSelectOperationServices = OperationServices;

export abstract class CalendarSelectOperation<
  RunResponse extends OperationRunResponse,
> extends TelegramOperation<CalendarSelectParsedArgs, RunResponse, CalendarSelectOperationServices> {
  public static operationCommand = '/slct';
  constructor(
    telegramOperationArgs: OperationArgs<CalendarSelectOperationServices>,
    subCommands: OperationNameToOperationType,
    responseRegistry: ResponseRegistry<RunResponse>,
  ) {
    super(telegramOperationArgs, subCommands, responseRegistry);
  }

  public override GetOperationCommand(): string {
    return CalendarSelectOperation.operationCommand;
  }

  protected override isValidArgs(commandArgs: string[]): boolean {
    return true;
  }
  protected override parseArgs(commandArgs: string[]): TelegramParsedArgs<CalendarSelectParsedArgs> {
    return {
      args: {
        selectedDate: new Date(Number(commandArgs[0])),
      },
    };
  }
}
