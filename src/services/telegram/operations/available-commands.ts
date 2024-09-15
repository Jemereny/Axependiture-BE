import { ExpenditureOperation } from './expenditure/operation';
import { HelpOperation } from './help/operation';
import { OperationConstructorMethod, OperationNameToOperationType } from './operations';
import { SpendOperation } from './spend/operation';
import { TemplateOperation } from './template-command';
import { TimezoneOperation } from './timezone/operation';

const commandToOperation: OperationNameToOperationType = {
  [TemplateOperation.operationCommand]: TemplateOperation,
  [HelpOperation.operationCommand]: HelpOperation,
  [SpendOperation.operationCommand]: SpendOperation,
  [ExpenditureOperation.operationCommand]: ExpenditureOperation,
  [TimezoneOperation.operationCommand]: TimezoneOperation,
};

export function getCommand(command: string): OperationConstructorMethod | undefined {
  return commandToOperation[command];
}
