import {
  OperationArgs,
  OperationRunResponse,
  OperationServices,
  TelegramOperation,
  TelegramOperationResponse,
  TelegramParsedArgs,
} from './operations';

type TemplateParsedArgs = null;
type TemplateOperationServices = OperationServices;
interface RunResponse extends OperationRunResponse {
  type: 'success';
}

export class TemplateOperation extends TelegramOperation<
  TemplateParsedArgs,
  RunResponse,
  TemplateOperationServices
> {
  public static operationCommand = '/template';
  constructor(telegramOperationArgs: OperationArgs<TemplateOperationServices>) {
    super(telegramOperationArgs, {}, { success: successResponse });
  }

  public override GetOperationCommand(): string {
    return TemplateOperation.operationCommand;
  }

  protected override isValidArgs(commandArgs: string[]): boolean {
    return true;
  }
  protected override parseArgs(commandArgs: string[]): TelegramParsedArgs<TemplateParsedArgs> {
    return {
      args: null,
    };
  }
  protected override async run(
    args: TemplateParsedArgs,
    services: TemplateOperationServices,
  ): Promise<RunResponse> {
    return {
      type: 'success',
    };
  }
}

async function successResponse(runResponse: RunResponse): Promise<TelegramOperationResponse> {
  return {
    message: 'Not implemented',
  };
}
