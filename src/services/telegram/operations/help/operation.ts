import {
  OperationArgs,
  OperationRunResponse,
  OperationServices,
  TelegramOperation,
  TelegramOperationResponse,
  TelegramParsedArgs,
} from '../operations';

type HelpParsedArgs = null;
type HelpOperationServices = OperationServices;
interface RunResponse extends OperationRunResponse {
  type: 'success';
}

export class HelpOperation extends TelegramOperation<HelpParsedArgs, RunResponse, HelpOperationServices> {
  public static operationCommand = '/help';
  constructor(telegramOperationArgs: OperationArgs<HelpOperationServices>) {
    super(telegramOperationArgs, {}, { success: successResponse });
  }

  public override GetOperationCommand(): string {
    return HelpOperation.operationCommand;
  }

  protected override isValidArgs(commandArgs: string[]): boolean {
    return true;
  }
  protected override parseArgs(commandArgs: string[]): TelegramParsedArgs<HelpParsedArgs> {
    return {
      args: null,
    };
  }
  protected override async run(args: HelpParsedArgs, services: HelpOperationServices): Promise<RunResponse> {
    return {
      type: 'success',
    };
  }
}

async function successResponse(runResponse: RunResponse): Promise<TelegramOperationResponse> {
  return {
    message:
      'Hello there! This expenditure bot helps you to track expenditures! Available commands:\n\n' +
      '1. /timezone - Sets your current available timezone to ensure expenses are shown correctly\n' +
      '2. /spend amount category - Adds an expenditure for the current day. You can also exclude the command or category (e.g. `/spend 13.50 dinner` or `13.50 dinner` or `13.5`)\n' +
      '3. /remove - Removes an expenditure\n',
  };
}
