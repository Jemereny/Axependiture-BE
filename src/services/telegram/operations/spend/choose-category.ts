import {
  OperationArgs,
  OperationRunResponse,
  OperationServices,
  TelegramOperation,
  TelegramParsedArgs,
} from '../operations';
import { createExpenditure, successResponse } from './common';

type ChooseCategoryParsedArgs = {
  category: string;
  amount: number;
};
type ChooseCategoryOperationServices = OperationServices;

interface OperationAddExpenseSuccess extends OperationRunResponse {
  type: 'success';
  category: string;
  amount: number;
}

type RunResponse = OperationAddExpenseSuccess;

export class ChooseCategory extends TelegramOperation<
  ChooseCategoryParsedArgs,
  RunResponse,
  ChooseCategoryOperationServices
> {
  public static operationCommand = '/ct';

  constructor(telegramOperationArgs: OperationArgs<ChooseCategoryOperationServices>) {
    super(
      telegramOperationArgs,
      {},
      {
        success: successResponse,
      },
    );
  }

  public override GetOperationCommand(): string {
    return ChooseCategory.operationCommand;
  }

  protected override isValidArgs(commandArgs: string[]): boolean {
    return true;
  }
  protected override parseArgs(commandArgs: string[]): TelegramParsedArgs<ChooseCategoryParsedArgs> {
    return {
      args: {
        category: commandArgs[0],
        amount: Number(commandArgs[1]),
      },
    };
  }
  protected override async run(
    args: ChooseCategoryParsedArgs,
    services: ChooseCategoryOperationServices,
  ): Promise<RunResponse> {
    const { amount, category } = args;
    const { dynamoDBPersistence } = services;

    await createExpenditure(dynamoDBPersistence, amount, category, new Date());

    return {
      type: 'success',
      amount,
      category,
    };
  }
}
