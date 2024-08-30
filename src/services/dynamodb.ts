import { Table, Entity, Model } from 'dynamodb-onetable';
import { ConditionalCheckFailedException, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { getEnvValue } from '../utils/config';

const mySchema = {
  version: '1.0.0',
  indexes: {
    primary: { hash: 'pk', sort: 'sk' },
  },
  models: {
    User: {
      pk: { type: String, value: 'USER#${telegramId}' },
      sk: { type: String, value: 'INFO#${telegramId}' },
      telegramId: { type: Number, required: true },
      timezoneOffset: { type: String, required: false },
      createdAt: { type: Date, required: true },
    },
    Category: {
      pk: { type: String, value: 'USER#${telegramId}' },
      sk: { type: String, value: 'CATEGORIES#${telegramId}' },
      telegramId: { type: Number, required: true },
      categories: { type: Set, required: true },
    },
    Expenditure: {
      pk: { type: String, value: 'EXPENDITURE#${telegramId}' },
      sk: { type: Date, value: '${expenditureDate}' },
      // Can add new expenditure category
      telegramId: { type: Number, required: true },
      category: { type: String, required: true },
      amount: { type: Number, required: true },
      expenditureDate: { type: Date, required: true },
      createdAt: { type: Date, required: true },
    },
  },
  params: {
    isoDates: true,
  },
} as const;

type User = Entity<typeof mySchema.models.User>;
type Category = Entity<typeof mySchema.models.Category>;
type Expenditure = Entity<typeof mySchema.models.Expenditure>;

export class DynamoDBPersistence {
  private userModel: Model<User>;
  private categoryModel: Model<Category>;
  private expenditureModel: Model<Expenditure>;

  constructor(readonly table: Table, readonly telegramId: number) {
    this.table.addContext({ telegramId });
    this.userModel = this.table.getModel('User');
    this.categoryModel = this.table.getModel('Category');
    this.expenditureModel = this.table.getModel('Expenditure');
  }

  static fromDynamoDBClient(dynamoDBClient: DynamoDBClient, telegramId: number) {
    const table = new Table({
      client: dynamoDBClient,
      schema: mySchema,
      name: getEnvValue('TABLE_NAME'),
      timestamps: true,
      // Allow partial updates to object
      partial: true,
    });

    return new DynamoDBPersistence(table, telegramId);
  }

  async createUser(telegramId: number): Promise<User> {
    try {
      const user = await this.userModel.create(
        {
          telegramId,
          createdAt: new Date(),
        },
        {
          exists: true,
        },
      );

      return user;
    } catch (err) {
      if (err instanceof ConditionalCheckFailedException) {
        console.warn(
          'Creation of user failed with ConditionalCheckFailedException, User already exists',
          JSON.stringify(err.message),
        );
        const user = await this.userModel.get({
          telegramId,
        });

        return user!;
      }
      throw err;
    }
  }

  async updateTimezoneOffset(timezoneOffset: string): Promise<User> {
    const user = await this.userModel.upsert({
      timezoneOffset,
    });

    return user;
  }

  async getTimezoneOffset(): Promise<string | null> {
    const user = await this.userModel.get({});

    if (!user || !user.timezoneOffset) {
      return null;
    }

    return user.timezoneOffset;
  }

  async addCategory(args: { categoryName: string }): Promise<Category> {
    const { categoryName } = args;
    const currentCategories = await this.categoryModel.get({});
    const categories = currentCategories?.categories || new Set();
    categories.add(categoryName);
    const category = await this.categoryModel.upsert({
      categories,
    });

    return category;
  }

  async getCategories(): Promise<string[]> {
    const currentCategories = await this.categoryModel.get({});

    return currentCategories?.categories ? Array.from(currentCategories.categories) : [];
  }

  async createExpenditure(args: {
    category: string;
    amount: number;
    expenditureDate: Date;
  }): Promise<Expenditure> {
    const { category, amount, expenditureDate } = args;
    const expenditure = await this.expenditureModel.create({
      telegramId: this.telegramId,
      category,
      amount,
      expenditureDate,
      createdAt: new Date(),
    });

    return expenditure;
  }

  async getExpenditureForDateRange(args: {
    startDateInUTC: Date;
    endDateInUTC: Date;
  }): Promise<Expenditure[]> {
    const { startDateInUTC, endDateInUTC } = args;

    const expenditures = await this.expenditureModel.find({
      sk: {
        between: [startDateInUTC, endDateInUTC],
      },
    });

    return expenditures;
  }
}
