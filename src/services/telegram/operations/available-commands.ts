import { ExpenditureOperation } from './expenditure/operation';
import { HelpOperation } from './help/operation';
import { OperationConstructorMethod, OperationNameToOperationType } from './operations';
import { SpendOperation } from './spend/operation';
import { TemplateOperation } from './template-command';

const commandToOperation: OperationNameToOperationType = {
  [TemplateOperation.operationCommand]: TemplateOperation,
  [HelpOperation.operationCommand]: HelpOperation,
  [SpendOperation.operationCommand]: SpendOperation,
  [ExpenditureOperation.operationCommand]: ExpenditureOperation,
};

export function getCommand(command: string): OperationConstructorMethod | undefined {
  return commandToOperation[command];
}
