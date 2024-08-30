import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBPersistence } from './dynamodb';

export function makeDynamoDBPersistence(telegramId: number) {
  const dynamoDBClient = new DynamoDBClient({});
  return DynamoDBPersistence.fromDynamoDBClient(dynamoDBClient, telegramId);
}
