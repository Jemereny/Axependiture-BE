import { handleTelegramBody, parseMessageText } from '../telegram';
import { Update as TelegramUpdateDto } from 'node-telegram-bot-api';
import { spendOperation } from '../operations/spend/operation';

const mockSpendOperation = jest.mocked(spendOperation);

describe('telegram service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockSpendOperation.isValidArgs = jest.fn().mockReturnValue(true);
    mockSpendOperation.parseArgs = jest.fn();
    mockSpendOperation.run = jest.fn().mockReturnValue('category');
    mockSpendOperation.response = jest.fn().mockReturnValue({ message: '' });
  });
  describe('handleTelegramBody', () => {
    const mockedBody = {
      message: {
        text: '/spend amount value category',
        from: {
          id: 1,
        },
      },
    } as unknown as TelegramUpdateDto;

    describe('Valid command', () => {
      test('should call isValidArgs, parseArgs and run methods for operations', async () => {
        await handleTelegramBody({ body: mockedBody });
        expect(mockSpendOperation.isValidArgs).toBeCalled();
        expect(mockSpendOperation.parseArgs).toBeCalled();
        expect(mockSpendOperation.run).toBeCalled();
        expect(mockSpendOperation.response).toBeCalled();
      });
    });

    describe('Invalid command', () => {
      test('should not call isValidArgs, parseArgs and run methods for operations', async () => {
        const invalidMockedBody = {
          message: {
            text: '',
            from: {
              id: 1,
            },
          },
        } as unknown as TelegramUpdateDto;

        await handleTelegramBody({ body: invalidMockedBody });
        expect(mockSpendOperation.isValidArgs).not.toBeCalled();
        expect(mockSpendOperation.parseArgs).not.toBeCalled();
        expect(mockSpendOperation.run).not.toBeCalled();
        expect(mockSpendOperation.response).not.toBeCalled();
      });
    });

    describe('Valid command but invalid args for command', () => {
      test('should call isValidArgs, but not parseArgs and run methods for operations', async () => {
        mockSpendOperation.isValidArgs = jest.fn().mockReturnValue(false);

        await handleTelegramBody({ body: mockedBody });
        expect(mockSpendOperation.isValidArgs).toBeCalled();
        expect(mockSpendOperation.parseArgs).not.toBeCalled();
        expect(mockSpendOperation.run).not.toBeCalled();
        expect(mockSpendOperation.response).not.toBeCalled();
      });
    });
  });

  describe('parseMessageText', () => {
    test('should split command and args and return them', () => {
      const value = '/spend amount value category';
      const [actualCommand, actualArgs] = parseMessageText(value);

      expect(actualCommand).toEqual('/spend');
      expect(actualArgs).toEqual(expect.arrayContaining(['amount', 'value', 'category']));
    });
  });
});
