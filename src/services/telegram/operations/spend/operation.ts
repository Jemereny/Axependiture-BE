import { makeTelegramInlineButton } from '../../../../utils/telegram-inline-button';
import {
  OperationArgs,
  OperationRunResponse,
  OperationServices,
  TelegramOperation,
  TelegramOperationResponse,
  TelegramParsedArgs,
} from '../operations';
import { OperationAddExpenseSuccess, createExpenditure, successResponse } from './common';
import { ChooseCategory } from './choose-category';
import { CancelOperation } from '../common/cancel';

type SpendParsedArgs = {
  amount: number;
  category?: string;
  expenditureDate?: Date;
};
type SpendOperationServices = OperationServices;

// Internal operations to see if user has provided enough arguments for `/spend` operation
interface OperationShowCategories extends OperationRunResponse {
  type: 'showCategories';
  // Store this info to be used when user replies with command
  amount: number;
  availableCategories: string[];
}

type RunResponse = OperationAddExpenseSuccess | OperationShowCategories;

export class SpendOperation extends TelegramOperation<SpendParsedArgs, RunResponse, SpendOperationServices> {
  public static operationCommand = '/spend';
  constructor(telegramOperationArgs: OperationArgs<SpendOperationServices>) {
    super(
      telegramOperationArgs,
      {
        [ChooseCategory.operationCommand]: ChooseCategory,
        [CancelOperation.operationCommand]: CancelOperation,
      },
      {
        success: successResponse,
        showCategories: showCategoriesResponse,
      },
    );
  }

  public override GetOperationCommand(): string {
    return SpendOperation.operationCommand;
  }

  protected override isValidArgs(commandArgs: string[]): boolean {
    if (commandArgs.length === 1) {
      return !Number.isNaN(commandArgs[0]);
    } else if (commandArgs.length >= 2) {
      // for sub command
      return !Number.isNaN(commandArgs[0]);
    }

    return false;
  }
  protected override parseArgs(commandArgs: string[]): TelegramParsedArgs<SpendParsedArgs> {
    return {
      args: {
        amount: Number(commandArgs[0]),
        category: commandArgs[1] ? commandArgs[1].toUpperCase() : undefined,
        expenditureDate: commandArgs[2] ? new Date(commandArgs[2]) : undefined,
      },
    };
  }
  protected override async run(
    args: SpendParsedArgs,
    services: SpendOperationServices,
  ): Promise<RunResponse> {
    const { amount, category, expenditureDate } = args;
    const { dynamoDBPersistence } = services;

    if (!category) {
      // If user did not enter category, return categories available
      const categoriesOfUser = await dynamoDBPersistence.getCategories();
      return {
        type: 'showCategories',
        amount,
        availableCategories: categoriesOfUser,
      };
    }

    await createExpenditure(dynamoDBPersistence, amount, category, expenditureDate);

    return {
      type: 'success',
      amount,
      category,
    };
  }
}

async function showCategoriesResponse(
  runResponse: OperationShowCategories,
): Promise<TelegramOperationResponse> {
  const { availableCategories, amount } = runResponse;
  // Show available categories for user to choose
  const buttons = availableCategories.map((category) => [
    makeTelegramInlineButton(category, SpendOperation.operationCommand, [
      ChooseCategory.operationCommand,
      category,
      amount.toString(),
    ]),
  ]);

  buttons.push([
    makeTelegramInlineButton('Cancel', SpendOperation.operationCommand, [CancelOperation.operationCommand]),
  ]);

  return {
    message: `Select categories`,
    replyMarkup: {
      inline_keyboard: buttons,
    },
  };
}
