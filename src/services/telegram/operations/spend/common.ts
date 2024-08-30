import { DynamoDBPersistence } from '../../../dynamodb';
import { OperationRunResponse, TelegramOperationResponse } from '../operations';

export interface OperationAddExpenseSuccess extends OperationRunResponse {
  type: 'success';
  category: string;
  amount: number;
}

export async function createExpenditure(
  dynamoDBPersistence: DynamoDBPersistence,
  amount: number,
  categoryName: string,
  expenditureDate: Date = new Date(),
) {
  console.log(`Creating expenditure for ${amount} ${categoryName}`);
  await dynamoDBPersistence.addCategory({ categoryName });
  await dynamoDBPersistence.createExpenditure({
    amount,
    category: categoryName,
    expenditureDate: expenditureDate,
  });
}

// Responses
export async function successResponse(
  runResponse: OperationAddExpenseSuccess,
): Promise<TelegramOperationResponse> {
  return {
    message: `Expenditure for ${runResponse.category} recorded\!`,
  };
}
