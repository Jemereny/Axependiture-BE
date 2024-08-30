import {
  OperationArgs,
  OperationRunResponse,
  OperationServices,
  TelegramOperation,
  TelegramOperationResponse,
  TelegramParsedArgs,
} from '../operations';

type CancelParsedArgs = null;
type CancelOperationServices = OperationServices;
interface RunResponse extends OperationRunResponse {
  type: 'success';
}

export class CancelOperation extends TelegramOperation<
  CancelParsedArgs,
  RunResponse,
  CancelOperationServices
> {
  public static operationCommand = '/cncl';
  constructor(telegramOperationArgs: OperationArgs<CancelOperationServices>) {
    super(telegramOperationArgs, {}, { success: successResponse });
  }

  public override GetOperationCommand(): string {
    return CancelOperation.operationCommand;
  }

  protected override isValidArgs(commandArgs: string[]): boolean {
    return true;
  }
  protected override parseArgs(commandArgs: string[]): TelegramParsedArgs<CancelParsedArgs> {
    return {
      args: null,
    };
  }
  protected override async run(
    args: CancelParsedArgs,
    services: CancelOperationServices,
  ): Promise<RunResponse> {
    return {
      type: 'success',
    };
  }
}

async function successResponse(runResponse: RunResponse): Promise<TelegramOperationResponse> {
  return {
    message: 'Your command has been cancelled.',
  };
}
