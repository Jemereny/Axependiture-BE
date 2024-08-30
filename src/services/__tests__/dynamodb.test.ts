import { Table } from 'dynamodb-onetable';
import { DynamoDBPersistence } from '../dynamodb';

const createMockModel = () => ({
  create: jest.fn(),
  get: jest.fn(),
});

class MockTable {
  userModelMock = createMockModel();
  categoryModelMock = createMockModel();
  expenditureModelMock = createMockModel();

  addContext() {}

  getModel(value: string) {
    const model = {
      User: this.userModelMock,
      Category: this.categoryModelMock,
      Expenditure: this.expenditureModelMock,
    }[value];

    if (!model) {
      throw new Error('Model is not defined in tests');
    }

    return model;
  }
}

describe('DynamoDBPersistence', () => {
  let dynamoDBPersistence: DynamoDBPersistence;
  let mockedTable: MockTable;
  beforeEach(() => {
    mockedTable = new MockTable();
    dynamoDBPersistence = new DynamoDBPersistence(mockedTable as unknown as Table, 1);
    jest.resetAllMocks();
  });
  describe('createUser', () => {
    test('should return user after creating user', async () => {
      await dynamoDBPersistence.createUser(1);
      expect(mockedTable.userModelMock.create).toBeCalled();
    });
  });
});
