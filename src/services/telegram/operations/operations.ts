import { InlineKeyboardMarkup } from 'node-telegram-bot-api';
import { DynamoDBPersistence } from '../../dynamodb';
import { ArgumentError } from '../../../errors';

export interface OperationServices {
  dynamoDBPersistence: DynamoDBPersistence;
}

export interface OperationArgs<Services extends OperationServices = OperationServices> {
  telegramId: number;
  // Actual command line arguments that are split but not yet parsed
  commandArgs: string[];
  // Services that are required for the command to successfully run.
  // E.g. { DynamoDBPersistenceService }
  operationServices: Services;
}

export interface TelegramOperationResponse {
  message: string;
  replyMarkup?: InlineKeyboardMarkup;
}

export type TelegramParsedArgs<T> = {
  args: T;
};

export interface OperationRunResponse {
  type: string;
}

export type OperationResponseMethod<T extends OperationRunResponse = OperationRunResponse> = (
  runResponse: T,
) => Promise<TelegramOperationResponse>;

// Note in case forgot:
// The type "new (args: OperationArgs) => TelegramOperation" is a type that takes in a constructor
export type OperationConstructorMethod = new (args: OperationArgs) => TelegramOperation<any, any, any>;
export type OperationNameToOperationType = Record<string, OperationConstructorMethod>;

// Ensures the types of the mapping from "operationType": "operationResponseMethod" is correct
export type ResponseRegistry<T extends OperationRunResponse> = {
  [K in T['type']]: (
    runResponse: Extract<T, { type: K }>,
    currentExecutionContext: string,
  ) => Promise<TelegramOperationResponse>;
};

export abstract class TelegramOperation<
  ParsedArgs = {},
  RunResponse extends OperationRunResponse = OperationRunResponse,
  Services extends OperationServices = OperationServices,
> {
  constructor(
    protected readonly telegramOperationArgs: OperationArgs<Services>,
    /**
     * "Subcommands" are responses to inline button reponses (user tap)
     * Theses responses will be generated from the command that created the buttons
     * Each button generated should return main context of the command and the arguments it should give depending on the button pressed
     *
     * Example: There are 3 buttons, user pressed button 2: "/MainCommand1 /SubCommand2 args1 args 2"
     * The main handler will first parse /Command1 and the command itself will parse and run /Command2 onwards
     * Response will come from the last command executed
     * Reason this is done is because there isn't a need for internal commands to even exist if the first command doesn't exist
     */
    private readonly subCommands: OperationNameToOperationType,
    private readonly responseRegistry: ResponseRegistry<RunResponse>,
  ) {}

  /**
   * The operation of the command to be run
   * e.g. "/spend"
   */
  public static operationCommand = 'Template';

  // To return operationCommand
  public abstract GetOperationCommand(): string;

  protected abstract isValidArgs(commandArgs: string[]): boolean;

  // Assumption is that all commands start with '/' character
  // For subcommands, they will start with the main command's command, then subcommand as second arguemnt
  // i.e. /spend /ct category 5, each time the command is executed, the command's invoking context is stripped
  // /spend /ct category 5 -> /ct category 5 -> category 5 -> parseArgs([category, 5]);
  protected isSubCommand(commandArgs: string[]): boolean {
    return commandArgs.length ? commandArgs[0].charAt(0) === '/' : false;
  }
  protected abstract parseArgs(commandArgs: string[]): TelegramParsedArgs<ParsedArgs>;
  protected abstract run(args: ParsedArgs, services: Services): Promise<RunResponse>;
  protected response(
    runResponse: RunResponse,
    currentExecutionContext: string,
  ): Promise<TelegramOperationResponse> {
    const responseCallback = this.responseRegistry[runResponse.type as keyof ResponseRegistry<RunResponse>];

    if (!responseCallback) {
      throw new Error('Not implemented exception');
    }

    // TechDebt: Not sure how to fix this typing issue yet.
    return responseCallback(runResponse as any, currentExecutionContext);
  }

  // Subcommands
  protected async runSubcommand(
    telegramId: number,
    operationServices: Services,
    messageCommand: string,
    commandArgs: string[],
    executionContext: string,
  ): Promise<TelegramOperationResponse> {
    const telegramOperationArgs: OperationArgs = {
      telegramId,
      commandArgs: commandArgs,
      operationServices: operationServices,
    };

    const SubCommand = this.subCommands[messageCommand];
    const command = new SubCommand(telegramOperationArgs);
    const response = await command.execute(executionContext);
    return response;
  }

  /**
   *
   * @param executionContext contains the execution context of the command to determine the current command that is running
   * This is used for responses for buttons for the current command
   * Example: '/spend' if the Spend command is run
   */
  public async execute(executionContext: string = ''): Promise<TelegramOperationResponse> {
    console.log(`Executing command: ${executionContext}`);
    const commandArgs = this.telegramOperationArgs.commandArgs;
    if (!this.isValidArgs(commandArgs)) {
      throw new ArgumentError(`Invalid arguments provided: ${this.telegramOperationArgs.commandArgs}`);
    }
    const parsedArgs = this.parseArgs(commandArgs);
    const currentExecutionContext =
      executionContext === ''
        ? this.GetOperationCommand()
        : [executionContext, this.GetOperationCommand()].join(' ');
    // Run subcommand if it exists within command
    if (this.isSubCommand(commandArgs)) {
      const [subcommand, ...subCommandArgs] = commandArgs;
      const subcommandResponse = await this.runSubcommand(
        this.telegramOperationArgs.telegramId,
        this.telegramOperationArgs.operationServices,
        subcommand,
        subCommandArgs,
        currentExecutionContext,
      );

      return subcommandResponse;
    }
    const runResponse = await this.run(parsedArgs.args, this.telegramOperationArgs.operationServices);
    const response = await this.response(runResponse, currentExecutionContext);

    return response;
  }
}
