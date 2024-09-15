import { makeTelegramInlineButton } from '../../../../utils/telegram-inline-button';
import { LIST_OF_UTC_TIMEZONE_OFFSET } from '../../../../utils/timezone-offset';
import { CancelOperation } from '../common/cancel';
import {
  OperationArgs,
  OperationRunResponse,
  OperationServices,
  TelegramOperation,
  TelegramOperationResponse,
  TelegramParsedArgs,
} from '../operations';

type ChooseTimezoneParsedArgs = {
  chosenTimezoneOffset: string;
};
type ChooseTimezoneOperationServices = OperationServices;
interface RunResponse extends OperationRunResponse {
  type: 'success';
  currentTimezoneOffset: string | null;
}

export class ChooseTimezoneOperation extends TelegramOperation<
  ChooseTimezoneParsedArgs,
  RunResponse,
  ChooseTimezoneOperationServices
> {
  public static operationCommand = '/ct';
  constructor(telegramOperationArgs: OperationArgs<ChooseTimezoneOperationServices>) {
    super(telegramOperationArgs, {}, { success: successResponse });
  }

  public override GetOperationCommand(): string {
    return ChooseTimezoneOperation.operationCommand;
  }

  protected override isValidArgs(commandArgs: string[]): boolean {
    return true;
  }
  protected override parseArgs(commandArgs: string[]): TelegramParsedArgs<ChooseTimezoneParsedArgs> {
    return {
      args: { chosenTimezoneOffset: commandArgs[0] },
    };
  }
  protected override async run(
    args: ChooseTimezoneParsedArgs,
    services: ChooseTimezoneOperationServices,
  ): Promise<RunResponse> {
    const { dynamoDBPersistence } = services;
    const { chosenTimezoneOffset } = args;
    await dynamoDBPersistence.updateTimezoneOffset(chosenTimezoneOffset);

    return {
      type: 'success',
      currentTimezoneOffset: chosenTimezoneOffset,
    };
  }
}

async function successResponse(runResponse: RunResponse): Promise<TelegramOperationResponse> {
  const { currentTimezoneOffset } = runResponse;

  return {
    message: `Your timezone has been changed to UTC${currentTimezoneOffset}`,
  };
}
